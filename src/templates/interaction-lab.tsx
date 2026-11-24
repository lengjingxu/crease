import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown, ChevronRight, Copy, Download, FileText, Folder, GripVertical, Info, Link2, Send,
  Trash2, Undo2, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeading } from "@/components/kit/page-heading";
import bridge from "@/assets/bridge.svg";
import { Section, SliderRow, clamp, lerp, useReducedMotion } from "./interaction-lab-shared";
import {
  BubblesSection, ContinuitySection, DeleteSection, HoloSection, LoadingSection, ScrollSection,
  ShockSection, ToastSection,
} from "./interaction-lab-more";
import { ChoiceSection, EmptySection, RingSection } from "./interaction-lab-final";
import "./interaction-lab.css";

/* ————— 001 按压按钮：五层拟物材质 ————— */

function PressSection() {
  const [count, setCount] = useState(0);
  const bump = () => setCount(c => c + 1);
  return (
    <Section no="001" title="按压按钮">
      <p className="crease-caption mb-4">五层材质共用一套结构：面渐变、1px 边、顶部高光、底部暗线、双层投影；按下时渐变翻转、外影塌陷、高光换成内阴影。</p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="ilab-skeuo text-sm" onClick={bump}>主要按钮</button>
        <button type="button" className="ilab-skeuo text-sm" data-variant="secondary" onClick={bump}>次要按钮</button>
        <button type="button" className="ilab-skeuo text-sm" data-variant="tertiary" onClick={bump}>三级按钮</button>
        <button type="button" className="ilab-skeuo text-sm" data-variant="ghost" onClick={bump}>幽灵按钮</button>
        <span className="crease-caption" role="status">已响应 {count} 次</span>
      </div>
      <p className="crease-caption mt-6 mb-3">材质随字号等比缩放（u = 字号 / 14，高度、圆角、每层阴影都乘 u）：</p>
      <div className="flex flex-wrap items-end gap-3">
        <button type="button" className="ilab-skeuo" style={{ fontSize: 12 }} onClick={bump}>小 · 12px</button>
        <button type="button" className="ilab-skeuo" style={{ fontSize: 14 }} onClick={bump}>标准 · 14px</button>
        <button type="button" className="ilab-skeuo" style={{ fontSize: 16 }} onClick={bump}>大 · 16px</button>
        <button type="button" className="ilab-skeuo" style={{ fontSize: 20 }} onClick={bump}>特大 · 20px</button>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={bump} className="crease-ink crease-pressable min-h-11 rounded-xl px-5 text-sm font-medium">
          黑亚克力（主题款）
        </button>
        <button
          type="button"
          onClick={bump}
          className="crease-glass crease-pressable block w-full max-w-md rounded-2xl p-5 text-left sm:w-auto sm:flex-1"
        >
          <span className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-base font-medium">整张卡片也可以按</span>
              <span className="mt-1 block text-sm text-muted-foreground">主题的按压面：下沉 1px，内阴影加深。</span>
            </span>
            <Download className="size-5 shrink-0 text-muted-foreground" />
          </span>
        </button>
      </div>
    </Section>
  );
}

/* ————— 002 级联菜单：安全三角 + 三个延迟 ————— */

type CascadeItem = { id: string; label: string; children?: { id: string; label: string }[] };
const cascadeItems: CascadeItem[] = [
  { id: "copy", label: "复制链接" },
  {
    id: "format", label: "导出格式", children: [
      { id: "pdf", label: "PDF 文档" },
      { id: "word", label: "Word 文档" },
      { id: "excel", label: "Excel 表格" },
      { id: "md", label: "Markdown" },
    ],
  },
  {
    id: "send", label: "发送到", children: [
      { id: "mail", label: "邮件" },
      { id: "feishu", label: "飞书" },
      { id: "wechat", label: "微信" },
      { id: "ding", label: "钉钉" },
    ],
  },
  { id: "archive", label: "归档" },
  { id: "delete", label: "删除" },
];

function pointInTriangle(px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  if (d === 0) return false;
  const a = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d;
  const b = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d;
  const c = 1 - a - b;
  return a >= 0 && b >= 0 && c >= 0;
}

function CascadeSection() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef(0);
  const closeTimer = useRef(0);
  const dwellTimer = useRef(0);
  const prevPos = useRef<{ x: number; y: number } | null>(null);
  const pendingRow = useRef<string | null>(null);

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    window.clearInterval(dwellTimer.current);
  };

  const closeAll = useCallback(() => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setSub(null);
      setActive(null);
    }, 360);
  }, []);

  const activate = useCallback((item: CascadeItem) => {
    window.clearTimeout(openTimer.current);
    window.clearInterval(dwellTimer.current);
    openTimer.current = window.setTimeout(() => {
      setActive(item.id);
      setSub(item.children ? item.id : null);
    }, 220);
  }, []);

  const onRowEnter = (item: CascadeItem, e: React.PointerEvent) => {
    window.clearTimeout(closeTimer.current);
    const subEl = subRef.current;
    if (sub && sub !== item.id && subEl && prevPos.current) {
      const r = subEl.getBoundingClientRect();
      const apex = prevPos.current;
      const reach = Math.min(90, Math.max(56, r.width * 0.43));
      const inReach = e.clientX >= r.left - reach && e.clientX <= r.left + 4;
      if (inReach && pointInTriangle(e.clientX, e.clientY, apex.x, apex.y, r.left, r.top, r.left, r.bottom)) {
        pendingRow.current = item.id;
        const started = Date.now();
        window.clearInterval(dwellTimer.current);
        dwellTimer.current = window.setInterval(() => {
          if (Date.now() - started > 1200 || pendingRow.current !== item.id) {
            window.clearInterval(dwellTimer.current);
            if (pendingRow.current === item.id) activate(item);
          }
        }, 80);
        return;
      }
    }
    pendingRow.current = null;
    activate(item);
  };

  const choose = (label: string) => {
    clearTimers();
    setResult(`已选择：${label}`);
    setOpen(false);
    setSub(null);
    setActive(null);
  };

  useEffect(() => {
    if (!open) return;
    const shut = () => {
      clearTimers();
      setOpen(false);
      setSub(null);
      setActive(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") shut();
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) shut();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open ]);

  const rowCls = (id: string) =>
    `flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-medium text-[#263140] ${active === id ? "bg-[rgb(15_23_42/0.07)]" : ""}`;

  return (
    <Section no="002" title="级联菜单">
      <div className="flex flex-wrap items-start gap-4">
        <div
          ref={rootRef}
          className="relative"
          onPointerMove={e => {
            prevPos.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerLeave={closeAll}
        >
          <Button
            className="min-h-11"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => {
              window.clearTimeout(closeTimer.current);
              setOpen(v => !v);
            }}
          >
            <Download />导出<ChevronDown className="size-4" />
          </Button>
          {open && (
            <div role="menu" aria-label="导出菜单" className="ilab-menu ilab-menu-root top-full left-0 mt-2">
              <p className="ilab-menu-head">文件操作</p>
              {cascadeItems.map(item => (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup={item.children ? "menu" : undefined}
                    aria-expanded={item.children ? sub === item.id : undefined}
                    className={rowCls(item.id)}
                    onPointerEnter={e => onRowEnter(item, e)}
                    onFocus={() => {
                      window.clearTimeout(closeTimer.current);
                      setActive(item.id);
                      setSub(item.children ? item.id : null);
                    }}
                    onClick={() => {
                      if (!item.children) choose(item.label);
                      else {
                        setActive(item.id);
                        setSub(item.id);
                      }
                    }}
                  >
                    {item.id === "copy" ? <Link2 className="size-[18px] shrink-0" /> : item.children ? <Folder className="size-[18px] shrink-0" /> : <FileText className="size-[18px] shrink-0" />}
                    <span className="flex-1">{item.label}</span>
                    {item.children && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
                  </button>
                  {item.children && sub === item.id && (
                    <div ref={subRef} role="menu" aria-label={item.label} className="ilab-menu ilab-submenu top-0 left-full -ml-2">
                      <p className="ilab-menu-head">{item.label}</p>
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          type="button"
                          role="menuitem"
                          className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-medium whitespace-nowrap text-[#263140] hover:bg-[rgb(15_23_42/0.07)] focus-visible:bg-[rgb(15_23_42/0.07)]"
                          onPointerEnter={() => window.clearTimeout(closeTimer.current)}
                          onClick={() => choose(child.label)}
                        >
                          <FileText className="size-[18px] shrink-0" />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="crease-caption max-w-xs pt-3" role="status">{result || "悬停「导出格式」后斜向移入子菜单：安全三角内的行不会误触；打开延迟 220ms、关闭 360ms、三角内停留上限 1.2s。"}</span>
      </div>
    </Section>
  );
}

/* ————— 003 ASCII 与抖动：调色板 + 遮罩 + 多级量化 ————— */

const ASCII_CHARS = "  .,:;-=+xX08S#&@";
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
type RGB = [number, number, number];
const PALETTES: { id: string; name: string; stops: [RGB, RGB, RGB, RGB] }[] = [
  { id: "mono", name: "单色", stops: [[21, 21, 21], [87, 87, 87], [166, 166, 166], [236, 236, 236]] },
  { id: "meadow", name: "草地", stops: [[43, 54, 31], [103, 125, 69], [174, 186, 120], [229, 225, 189]] },
  { id: "blue", name: "湖蓝", stops: [[25, 42, 77], [50, 106, 197], [162, 194, 241], [237, 243, 252]] },
  { id: "amber", name: "琥珀", stops: [[60, 32, 15], [167, 76, 21], [239, 154, 70], [247, 231, 202]] },
  { id: "lavender", name: "薰衣草", stops: [[41, 33, 68], [101, 82, 171], [179, 165, 228], [240, 236, 251]] },
];

function paletteColor(stops: [RGB, RGB, RGB, RGB], t: number): RGB {
  const x = clamp(t, 0, 1) * 3;
  const i = Math.min(2, Math.floor(x));
  const f = x - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [Math.round(lerp(a[0], b[0], f)), Math.round(lerp(a[1], b[1], f)), Math.round(lerp(a[2], b[2], f))];
}
const rgbCss = (c: RGB, a = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

function AsciiSection() {
  const [paletteId, setPaletteId] = useState("blue");
  const [asciiSize, setAsciiSize] = useState(9);
  const [ditherSize, setDitherSize] = useState(4);
  const [strength, setStrength] = useState(65);
  const asciiRef = useRef<HTMLCanvasElement>(null);
  const ditherRef = useRef<HTMLCanvasElement>(null);
  const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  const reduced = useReducedMotion();

  useEffect(() => {
    let raf = 0;
    let stopped = false;
    let begin: () => void = () => {};
    const timer = window.setTimeout(() => {
      const W = 480;
      const H = 300;
      const src = document.createElement("canvas");
      src.width = W;
      src.height = H;
      const sctx = src.getContext("2d");
      if (!sctx) return;
      sctx.fillStyle = "#ffffff";
      sctx.fillRect(0, 0, W, H);
      const img = new Image();
      img.onload = () => {
        // cover-fit the real artwork into the sampling canvas
        const scale = Math.max(W / img.width, H / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        sctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        begin();
      };
      img.onerror = () => begin();
      img.src = bridge;

      const render = (tSec: number) => {
        const data = sctx.getImageData(0, 0, W, H).data;
        const lum = (x: number, y: number) => {
          const i = (y * W + x) * 4;
          return (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
        };
        const samples: number[] = [];
        for (let i = 0; i < 12000; i++) {
          const x = Math.floor((i % 120) * (W / 120));
          const y = Math.floor(Math.floor(i / 120) * (H / 100));
          samples.push(lum(clamp(x, 0, W - 1), clamp(y, 0, H - 1)));
        }
        samples.sort((a, b) => a - b);
        const low = samples[Math.floor(samples.length * 0.08)];
        const high = samples[Math.floor(samples.length * 0.92)];
        const norm = (x: number, y: number) => clamp((lum(x, y) - low) / Math.max(0.001, high - low), 0, 1);
        // 原站的效果源是视频、逐帧重绘；这里让一束光在画面上缓慢游走，采样亮度随光移动，字符与颗粒逐帧流动
        const lx = W * (0.5 + 0.36 * Math.sin(tSec * 0.45));
        const ly = H * (0.46 + 0.32 * Math.sin(tSec * 0.62 + 1.3));
        const lit = (x: number, y: number) => {
          const dx = x - lx;
          const dy = y - ly;
          return clamp(norm(x, y) * (0.74 + 0.62 * Math.exp(-(dx * dx + dy * dy) / (2 * 155 * 155))), 0, 1);
        };
        const s = strength / 100;
        const black = 0.22 * s;
        const white = 1 - 0.08 * s;

        // ASCII: tone curve + palette ink
        const ac = asciiRef.current;
        const actx = ac?.getContext("2d");
        if (ac && actx) {
          const cell = asciiSize;
          const rowH = cell * 1.14;
          const cols = Math.floor(W / cell);
          const rows = Math.floor(H / rowH);
          ac.width = W;
          ac.height = H;
          actx.fillStyle = "#ffffff";
          actx.fillRect(0, 0, W, H);
          actx.font = `${Math.round(cell * 1.05)}px ui-monospace, Menlo, monospace`;
          actx.textBaseline = "top";
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cx = clamp(Math.floor((c + 0.5) * cell), 0, W - 1);
              const cy = clamp(Math.floor((r + 0.5) * rowH), 0, H - 1);
              const tone = clamp((lit(cx, cy) - black) / Math.max(0.001, white - black), 0, 1);
              const darkness = 1 - tone;
              if (darkness <= 0.02) continue;
              const ch = ASCII_CHARS[Math.round(darkness * 16)];
              if (ch === " ") continue;
              const ink = paletteColor(palette.stops, 1 - tone * 0.92);
              actx.fillStyle = rgbCss(ink, clamp((0.12 + 0.7 * darkness) * (0.72 + 0.28 * s), 0.06, 0.94));
              actx.fillText(ch, c * cell, r * rowH);
            }
          }
        }

        // Dither: Bayer threshold + multi-level palette quantisation
        const dc = ditherRef.current;
        const dctx = dc?.getContext("2d");
        if (dc && dctx) {
          const block = ditherSize;
          const cols = Math.floor(W / block);
          const rows = Math.floor(H / block);
          const levels = Math.max(2, Math.round(lerp(8, 2, s)));
          dc.width = W;
          dc.height = H;
          dctx.fillStyle = rgbCss(palette.stops[3]);
          dctx.fillRect(0, 0, W, H);
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cx = clamp(Math.floor((c + 0.5) * block), 0, W - 1);
              const cy = clamp(Math.floor((r + 0.5) * block), 0, H - 1);
              const threshold = (BAYER[r % 4][c % 4] + 0.5) / 16;
              const v = lit(cx, cy) + (threshold - 0.5) / levels;
              const q = clamp(Math.round(v * (levels - 1)) / (levels - 1), 0, 1);
              if (q >= 0.99) continue;
              dctx.fillStyle = rgbCss(paletteColor(palette.stops, q));
              dctx.fillRect(c * block, r * block, block, block);
            }
          }
        }
      };

      begin = () => {
        if (reduced) {
          render(2.6);
          return;
        }
        let last = 0;
        const loop = (now: number) => {
          if (stopped) return;
          if (now - last >= 33) {
            last = now;
            render(now / 1000);
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      };
    }, 72);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [palette, asciiSize, ditherSize, strength, reduced]);

  return (
    <Section no="003" title="ASCII 与抖动">
      <div className="grid gap-5 md:grid-cols-2">
        <figure>
          <div className="ilab-fx-mask overflow-hidden rounded-2xl border bg-white">
            <canvas ref={asciiRef} className="block h-auto w-full" role="img" aria-label="桥图的 ASCII 字符画" />
          </div>
          <figcaption className="crease-caption mt-2">ASCII · 17 级字符密度 + 色调曲线 · 光斑游走逐帧重绘</figcaption>
        </figure>
        <figure>
          <div className="ilab-fx-mask overflow-hidden rounded-2xl border bg-white">
            <canvas ref={ditherRef} className="block h-auto w-full" role="img" aria-label="桥图的 Bayer 有序抖动版" />
          </div>
          <figcaption className="crease-caption mt-2">Dither · Bayer 4×4 + {Math.max(2, Math.round(lerp(8, 2, strength / 100)))} 级量化 · 光斑游走逐帧重绘</figcaption>
        </figure>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">调色板</span>
        {PALETTES.map(p => (
          <button
            key={p.id}
            type="button"
            aria-pressed={paletteId === p.id}
            onClick={() => setPaletteId(p.id)}
            className={`flex min-h-11 items-center gap-2 rounded-full px-3 text-sm ${paletteId === p.id ? "bg-secondary font-medium" : "text-muted-foreground"}`}
          >
            <span
              className="size-[22px] rounded-full"
              style={{ background: `linear-gradient(135deg, ${rgbCss(p.stops[1])}, ${rgbCss(p.stops[2])})`, boxShadow: paletteId === p.id ? "0 0 0 2px #fff, 0 0 0 4px rgb(20 40 70 / 0.35)" : "0 0 0 1px rgb(20 40 70 / 0.12)" }}
              aria-hidden
            />
            {p.name}
          </button>
        ))}
      </div>
      <div className="mt-2 grid gap-x-10 xl:grid-cols-3">
        <SliderRow label="字符大小" value={asciiSize} min={6} max={14} unit="px" onChange={setAsciiSize} />
        <SliderRow label="抖动块" value={ditherSize} min={2} max={9} unit="px" onChange={setDitherSize} />
        <SliderRow label="强度" value={strength} min={0} max={100} onChange={setStrength} />
      </div>
    </Section>
  );
}

/* ————— 004 嵌套与连续圆角：活计算 ————— */

function CornersSection() {
  const [outer, setOuter] = useState(32);
  const [pad, setPad] = useState(16);
  const r1 = Math.max(4, outer - pad);
  const r2 = Math.max(4, r1 - 8);
  return (
    <Section no="004" title="嵌套与连续圆角">
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="crease-glass transition-[border-radius] duration-200" style={{ borderRadius: outer, padding: pad }}>
          <div className="bg-white/70 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.05)] transition-[border-radius] duration-200" style={{ borderRadius: r1, padding: 8 }}>
            <div className="flex min-h-11 items-center justify-between bg-primary px-4 text-sm font-medium text-primary-foreground transition-[border-radius] duration-200" style={{ borderRadius: r2 }}>
              <span>内层按钮</span>
              <span className="tabular-nums">R{r2}</span>
            </div>
          </div>
          <p className="crease-caption mt-4 tabular-nums">外 R{outer} · 边距 {pad} → 内 R{r1} · 再边距 8 → R{r2}（下限 4）</p>
        </div>
        <div className="space-y-1 self-center">
          <SliderRow label="外圆角" value={outer} min={16} max={48} step={4} unit="px" onChange={setOuter} />
          <SliderRow label="内边距" value={pad} min={4} max={24} step={4} unit="px" onChange={setPad} />
          <p className="crease-caption pt-2">同心圆角只有一条公式：内圆角 = 外圆角 − 内边距，逐层往里算，角上间隙才与直边一致。</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="crease-ink flex min-h-36 flex-col justify-between rounded-[28px] p-5">
            <span className="crease-caption">普通圆角</span>
            <span className="text-sm font-medium">28px 圆弧</span>
          </div>
          <div className="crease-ink ilab-super flex min-h-36 flex-col justify-between p-5">
            <span className="crease-caption">连续圆角</span>
            <span className="text-sm font-medium">superellipse(1.25)</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ————— 005 拖拽排序：涟漪让位 ————— */

type DragItem = { id: string; label: string; meta: string };
const dragInitial: DragItem[] = [
  { id: "a", label: "确认信息架构", meta: "今天" },
  { id: "b", label: "绘制关键页面", meta: "明天" },
  { id: "c", label: "开发组件状态", meta: "周四" },
  { id: "d", label: "走查与修正", meta: "周五" },
  { id: "e", label: "交付评审", meta: "下周一" },
];
const SLOT = 64; // 56px item + 8px gap

function DragSection() {
  const reduced = useReducedMotion();
  const [items, setItems] = useState(dragInitial);
  const [drag, setDrag] = useState<{ id: string; from: number; dy: number; target: number } | null>(null);
  const [settling, setSettling] = useState<string | null>(null);
  const startY = useRef(0);

  const targetFor = (from: number, dy: number) => clamp(from + Math.round(dy / SLOT), 0, items.length - 1);

  const endDrag = (commit: boolean) => {
    if (!drag) return;
    if (commit && drag.target !== drag.from) {
      const movedId = drag.id;
      setItems(prev => {
        const next = [...prev];
        const [moved] = next.splice(drag.from, 1);
        next.splice(drag.target, 0, moved);
        return next;
      });
      setSettling(movedId);
      window.setTimeout(() => setSettling(null), 560);
    }
    setDrag(null);
  };

  useEffect(() => {
    if (!drag) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrag(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drag]);

  return (
    <Section no="005" title="拖拽排序">
      <div className="relative max-w-xl" role="list" aria-label="可拖拽排序的任务列表">
        {!reduced && drag && drag.target !== drag.from && (
          <div
            className="ilab-drop-line"
            style={{ top: drag.target * SLOT + (drag.target > drag.from ? SLOT - 10 : -2), opacity: 1 }}
          />
        )}
        {items.map((item, i) => {
          const isDragged = drag?.id === item.id;
          let ty = 0;
          let delay = 0;
          let extra = 0;
          if (drag && !isDragged) {
            const { from, target } = drag;
            if (from < target && i > from && i <= target) ty = -SLOT;
            else if (from > target && i < from && i >= target) ty = SLOT;
            const n = Math.abs(i - target);
            extra = (ty !== 0 ? Math.sign(ty) : i < target ? 1 : -1) * 8 * Math.pow(0.7, n);
            delay = 24 * n;
          }
          return (
            <div key={item.id} className="relative mb-2 h-14">
              {isDragged && <div className="ilab-drag-ghost absolute inset-0 rounded-xl" aria-hidden />}
              <div
                role="listitem"
                data-dragging={isDragged || undefined}
                className="ilab-drag-item crease-glass absolute inset-0 flex items-center gap-3 rounded-xl px-4 select-none"
                style={{
                  transform: isDragged
                    ? `translateY(${drag.dy}px) scale(0.92) rotate(-1.4deg)`
                    : `translateY(${ty + extra}px)`,
                  transition: isDragged
                    ? "none"
                    : settling === item.id
                      ? "transform 520ms cubic-bezier(0.22, 1.35, 0.36, 1)"
                      : `transform 250ms var(--ease-settle) ${delay}ms`,
                  zIndex: isDragged ? 10 : 1,
                  boxShadow: isDragged ? "0 24px 40px -16px rgb(20 40 70 / 0.4)" : undefined,
                }}
                onPointerDown={e => {
                  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                  startY.current = e.clientY;
                  setDrag({ id: item.id, from: i, dy: 0, target: i });
                }}
                onPointerMove={e => {
                  if (!drag || drag.id !== item.id) return;
                  const dy = e.clientY - startY.current;
                  setDrag({ ...drag, dy, target: targetFor(drag.from, dy) });
                }}
                onPointerUp={() => endDrag(true)}
                onPointerCancel={() => endDrag(false)}
              >
                <GripVertical className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <span className="crease-caption">{item.meta}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="crease-caption mt-3" role="status">
        当前顺序：{items.map(i => i.label).join(" → ")}。让位按 0.7ⁿ 衰减、延迟 24ms×n；Esc 取消。
      </p>
    </Section>
  );
}

/* ————— 006 书本式展开卡片：三种强度 ————— */

function BookCard({ title, sub, maxAngle, preset }: { title: string; sub: string; maxAngle: number; preset: string }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const N = 4;
  const layer = (n: number) => {
    const angle = maxAngle * Math.pow(0.7, n);
    return {
      transform: open
        ? reduced
          ? "translateY(-2px)"
          : `translateZ(${(N + 1 - n) * 0.6}px) rotateY(${-angle}deg)`
        : `translateZ(${(N + 1 - n) * 0.6}px)`,
      transitionDelay: open ? `${28 * n}ms` : `${28 * (N - n)}ms`,
    };
  };
  return (
    <div
      className="ilab-book"
      tabIndex={0}
      role="button"
      aria-expanded={open}
      aria-label={`${title}卡片，按回车展开或合上`}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen(v => !v)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(v => !v);
        }
      }}
    >
      <div className="relative aspect-[4/3]">
        <div className="ilab-book-shadow" style={{ inset: "auto 6% -14px 6%", height: 26, filter: "blur(14px)", opacity: open ? 0 : 0.5 }} />
        <div className="ilab-book-shadow" style={{ inset: "auto 2% -26px 2%", height: 40, filter: "blur(38px)", opacity: open ? 0.55 : 0 }} />
        <div className="ilab-book-stage absolute inset-0">
          <div className="absolute inset-1.5 rounded-[14px] bg-[#11161d]" />
          {[3, 2, 1].map(n => (
            <div
              key={n}
              className="ilab-book-layer rounded-xl"
              style={{
                ...layer(n),
                top: 4, bottom: 4, left: 4, right: 8,
                background: `linear-gradient(100deg, rgb(24 32 44 / ${open ? 0.3 - n * 0.05 : 0.16 - n * 0.03}) 0%, rgb(255 255 255 / 0) 55%), ${n === 1 ? "#f4f7fa" : n === 2 ? "#e9eff4" : "#dde6ee"}`,
                boxShadow: "inset 0 0 0 1px rgb(20 40 70 / 0.08)",
              }}
            >
              <div className="p-4">
                <p className="crease-caption">内页 {n} · {(maxAngle * Math.pow(0.7, n)).toFixed(0)}°</p>
                <div className="mt-3 space-y-2">
                  {[86, 64, 74].map((w, i) => (
                    <div key={i} className="h-1.5 rounded bg-[#263140]/15" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="ilab-book-layer crease-glass rounded-[20px]" style={layer(0)}>
            <div className="flex h-full flex-col justify-between p-5">
              <p className="crease-eyebrow">{preset}</p>
              <div>
                <h3 className="text-base font-medium">{title}</h3>
                <p className="crease-caption mt-1">{sub}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookSection() {
  return (
    <Section no="006" title="书本式展开卡片">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BookCard title="克制" sub="封面 24°，页层按 0.7ⁿ 递减" maxAngle={24} preset="Subtle · A=24°" />
        <BookCard title="标准" sub="封面 42°，关闭时内页先合" maxAngle={42} preset="Book · A=42°" />
        <BookCard title="戏剧" sub="封面 60°，阴影换成打开对" maxAngle={60} preset="Dramatic · A=60°" />
      </div>
      <p className="crease-caption mt-4">每层延迟 28ms×n；阴影是两块预模糊形状交叉淡化，从不动画 blur 本身。</p>
    </Section>
  );
}

/* ————— 007 中英混排字型 ————— */

function TypeSection() {
  const [on, setOn] = useState(true);
  const [online, setOnline] = useState(1024);
  useEffect(() => {
    const t = window.setInterval(() => setOnline(v => v + Math.floor(Math.random() * 17) - 8), 1200);
    return () => window.clearInterval(t);
  }, []);
  return (
    <Section no="007" title="中英混排字型">
      <div className="mb-5 flex items-center gap-3">
        <Switch id="type-switch" checked={on} onCheckedChange={setOn} aria-label="排版优化开关" />
        <label htmlFor="type-switch" className="text-sm font-medium">排版优化{on ? "开" : "关"}</label>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div lang="zh" className={`crease-glass rounded-2xl p-6 sm:p-8 ${on ? "ilab-type-on" : ""}`}>
          <h3 className="ilab-zh-title text-xl leading-snug font-medium">
            让 Design System 在中文界面里同样好看：从组件到页面的完整实践
          </h3>
          <p className="ilab-zh-body mt-4 text-base leading-8">
            使用「设计系统」可以统一界面（包括 App 与 Web 端）的表现。本季度共有 12,480 人次参与评审，覆盖 36 个页面与 128 个组件状态。
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-5">
            {[
              { label: "当前在线", value: online.toLocaleString("en-US") },
              { label: "评审人次", value: "12,480" },
              { label: "组件状态", value: "128" },
            ].map(s => (
              <div key={s.label}>
                <p className="ilab-nums text-2xl font-medium">{s.value}</p>
                <p className="crease-caption mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="crease-glass rounded-2xl p-5">
          <p className="text-sm font-medium">截断三件套</p>
          <p className="crease-caption mt-1">flex 项 min-width: 0 + 省略号，截断时 hover 看全文。</p>
          <TooltipProvider delayDuration={300}>
            <div className="mt-4 space-y-2">
              {["品牌站改版-首页视觉走查-最终版 v3.fig", "季度经营分析（华东区）.xlsx", "a-very-long-file-name-export-2026.csv"].map(name => (
                <Tooltip key={name}>
                  <TooltipTrigger asChild>
                    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
          <p className="crease-caption mt-4">标题 balance、正文 pretty、数字 tabular-nums、中文两端对齐与中西文自动空隙都由左侧开关控制。</p>
        </div>
      </div>
    </Section>
  );
}

/* ————— 008 Wiki 布局：浮动顶栏 + 边缘箭头 ————— */

const wikiChapters = [
  { id: "intro", title: "概览", body: "工作区把项目、文档与成员放在同一处。左侧目录固定，右侧正文独立滚动，两者互不干扰。" },
  { id: "create", title: "创建项目", body: "从模板或空白开始创建项目。命名时使用团队能直接识别的短名，描述写清目标与负责人，后续检索会轻松很多。" },
  { id: "share", title: "共享与权限", body: "成员按角色获得权限：所有者管理全部设置，编辑者修改内容，查看者只读。外部分享链接可以随时撤销。" },
  { id: "notify", title: "通知规则", body: "被提及、被指派与截止临近会触发通知。其余动态合并进每日摘要，避免打断正在进行的工作。" },
  { id: "export", title: "导出与归档", body: "项目可以导出为文档包长期保存。归档后的项目只读，恢复时保留全部历史版本与评论记录。" },
  { id: "faq", title: "常见问题", body: "找不到项目时先检查目录筛选与归档状态；权限不足时向所有者申请，申请通过后会收到一条通知。" },
];

function WikiSection() {
  const contentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("intro");
  const [mask, setMask] = useState({ above: false, below: true });
  const [barVisible, setBarVisible] = useState(false);
  const raf = useRef(0);

  const onContentScroll = () => {
    window.cancelAnimationFrame(raf.current);
    raf.current = window.requestAnimationFrame(() => {
      const box = contentRef.current;
      if (!box) return;
      setBarVisible(box.scrollTop > 150);
      const line = box.scrollTop + box.clientHeight * 0.2;
      let current = wikiChapters[0].id;
      for (const ch of wikiChapters) {
        const el = box.querySelector<HTMLElement>(`#wiki-${ch.id}`);
        if (el && el.offsetTop <= line) current = ch.id;
      }
      setActive(current);
    });
  };

  const onTocScroll = () => {
    const toc = tocRef.current;
    if (!toc) return;
    setMask({
      above: toc.scrollTop > 4,
      below: toc.scrollTop + toc.clientHeight < toc.scrollHeight - 4,
    });
  };

  const scrollToc = (dir: 1 | -1) => {
    const toc = tocRef.current;
    if (toc) toc.scrollBy({ top: dir * toc.clientHeight * 0.6, behavior: "smooth" });
  };

  const maskImage = `linear-gradient(to bottom, ${mask.above ? "transparent 0, black 40px" : "black 0"}, black calc(100% - ${mask.below ? "56px" : "0px"}), ${mask.below ? "transparent 100%" : "black 100%"})`;
  const activeTitle = wikiChapters.find(c => c.id === active)?.title;

  return (
    <Section no="008" title="Wiki 布局">
      <div className="relative grid h-[400px] grid-cols-[148px_minmax(0,1fr)] overflow-hidden rounded-2xl border bg-white/60 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div
          className="ilab-wiki-topbar absolute inset-x-0 top-0 z-10 flex h-11 items-center gap-3 border-b bg-white/85 px-4 backdrop-blur-[18px]"
          data-hidden={!barVisible}
          aria-hidden={!barVisible}
        >
          <span className="text-sm font-semibold tracking-wide">工作区手册</span>
          <span className="crease-caption">当前章节 · {activeTitle}</span>
        </div>
        <div className="relative border-r">
          <nav
            ref={tocRef}
            aria-label="章节目录"
            className="ilab-wiki-scroll h-full overflow-y-auto py-3"
            style={{ maskImage, WebkitMaskImage: maskImage }}
            onScroll={onTocScroll}
          >
            {wikiChapters.map(ch => (
              <button
                key={ch.id}
                type="button"
                aria-current={active === ch.id ? "location" : undefined}
                className={`block min-h-11 w-full border-l-2 px-4 text-left text-sm ${
                  active === ch.id
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  const box = contentRef.current;
                  const el = box?.querySelector<HTMLElement>(`#wiki-${ch.id}`);
                  if (box && el) box.scrollTo({ top: el.offsetTop - 52, behavior: "smooth" });
                }}
              >
                {ch.title}
              </button>
            ))}
            <div className="px-4 pt-6 pb-2">
              <p className="crease-caption">目录到底部后，下方遮罩与箭头消失。</p>
            </div>
          </nav>
          {mask.above && (
            <button type="button" tabIndex={-1} aria-hidden onClick={() => scrollToc(-1)} className="absolute top-1 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-white shadow-md">
              <ChevronDown className="size-4 rotate-180" />
            </button>
          )}
          {mask.below && (
            <button type="button" tabIndex={-1} aria-hidden onClick={() => scrollToc(1)} className="absolute bottom-1 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-white shadow-md">
              <ChevronDown className="size-4" />
            </button>
          )}
        </div>
        <div ref={contentRef} className="overflow-y-auto px-6 py-5" onScroll={onContentScroll}>
          <p className="crease-eyebrow mb-4">横幅区 · 滚出后浮动顶栏回来（320ms 进入 / 120ms 离开）</p>
          {wikiChapters.map(ch => (
            <article key={ch.id} id={`wiki-${ch.id}`} className="mb-10 scroll-mt-14">
              <h3 className="text-base font-medium">{ch.title}</h3>
              <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">{ch.body}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ————— 009 浮层选择：Tooltip / Popover / Popconfirm / Dialog / Undo ————— */

function OverlaySection() {
  const [popOpen, setPopOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [memberGone, setMemberGone] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);
  const undoTimer = useRef(0);
  const popRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popOpen && !confirmOpen) return;
    const onDown = (e: PointerEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPopOpen(false);
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) setConfirmOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPopOpen(false);
        setConfirmOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [popOpen, confirmOpen]);

  const doDelete = () => {
    setDeleted(true);
    setUndoVisible(true);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndoVisible(false), 5000);
  };

  return (
    <Section no="009" title="浮层选择">
      <TooltipProvider delayDuration={500} skipDelayDuration={0}>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="min-h-11 min-w-11" aria-label="复制链接">
                  <Copy />
                </Button>
              </TooltipTrigger>
              <TooltipContent>复制链接（首悬停 500ms）</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="min-h-11 min-w-11" aria-label="分享">
                  <Send />
                </Button>
              </TooltipTrigger>
              <TooltipContent>分享（相邻立即出现）</TooltipContent>
            </Tooltip>
          </div>

          <div ref={popRef} className="relative">
            <Button variant="outline" className="min-h-11" aria-expanded={popOpen} onClick={() => setPopOpen(v => !v)}>
              <Info />详情面板
            </Button>
            {popOpen && (
              <div className="ilab-menu ilab-menu-root top-full left-0 mt-2 w-64" role="dialog" aria-label="详情面板">
                <p className="px-2 pt-2 text-sm font-medium">品牌站改版</p>
                <p className="px-2 pt-1 pb-2 text-sm leading-6 text-muted-foreground">负责人林小满，本周进度 68%，下个里程碑是首页视觉走查。</p>
                <div className="flex justify-end px-2 pb-2">
                  <Button size="sm" onClick={() => setPopOpen(false)}>知道了</Button>
                </div>
              </div>
            )}
          </div>

          <div ref={confirmRef} className="relative">
            <Button variant="outline" className="min-h-11" aria-expanded={confirmOpen} onClick={() => setConfirmOpen(v => !v)} disabled={memberGone}>
              <Users />{memberGone ? "成员已移除" : "移除成员…"}
            </Button>
            {confirmOpen && !memberGone && (
              <div className="ilab-popconfirm ilab-menu top-full right-0 mt-2 w-72" role="alertdialog" aria-label="确认移除成员">
                <p className="px-2 pt-2 text-sm font-medium">移除林小满？</p>
                <p className="px-2 pt-1 pb-2 text-sm leading-6 text-muted-foreground">只影响这一个成员、可重新邀请，所以用锚在按钮旁的 Popconfirm，不上全屏对话框。</p>
                <div className="flex justify-end gap-2 px-2 pb-2">
                  <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(false)}>取消</Button>
                  <Button size="sm" variant="destructive" onClick={() => { setMemberGone(true); setConfirmOpen(false); }}>移除成员</Button>
                </div>
              </div>
            )}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="min-h-11">对话框</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>解散项目</DialogTitle>
                <DialogDescription>影响全部 12 名成员与关联文件、不可撤销——这种量级才用 Dialog，并把动作写具体。</DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="destructive">解散项目</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>

      <div className="relative mt-6 max-w-xl">
        {!deleted ? (
          <div className="crease-glass flex min-h-14 items-center gap-3 rounded-xl px-4">
            <FileText className="size-5 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">季度报告.pdf</span>
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="删除季度报告" onClick={doDelete}>
              <Trash2 />
            </Button>
          </div>
        ) : (
          <p className="crease-caption flex min-h-14 items-center" role="status">列表已空。能撤销的动作不弹确认框：直接做 + 留 Undo。</p>
        )}
        {undoVisible && (
          <div className="crease-toast crease-ink absolute -bottom-16 left-0 flex h-11 items-center gap-3 rounded-2xl pr-2 pl-4 text-sm shadow-xl">
            <span>已删除「季度报告.pdf」</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                window.clearTimeout(undoTimer.current);
                setDeleted(false);
                setUndoVisible(false);
              }}
            >
              <Undo2 />撤销
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}

/* ————— 010 液态玻璃：多表面 + 染色密度 ————— */

function LiquidSection() {
  const [pos, setPos] = useState(30);
  const [tint, setTint] = useState(14);
  return (
    <Section no="010" title="液态玻璃">
      <div className="relative h-80 overflow-hidden rounded-2xl border">
        <img
          src={bridge}
          alt=""
          aria-hidden
          className="absolute top-0 h-full w-[135%] max-w-none object-cover"
          style={{ transform: `translateX(${-pos * 0.32}%)` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(38% 55% at 82% 88%, rgb(211 18 24 / 0.28), transparent 70%), radial-gradient(45% 60% at 8% 0%, rgb(140 205 255 / 0.35), transparent 70%), linear-gradient(to top, rgb(8 12 20 / 0.55), transparent 42%)",
          }}
          aria-hidden
        />
        <div className="ilab-liquid absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5">
          {["概览", "数据", "成员"].map((t, i) => (
            <span key={t} className={`rounded-full px-3.5 py-1.5 text-sm ${i === 0 ? "bg-white/45 font-medium text-[#10151b]" : "text-[#10151bcc]"}`}>{t}</span>
          ))}
        </div>
        <div
          className="ilab-liquid absolute top-1/2 left-[6%] w-[min(264px,52%)] -translate-y-1/2 rounded-[24px] p-5"
          style={{ "--ilab-tint": tint / 100 } as React.CSSProperties}
        >
          <p className="text-sm font-medium text-[#10151bcc]">玻璃面板 · 染色 {tint}%</p>
          <p className="mt-1 text-sm leading-6 text-[#3c4043b3]">模糊只有 2px，颜色来自背后的图像；边缘折射高光标出厚度，染色随背景密度走。</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm">主要</Button>
            <Button size="sm" variant="outline">次要</Button>
          </div>
        </div>
        <div className="ilab-liquid ilab-liquid-dark absolute right-[6%] bottom-5 w-[min(230px,46%)] rounded-[24px] p-5">
          <p className="text-sm font-medium text-white/95">压在暗区</p>
          <p className="mt-1 text-sm leading-6 text-[rgb(235_235_245/0.64)]">深染色 + 亮度压到 0.85，墨色翻成浅色，边缘光只剩三分之一。</p>
        </div>
      </div>
      <div className="mt-2 grid gap-x-10 md:grid-cols-2">
        <SliderRow label="背景位置" value={pos} min={0} max={100} unit="%" onChange={setPos} />
        <SliderRow label="染色密度" value={tint} min={6} max={30} step={2} unit="%" onChange={setTint} />
      </div>
    </Section>
  );
}

/* ————— 011 缓动曲线：曲线图 + 齐跑对比 ————— */

const easingRoles = [
  { name: "进入", css: "cubic-bezier(0, 0, 0.58, 1)", pts: [0, 0, 0.58, 1], dur: 220 },
  { name: "落位", css: "cubic-bezier(0.22, 1, 0.36, 1)", pts: [0.22, 1, 0.36, 1], dur: 200 },
  { name: "离开", css: "cubic-bezier(0.42, 0, 1, 1)", pts: [0.42, 0, 1, 1], dur: 180 },
  { name: "移位", css: "cubic-bezier(0.42, 0, 0.58, 1)", pts: [0.42, 0, 0.58, 1], dur: 300 },
  { name: "回弹", css: "cubic-bezier(0.34, 1.56, 0.64, 1)", pts: [0.34, 1.56, 0.64, 1], dur: 330 },
];

function bezierPath(pts: number[]) {
  const [x1, y1, x2, y2] = pts;
  const B = (t: number, p0: number, p1: number, p2: number, p3: number) =>
    (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3;
  let d = "";
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = B(t, 0, x1, x2, 1) * 44;
    const y = 30 - B(t, 0, y1, y2, 1) * 30;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${clamp(y, -6, 36).toFixed(1)} `;
  }
  return d;
}

function EasingSection() {
  const reduced = useReducedMotion();
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const dirs = useRef<number[]>(easingRoles.map(() => 1));
  const run = (i: number) => {
    const dot = dots.current[i];
    const track = dot?.parentElement;
    if (!dot || !track) return;
    const distance = track.clientWidth - 28;
    const dir = dirs.current[i];
    dirs.current[i] = -dir;
    const from = dir === 1 ? 0 : distance;
    const to = dir === 1 ? distance : 0;
    dot.getAnimations().forEach(a => a.cancel());
    if (reduced) {
      dot.style.transform = `translateX(${to}px)`;
      return;
    }
    const anim = dot.animate(
      [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
      { duration: easingRoles[i].dur * 2.2, easing: easingRoles[i].css, fill: "forwards" },
    );
    anim.onfinish = () => {
      dot.style.transform = `translateX(${to}px)`;
    };
  };
  return (
    <Section no="011" title="缓动曲线">
      <div className="max-w-3xl space-y-3">
        {easingRoles.map((role, i) => (
          <div key={role.name} className="flex items-center gap-4">
            <Button variant="outline" className="min-h-11 w-20 shrink-0" onClick={() => run(i)}>
              {role.name}
            </Button>
            <svg viewBox="0 0 44 30" className="hidden h-9 w-14 shrink-0 sm:block" aria-hidden>
              <rect x="0.5" y="0.5" width="43" height="29" rx="4" fill="none" stroke="rgb(20 40 70 / 0.15)" />
              <line x1="0" y1="30" x2="44" y2="30" stroke="rgb(20 40 70 / 0.25)" strokeDasharray="2 2" />
              <path d={bezierPath(role.pts)} fill="none" stroke="#d31218" strokeWidth="1.8" />
            </svg>
            <div className="relative h-11 flex-1 rounded-full bg-secondary/70">
              <span
                ref={el => {
                  dots.current[i] = el;
                }}
                className="absolute top-2 left-[6px] size-7 rounded-full bg-primary shadow"
              />
            </div>
            <span className="crease-caption hidden w-48 shrink-0 tabular-nums lg:block">{role.css} · {role.dur}ms</span>
          </div>
        ))}
        <div className="flex items-center gap-4 pt-1">
          <Button className="min-h-11" onClick={() => easingRoles.forEach((_, i) => run(i))}>全部齐跑</Button>
          <p className="crease-caption">同一距离同时出发：进入先快后稳、离开起步慢、回弹会冲过终点再落回来。默认 ease 全站禁用。</p>
        </div>
      </div>
    </Section>
  );
}


/* ————— 总结：如何做好 UI（vibedesign.tips 全站跨篇共性） ————— */

const durationScale = [
  { label: "微反馈 hover / press", range: "100–150ms", w: 12 },
  { label: "小 UI 进入 / 退出", range: "150–250 / 120–200ms", w: 22 },
  { label: "中型浮层", range: "250–350ms", w: 34 },
  { label: "大型 / 全屏转场", range: "350–500ms", w: 48 },
  { label: "氛围长时程（光晕 · 视角切换 · 翻面波）", range: "1000–1800ms", w: 78 },
  { label: "环境循环（流体渐变）", range: "17–40s", w: 100 },
];

const summaryCards: { title: string; points: string[] }[] = [
  {
    title: "缓动按角色，不按手感",
    points: [
      "进入 ease-out、离开 ease-in、屏内移位 ease-in-out、松手落定用 spring——一套 token 全站取用，不逐个组件手调。",
      "默认 ease 明令禁用；linear 只给「转」不给「移」（spinner、进度、跑马灯）。",
      "overshoot 只给 ≤64px 的小确认元素；弹簧签名反复出现：补位 1 − exp(−7t)·cos(6t)，约 520ms。",
    ],
  },
  {
    title: "连续性：同一个元素长过去",
    points: [
      "状态变化时被点的元素本身移动 / 生长到新状态（FLIP / 共享元素），不消失再重现。",
      "新内容在移动过半（45–55%）后淡入，旧内容在前 25–35% 淡出；返回沿原路逆放。",
      "错峰无处不在且量级一致：20–50ms 一档；位移与角度按 0.7ⁿ 几何衰减，邻项影响按 1/|d| 衰减。",
    ],
  },
  {
    title: "只动 transform 与 opacity",
    points: [
      "永不动画 width / height / top / margin / blur / box-shadow；要「变模糊、变阴影」就用两份预渲染版本交叉淡化。",
      "手势 1:1 跟随、无缓动，松手把速度喂给弹簧续完；新动作从当前帧打断旧动画。",
      "动画永不阻塞输入；Esc、点外、拖出 = 取消并原路弹回。",
    ],
  },
  {
    title: "几何与材质：一套公式",
    points: [
      "同心圆角贯穿全部嵌套：内圆角 = 外圆角 − 内边距，大圆角配连续圆角（超椭圆）。",
      "光源全站统一正上方；材质靠五件套——面渐变 + 1px 边 + 顶高光 + 底暗线 + 双层投影——与品牌色解耦。",
      "白底忌脏：深度用大小、模糊、淡出与层次表达，不用阴影和反射装深度；阴影色永向环境色微偏，不用纯黑。",
    ],
  },
  {
    title: "克制：效果有配额",
    points: [
      "一屏一张全息卡、一页一种滚动特效、一个产品一种删除特效、同时最多 3 个删除特效、每次等待只一种加载态、一个区域只一个主按钮。",
      "氛围效果都有「不用」清单：纯色背景不用玻璃、小元素不做折射、需要用户处理的失败不发会消失的 Toast。",
      "一切自动调整都带防抖带：阈值迟滞 ±0.05、采样去极值取平均、同排表面共用一个决定——不临界闪烁。",
    ],
  },
  {
    title: "无障碍是默认档，不是选配",
    points: [
      "prefers-reduced-motion 统一降级为约 150ms 纯淡化：保留状态变化，去掉位移、缩放、模糊与弹簧。",
      "焦点守恒（关闭回触发元素）、live region 礼貌播报、触摸目标 ≥ 44px、键盘路径与指针路径同权。",
      "延迟成对出现：加载态 300ms 后才显示、至少留 500ms；菜单打开 220ms、关闭宽限 360ms——快不是目的，不闪、不跳、不丢才是。",
    ],
  },
];

function SummarySection() {
  return (
    <Section no="总结" title="如何做好 UI · 全站共性">
      <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
        二十二篇讲的是二十二个具体交互，合起来是同一套判断：动效不是装饰，是把「发生了什么、东西去哪了、接下来能做什么」讲清楚的语言。下面六条是全站反复出现的共性，也是上面每个演示共同遵守的规则。
      </p>
      <div className="mt-6 max-w-3xl">
        <p className="text-sm font-medium">时长是一套刻度，不是一个数字</p>
        <div className="mt-3 space-y-2">
          {durationScale.map(d => (
            <div key={d.label} className="flex items-center gap-4">
              <span className="w-56 shrink-0 text-sm text-muted-foreground">{d.label}</span>
              <span className="h-2 rounded-full bg-primary/70" style={{ width: `${d.w}%` }} aria-hidden />
              <span className="text-sm tabular-nums">{d.range}</span>
            </div>
          ))}
        </div>
        <p className="crease-caption mt-3">退出恒短于进入；spring 与 overshoot 取普通时长约 1.5 倍；氛围动效是另一档——一次性的或环境性的，都不挡操作。</p>
      </div>
      <div className="mt-8">
        <p className="text-sm font-medium">二十二条逐条</p>
        <ol className="mt-3 grid gap-x-10 gap-y-2 md:grid-cols-2">
          {[
            ["001", "按压按钮", "按下四件事同发：下沉 1px、渐变翻转、投影塌到 0 1px 1px、顶高光变内阴影"],
            ["002", "级联菜单", "安全三角 + 三延迟：打开 220ms、关闭宽限 360ms、三角内停留上限 1.2s"],
            ["003", "ASCII 与抖动", "Bayer 有序抖动与字符密度都按亮度重绘；效果太抢眼先升遮罩，不先降强度"],
            ["004", "嵌套与连续圆角", "内圆角 = 外圆角 − 内边距，逐层往里算；大圆角用连续圆角"],
            ["005", "拖拽让位", "涟漪按 0.7ⁿ 衰减、24ms 一档；Esc 与拖出都是原路弹回"],
            ["006", "书本卡片", "绕左边缘开合、层差 28ms 一层；双阴影一对交叉淡化，不动模糊半径"],
            ["007", "中英混排", "行长平衡、两端对齐、数字等宽、混排自动间距；截断要给看全文的路"],
            ["008", "Wiki 布局", "锚点高亮跟随滚动位置；横幅顶栏滚出后浮回，目录两端箭头按需出现"],
            ["009", "浮层选择", "触发方式决定控件：悬停 Tooltip、点击 Popover、危险动作用锚定的 Popconfirm"],
            ["010", "液态玻璃", "只在多彩背景上用；染色密度 6–30% 一套参数全表面共用；小元素不用"],
            ["011", "缓动曲线", "按角色分五条：进入、落位、离开、移位、回弹；默认 ease 禁用"],
            ["012", "消息气泡", "同人连发只第一条带尾巴、组内 2px 组间 10px；材质四选一，全程统一"],
            ["013", "冲击波光晕", "半径指数扩张、强度对数衰减；四色环加红蓝痕量色散边；输入框可展开"],
            ["014", "删除卡片", "默认式淡出 + 坍缩；特效式燃 / 烟羽 / 碎块 / 剥离只选一种作产品签名"],
            ["015", "界面连续性", "同一个元素长过去：新内容过半淡入、旧内容前 1/3 淡出、返回逆放"],
            ["016", "Toast 与通知", "会消失的只报结果，需要处理的用通知卡；进度型原地变成结果"],
            ["017", "加载状态", "按等待类型选：骨架屏、按钮转轮、乐观更新、进度卡，一次只用一种"],
            ["018", "全息卡片", "箔面四种 finish 由光点驱动；深度靠层间位移；一屏最多一张"],
            ["019", "滚动驱动卡片", "一切属性是进度 p 的函数、无吸附；堆叠 / 飞牌 / 画廊 / 展开 / 封面流一页一种"],
            ["020", "选择控件", "按何时生效选：立刻生效分段与开关、先选后交 Select、带说明用单选竖排"],
            ["021", "环形卡片", "弧长等距定位、曲率连续反转切换内外视、翻面成波、景深靠模糊与淡出"],
            ["022", "空状态", "先分种类——首次、无结果、失败、无权限、全部处理完——再按空间定尺寸"],
          ].map(([no, name, rule]) => (
            <li key={no} className="flex gap-3 text-sm leading-6">
              <span className="shrink-0 font-medium tabular-nums text-muted-foreground">{no}</span>
              <span>
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground"> — {rule}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map(card => (
          <div key={card.title} className="crease-glass rounded-2xl p-5">
            <h3 className="text-sm font-medium">{card.title}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-muted-foreground">
              {card.points.map(p => (
                <li key={p.slice(0, 12)}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-dashed p-5">
        <p className="text-sm font-medium">落地顺序（原文给工程侧的建议）</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground">
          <li>先落 token 层：缓动六条 + 时长三档 + 弹簧签名、同心圆角尺度、五层材质按钮。</li>
          <li>再落行为组件：级联菜单、浮层选择、Toast / 通知双通道、加载四件套、空状态组件。</li>
          <li>最后落展示型效果：滚动五式、书卡、拖拽涟漪、删除特效、光晕、液态玻璃、全息卡、环卡、气泡材质、ASCII / Dither——每个都以独立演示放进展示页，参数照原文原值。</li>
        </ol>
      </div>
    </Section>
  );
}

/* ————— page ————— */

export function InteractionLabTemplate() {
  return (
    <div className="space-y-16">
      <PageHeading
        eyebrow="组件库 / 交互实验室"
        title="交互实验室"
        description="二十二个交互各实现一次，全部使用 CREASE 的材质、圆角与动效令牌。"
      />
      <PressSection />
      <CascadeSection />
      <AsciiSection />
      <CornersSection />
      <DragSection />
      <BookSection />
      <TypeSection />
      <WikiSection />
      <OverlaySection />
      <LiquidSection />
      <EasingSection />
      <BubblesSection />
      <ShockSection />
      <DeleteSection />
      <ContinuitySection />
      <ToastSection />
      <LoadingSection />
      <HoloSection />
      <ScrollSection />
      <ChoiceSection />
      <RingSection />
      <EmptySection />
      <SummarySection />
    </div>
  );
}
