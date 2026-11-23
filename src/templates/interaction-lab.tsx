import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Copy, CreditCard, Download,
  FileText, Folder, GripVertical, Inbox, Info, Link2, RotateCcw, Send, Trash2, Undo2,
  Users, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeading } from "@/components/kit/page-heading";
import { ToastProvider, useToast } from "@/components/kit/toast";
import bridge from "@/assets/bridge.svg";
import "./interaction-lab.css";

/* ————— shared helpers ————— */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function Section({ no, title, children }: { no: string; title: string; children: ReactNode }) {
  return (
    <section data-reveal>
      <div className="flex items-baseline gap-3">
        <span className="crease-caption font-medium text-primary tabular-nums">{no}</span>
        <h2 className="crease-heading">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ————— 001 按压按钮 ————— */

function PressSection() {
  const [count, setCount] = useState(0);
  return (
    <Section no="001" title="按压按钮">
      <div className="flex flex-wrap items-center gap-3">
        <Button className="min-h-11" onClick={() => setCount(c => c + 1)}>主要操作</Button>
        <Button variant="outline" className="min-h-11" onClick={() => setCount(c => c + 1)}>描边操作</Button>
        <button type="button" onClick={() => setCount(c => c + 1)} className="crease-ink crease-pressable min-h-11 rounded-xl px-5 text-sm font-medium">
          黑亚克力
        </button>
        <span className="crease-caption" role="status">已响应 {count} 次</span>
      </div>
      <button
        type="button"
        onClick={() => setCount(c => c + 1)}
        className="crease-glass crease-pressable mt-5 block w-full rounded-2xl p-6 text-left"
      >
        <span className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-base font-medium">整张卡片也可以按</span>
            <span className="mt-1 block text-sm text-muted-foreground">按下时下沉 1px，内阴影加深，松开即回位。</span>
          </span>
          <Download className="size-5 shrink-0 text-muted-foreground" />
        </span>
      </button>
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
    ],
  },
  { id: "archive", label: "归档" },
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
  const activeRef = useRef<string | null>(null);
  activeRef.current = active;

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
    // Safe triangle: apex = previous pointer position, base = submenu near edge.
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
          // Re-check every 80ms; after 1.2s dwell the row wins.
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearTimers();
        setOpen(false);
        setSub(null);
        setActive(null);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        clearTimers();
        setOpen(false);
        setSub(null);
        setActive(null);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open ]);

  return (
    <Section no="002" title="级联菜单">
      <div className="flex flex-wrap items-center gap-4">
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
              {cascadeItems.map(item => (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup={item.children ? "menu" : undefined}
                    aria-expanded={item.children ? sub === item.id : undefined}
                    data-active={active === item.id || undefined}
                    className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-medium text-[#263140] data-[active]:bg-[rgb(15_23_42/0.07)]"
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
        <span className="crease-caption" role="status">{result || "悬停「导出格式」后斜向移入子菜单，途中不会误触其他行。"}</span>
      </div>
    </Section>
  );
}

/* ————— 003 ASCII 与抖动 ————— */

const ASCII_CHARS = "  .,:;-=+xX08S#&@";
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function drawSource(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.36, h * 0.4, 8, w * 0.36, h * 0.4, w * 0.55);
  glow.addColorStop(0, "#10151c");
  glow.addColorStop(0.55, "#5b6b7a");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w * 0.68, h * 0.62);
  ctx.rotate(-0.5);
  const fold = ctx.createLinearGradient(-90, -70, 90, 70);
  fold.addColorStop(0, "#2a3542");
  fold.addColorStop(1, "#c8d3dd");
  ctx.fillStyle = fold;
  ctx.fillRect(-90, -70, 180, 140);
  ctx.restore();
  ctx.fillStyle = "#d31218";
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.26, 15, 0, Math.PI * 2);
  ctx.fill();
}

function AsciiSection() {
  const [density, setDensity] = useState(9); // ASCII cell px, 6–14
  const asciiRef = useRef<HTMLCanvasElement>(null);
  const ditherRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const W = 480;
      const H = 300;
      const src = document.createElement("canvas");
      src.width = W;
      src.height = H;
      const sctx = src.getContext("2d");
      if (!sctx) return;
      drawSource(sctx, W, H);
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

      // ASCII
      const ac = asciiRef.current;
      const actx = ac?.getContext("2d");
      if (ac && actx) {
        const cell = density;
        const cols = Math.floor(W / cell);
        const rows = Math.floor(H / (cell * 1.14));
        ac.width = W;
        ac.height = H;
        actx.fillStyle = "#ffffff";
        actx.fillRect(0, 0, W, H);
        actx.fillStyle = "#1c2733";
        actx.font = `${Math.round(cell * 1.05)}px ui-monospace, Menlo, monospace`;
        actx.textBaseline = "top";
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = clamp(Math.floor((c + 0.5) * cell), 0, W - 1);
            const cy = clamp(Math.floor((r + 0.5) * cell * 1.14), 0, H - 1);
            const norm = clamp((lum(cx, cy) - low) / Math.max(0.001, high - low), 0, 1);
            const darkness = 1 - norm;
            if (darkness <= 0.02) continue;
            const ch = ASCII_CHARS[Math.round(darkness * 16)];
            if (ch === " ") continue;
            actx.globalAlpha = clamp(0.12 + 0.7 * darkness, 0.06, 0.94);
            actx.fillText(ch, c * cell, r * cell * 1.14);
          }
        }
        actx.globalAlpha = 1;
      }

      // Bayer dither
      const dc = ditherRef.current;
      const dctx = dc?.getContext("2d");
      if (dc && dctx) {
        const block = clamp(Math.round(density / 2), 2, 9);
        const cols = Math.floor(W / block);
        const rows = Math.floor(H / block);
        dc.width = W;
        dc.height = H;
        dctx.fillStyle = "#ffffff";
        dctx.fillRect(0, 0, W, H);
        dctx.fillStyle = "#141a21";
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = clamp(Math.floor((c + 0.5) * block), 0, W - 1);
            const cy = clamp(Math.floor((r + 0.5) * block), 0, H - 1);
            const threshold = (BAYER[r % 4][c % 4] + 0.5) / 16;
            if (lum(cx, cy) < threshold) dctx.fillRect(c * block, r * block, block, block);
          }
        }
      }
    }, 72);
    return () => window.clearTimeout(timer);
  }, [density]);

  return (
    <Section no="003" title="ASCII 与抖动">
      <div className="grid gap-5 md:grid-cols-2">
        <figure>
          <div className="overflow-hidden rounded-2xl border bg-white">
            <canvas ref={asciiRef} className="block h-auto w-full" role="img" aria-label="折面图形的 ASCII 字符画" />
          </div>
          <figcaption className="crease-caption mt-2">ASCII · 字符密度描绘明暗</figcaption>
        </figure>
        <figure>
          <div className="overflow-hidden rounded-2xl border bg-white">
            <canvas ref={ditherRef} className="block h-auto w-full" role="img" aria-label="折面图形的 Bayer 有序抖动版" />
          </div>
          <figcaption className="crease-caption mt-2">Dither · Bayer 4×4 有序抖动</figcaption>
        </figure>
      </div>
      <label className="mt-5 flex max-w-md items-center gap-4 text-sm">
        <span className="shrink-0 font-medium">字符密度</span>
        <input
          type="range"
          min={6}
          max={14}
          step={1}
          value={density}
          onChange={e => setDensity(Number(e.target.value))}
          className="min-h-11 flex-1"
          style={{ accentColor: "var(--primary)" }}
          aria-label="字符密度"
        />
        <span className="w-10 text-right tabular-nums">{density}px</span>
      </label>
    </Section>
  );
}

/* ————— 004 嵌套与连续圆角 ————— */

function CornersSection() {
  return (
    <Section no="004" title="嵌套与连续圆角">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="crease-glass rounded-[32px] p-4">
          <div className="rounded-2xl bg-white/70 p-2 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.05)]">
            <div className="flex min-h-11 items-center justify-between rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
              <span>内层按钮</span>
              <span className="tabular-nums">R8</span>
            </div>
          </div>
          <p className="crease-caption mt-4">外 R32 · 内边距 16 → 内 R16 · 再内边距 8 → R8</p>
        </div>
        <div className="crease-glass rounded-[32px] p-6">
          <div className="rounded-lg bg-white/70 p-2 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.05)]">
            <div className="flex min-h-11 items-center justify-between rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              <span>内层按钮</span>
              <span className="tabular-nums">R4</span>
            </div>
          </div>
          <p className="crease-caption mt-4">外 R32 · 内边距 24 → 内 R8 · 再内边距 8 → R4（下限）</p>
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
  const startY = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const targetFor = (from: number, dy: number) => clamp(from + Math.round(dy / SLOT), 0, items.length - 1);

  const endDrag = (commit: boolean) => {
    if (!drag) return;
    if (commit && drag.target !== drag.from) {
      setItems(prev => {
        const next = [...prev];
        const [moved] = next.splice(drag.from, 1);
        next.splice(drag.target, 0, moved);
        return next;
      });
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
      <div
        ref={listRef}
        className="relative max-w-xl"
        role="list"
        aria-label="可拖拽排序的任务列表"
      >
        {!reduced && drag && drag.target !== drag.from && (
          <div
            className="ilab-drop-line"
            style={{ top: drag.target * SLOT + (drag.target > drag.from ? SLOT - 10 : -2), transform: "scaleX(1)", opacity: 1 }}
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
            <div
              key={item.id}
              role="listitem"
              data-dragging={isDragged || undefined}
              className="ilab-drag-item crease-glass mb-2 flex h-14 items-center gap-3 rounded-xl px-4 select-none"
              style={{
                transform: isDragged
                  ? `translateY(${drag.dy}px) scale(0.94)`
                  : `translateY(${ty + extra}px)`,
                transition: isDragged ? "none" : `transform 250ms var(--ease-settle) ${delay}ms`,
                zIndex: isDragged ? 10 : 1,
                position: "relative",
                boxShadow: isDragged ? "0 18px 32px -16px rgb(20 40 70 / 0.35)" : undefined,
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
          );
        })}
      </div>
      <p className="crease-caption mt-3" role="status">
        当前顺序：{items.map(i => i.label).join(" → ")}。Esc 取消拖拽。
      </p>
    </Section>
  );
}

/* ————— 006 书本式展开卡片 ————— */

function BookSection() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const N = 4; // cover + 3 pages
  const layer = (n: number) => {
    const angle = 42 * Math.pow(0.7, n);
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
    <Section no="006" title="书本式展开卡片">
      <div
        className="ilab-book max-w-sm"
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label="设计年鉴卡片，按回车展开或合上"
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
          <div
            className="ilab-book-shadow"
            style={{ inset: "auto 6% -14px 6%", height: 26, filter: "blur(14px)", opacity: open ? 0 : 0.5 }}
          />
          <div
            className="ilab-book-shadow"
            style={{ inset: "auto 2% -26px 2%", height: 40, filter: "blur(38px)", opacity: open ? 0.55 : 0 }}
          />
          <div className="ilab-book-stage absolute inset-0">
            <div className="absolute inset-1.5 rounded-[14px] bg-[#11161d]" />
            {[3, 2, 1].map(n => (
              <div
                key={n}
                className="ilab-book-layer rounded-xl"
                style={{
                  ...layer(n),
                  top: 4,
                  bottom: 4,
                  left: 4,
                  right: 8,
                  background: `linear-gradient(100deg, rgb(24 32 44 / ${0.16 - n * 0.03}) 0%, rgb(255 255 255 / 0) 55%), ${n === 1 ? "#f4f7fa" : n === 2 ? "#e9eff4" : "#dde6ee"}`,
                  boxShadow: "inset 0 0 0 1px rgb(20 40 70 / 0.08)",
                }}
              >
                <div className="p-4">
                  <p className="crease-caption">内页 {n}</p>
                  <div className="mt-3 space-y-2">
                    {[86, 64, 74].map((w, i) => (
                      <div key={i} className="h-1.5 rounded bg-[#263140]/15" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div className="ilab-book-layer crease-glass rounded-[20px]" style={layer(0)}>
              <div className="flex h-full flex-col justify-between p-6">
                <p className="crease-eyebrow">设计年鉴 · 2026</p>
                <div>
                  <h3 className="crease-heading">白色场域的<br />一年</h3>
                  <p className="crease-caption mt-2">悬停或聚焦，沿左边缘展开</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      <div lang="zh" className={`crease-glass max-w-2xl rounded-2xl p-6 sm:p-8 ${on ? "ilab-type-on" : ""}`}>
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
    </Section>
  );
}

/* ————— 008 Wiki 布局 ————— */

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
  const raf = useRef(0);

  const onContentScroll = () => {
    window.cancelAnimationFrame(raf.current);
    raf.current = window.requestAnimationFrame(() => {
      const box = contentRef.current;
      if (!box) return;
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

  const maskImage = `linear-gradient(to bottom, ${mask.above ? "transparent 0, black 40px" : "black 0"}, black calc(100% - ${mask.below ? "56px" : "0px"}), ${mask.below ? "transparent 100%" : "black 100%"})`;

  return (
    <Section no="008" title="Wiki 布局">
      <div className="grid h-[380px] grid-cols-[148px_minmax(0,1fr)] overflow-hidden rounded-2xl border bg-white/60 sm:grid-cols-[180px_minmax(0,1fr)]">
        <nav
          ref={tocRef}
          aria-label="章节目录"
          className="ilab-wiki-scroll overflow-y-auto border-r py-3"
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
                if (box && el) box.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
              }}
            >
              {ch.title}
            </button>
          ))}
          <div className="px-4 pt-6 pb-2">
            <p className="crease-caption">目录到底部后，下方遮罩消失。</p>
          </div>
        </nav>
        <div ref={contentRef} className="overflow-y-auto px-6 py-5" onScroll={onContentScroll}>
          {wikiChapters.map(ch => (
            <article key={ch.id} id={`wiki-${ch.id}`} className="mb-10 scroll-mt-3">
              <h3 className="text-base font-medium">{ch.title}</h3>
              <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">{ch.body}</p>
              <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">{ch.body}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ————— 009 浮层选择 ————— */

function OverlaySection() {
  const [popOpen, setPopOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);
  const undoTimer = useRef(0);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popOpen) return;
    const onDown = (e: PointerEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPopOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [popOpen]);

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

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="min-h-11">对话框</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>移除成员</DialogTitle>
                <DialogDescription>移除后，该成员将立即失去「品牌站改版」的访问权限，此操作不可撤销。</DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="destructive">移除成员</Button>
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
          <p className="crease-caption flex min-h-14 items-center" role="status">列表已空。能撤销的动作不弹确认框。</p>
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

/* ————— 010 液态玻璃 ————— */

function LiquidSection() {
  const [pos, setPos] = useState(30);
  return (
    <Section no="010" title="液态玻璃">
      <div className="relative h-72 overflow-hidden rounded-2xl border">
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
              "radial-gradient(38% 55% at 82% 88%, rgb(211 18 24 / 0.28), transparent 70%), radial-gradient(45% 60% at 8% 0%, rgb(140 205 255 / 0.35), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="ilab-liquid absolute top-1/2 left-1/2 w-[min(264px,80%)] -translate-x-1/2 -translate-y-1/2 rounded-[24px] p-5">
          <p className="text-sm font-medium text-[#10151bcc]">玻璃面板</p>
          <p className="mt-1 text-sm leading-6 text-[#3c4043b3]">模糊只有 2px，颜色来自背后的图像；边缘折射高光标出厚度。</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm">主要</Button>
            <Button size="sm" variant="outline">次要</Button>
          </div>
        </div>
      </div>
      <label className="mt-5 flex max-w-md items-center gap-4 text-sm">
        <span className="shrink-0 font-medium">背景位置</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={e => setPos(Number(e.target.value))}
          className="min-h-11 flex-1"
          style={{ accentColor: "var(--primary)" }}
          aria-label="背景位置"
        />
        <span className="w-10 text-right tabular-nums">{pos}%</span>
      </label>
    </Section>
  );
}

/* ————— 011 缓动曲线 ————— */

const easingRoles = [
  { name: "进入", css: "cubic-bezier(0, 0, 0.58, 1)", dur: 220 },
  { name: "落位", css: "cubic-bezier(0.22, 1, 0.36, 1)", dur: 200 },
  { name: "离开", css: "cubic-bezier(0.42, 0, 1, 1)", dur: 180 },
  { name: "移位", css: "cubic-bezier(0.42, 0, 0.58, 1)", dur: 300 },
  { name: "回弹", css: "cubic-bezier(0.34, 1.56, 0.64, 1)", dur: 330 },
];

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
      <div className="max-w-2xl space-y-3">
        {easingRoles.map((role, i) => (
          <div key={role.name} className="flex items-center gap-4">
            <Button variant="outline" className="min-h-11 w-24 shrink-0" onClick={() => run(i)}>
              {role.name}
            </Button>
            <div className="relative h-11 flex-1 rounded-full bg-secondary/70">
              <span
                ref={el => {
                  dots.current[i] = el;
                }}
                className="absolute top-2 left-[6px] size-7 rounded-full bg-primary shadow"
              />
            </div>
            <span className="crease-caption hidden w-44 shrink-0 tabular-nums sm:block">{role.css}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ————— 012 消息气泡 ————— */

type Bubble = { id: number; from: "me" | "ai"; text: string };
const bubbleInitial: Bubble[] = [
  { id: 1, from: "ai", text: "新版首页的视觉走查安排在周四下午。" },
  { id: 2, from: "ai", text: "记得带上深色模式的截图。" },
  { id: 3, from: "me", text: "好，我把问题清单一起整理过去。" },
  { id: 4, from: "ai", text: "收到，走查结论会同步到项目页。" },
];

function bubbleRadius(b: Bubble, prev?: Bubble, next?: Bubble) {
  const prevSame = prev?.from === b.from;
  const nextSame = next?.from === b.from;
  if (b.from === "me") return `20px ${prevSame ? 10 : 20}px ${nextSame ? 10 : 20}px 20px`;
  return `${prevSame ? 10 : 20}px 20px 20px ${nextSame ? 10 : 20}px`;
}

function BubblesSection() {
  const reduced = useReducedMotion();
  const [messages, setMessages] = useState(bubbleInitial);
  const [draft, setDraft] = useState("");
  const seq = useRef(5);
  const els = useRef(new Map<number, HTMLDivElement>());
  const entered = useRef(new Set<number>());
  const pendingFlip = useRef<{ tops: Map<number, number>; deletedIndex: number } | null>(null);

  useLayoutEffect(() => {
    const flip = pendingFlip.current;
    if (!flip) return;
    pendingFlip.current = null;
    const movers: { el: HTMLDivElement; dy: number; dist: number }[] = [];
    messages.forEach((m, idx) => {
      const el = els.current.get(m.id);
      const oldTop = flip.tops.get(m.id);
      if (!el || oldTop === undefined) return;
      const dy = oldTop - el.getBoundingClientRect().top;
      if (Math.abs(dy) > 1 && idx < flip.deletedIndex) {
        movers.push({ el, dy, dist: Math.abs(idx - flip.deletedIndex) });
      }
    });
    movers.sort((a, b) => a.dist - b.dist);
    movers.forEach((mover, rank) => {
      if (reduced) return;
      mover.el.animate(
        [{ transform: `translateY(${mover.dy}px)` }, { transform: "translateY(0px)" }],
        { duration: 460, delay: 60 + rank * 65, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    });
  }, [messages, reduced]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: seq.current++, from: "me", text }]);
    setDraft("");
  };

  const remove = (id: number) => {
    const tops = new Map<number, number>();
    els.current.forEach((el, key) => tops.set(key, el.getBoundingClientRect().top));
    pendingFlip.current = { tops, deletedIndex: messages.findIndex(m => m.id === id) };
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <Section no="012" title="消息气泡">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col" role="log" aria-label="演示对话">
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const groupStart = !prev || prev.from !== m.from;
            return (
              <div
                key={m.id}
                ref={el => {
                  if (el) els.current.set(m.id, el);
                  else els.current.delete(m.id);
                }}
                className={`group relative max-w-[78%] ${m.from === "me" ? "self-end" : "self-start"}`}
                style={{ marginTop: groupStart ? 16 : 4 }}
              >
                <div
                  ref={el => {
                    if (el && !entered.current.has(m.id)) {
                      entered.current.add(m.id);
                      if (!reduced) {
                        el.animate(
                          [
                            { transform: "translateY(14px) scale(0.94)", opacity: 0 },
                            { transform: "translateY(0px) scale(1)", opacity: 1 },
                          ],
                          { duration: 380, easing: "cubic-bezier(0.34, 1.4, 0.64, 1)" },
                        );
                      }
                    }
                  }}
                  className={`px-4 py-2.5 text-sm leading-6 ${m.from === "me" ? "crease-ink" : "crease-glass"}`}
                  style={{ borderRadius: bubbleRadius(m, prev, next) }}
                >
                  {m.text}
                </div>
                <button
                  type="button"
                  aria-label={`删除消息：${m.text}`}
                  onClick={() => remove(m.id)}
                  className="absolute top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  style={m.from === "me" ? { left: -44 } : { right: -44 }}
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </div>
        <form
          className="mt-5 flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            send();
          }}
        >
          <label className="sr-only" htmlFor="bubble-input">输入消息</label>
          <Input
            id="bubble-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="写一句话，发出去看入场"
            className="h-11"
          />
          <Button type="submit" className="min-h-11 shrink-0">
            <Send />发送
          </Button>
        </form>
      </div>
    </Section>
  );
}

/* ————— 013 冲击波光晕 ————— */

function ShockSection() {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const [burst, setBurst] = useState(0);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  useEffect(() => () => window.cancelAnimationFrame(rafId.current), []);

  const fire = () => {
    const panel = panelRef.current;
    const btn = btnRef.current;
    const ring = ringRef.current;
    if (!panel || !btn || !ring) return;
    const p = panel.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    setCenter({ x: b.left - p.left + b.width / 2, y: b.top - p.top + b.height / 2 });
    setBurst(k => k + 1);
    window.cancelAnimationFrame(rafId.current);
    if (reduced) {
      ring.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.35 }, { opacity: 0 }], { duration: 600, easing: "ease-out" });
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = clamp((now - start) / 1000, 0, 1);
      const radius = 650 + (800 * (1 - Math.pow(2, -9 * t))) / (1 - Math.pow(2, -9));
      const strength = Math.min(1, t / 0.03) * (1 - Math.pow(t, 2.2));
      ring.style.width = `${radius * 2}px`;
      ring.style.height = `${radius * 2}px`;
      ring.style.opacity = `${clamp(strength, 0, 1) * 0.9}`;
      if (t < 1) rafId.current = window.requestAnimationFrame(tick);
      else ring.style.opacity = "0";
    };
    rafId.current = window.requestAnimationFrame(tick);
  };

  return (
    <Section no="013" title="冲击波光晕">
      <div ref={panelRef} className="crease-canvas relative flex h-64 items-end justify-center overflow-hidden rounded-2xl border pb-10">
        <div
          key={burst}
          ref={ringRef}
          className="ilab-shock-ring"
          style={{
            left: center.x,
            top: center.y,
            width: 100,
            height: 100,
            opacity: 0,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(closest-side, transparent 56%, rgb(110 180 255 / 0.5) 68%, rgb(170 140 255 / 0.45) 78%, rgb(255 120 170 / 0.4) 87%, rgb(255 190 140 / 0.3) 94%, transparent 100%)",
          }}
          aria-hidden
        />
        <Button ref={btnRef} className="relative z-10 min-h-11" onClick={fire}>
          <Zap />触发光晕
        </Button>
      </div>
    </Section>
  );
}

/* ————— 014 卡片的四种消失 ————— */

type DeleteMode = "fade" | "blocks" | "peel" | "plume";
const deleteCards: { id: string; mode: DeleteMode; title: string; meta: string }[] = [
  { id: "fade", mode: "fade", title: "淡出坍缩", meta: "默认式 · 240ms 淡出 + 弹簧补位" },
  { id: "blocks", mode: "blocks", title: "碎块", meta: "3×3 切块依次散落" },
  { id: "peel", mode: "peel", title: "剥离", meta: "从底部掀起，露出背面" },
  { id: "plume", mode: "plume", title: "烟羽", meta: "暖化上升，交叉淡化" },
];

function DeleteCard({ mode, title, meta }: { mode: DeleteMode; title: string; meta: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const peelRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "anim" | "gone">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);

  const collapse = (delay: number, total: number) => {
    timers.current.push(
      window.setTimeout(() => {
        const wrap = wrapRef.current;
        if (wrap) {
          wrap.style.height = `${wrap.offsetHeight}px`;
          requestAnimationFrame(() => {
            wrap.style.transition = "height 520ms cubic-bezier(0.22, 1, 0.36, 1)";
            wrap.style.height = "0px";
          });
        }
      }, delay),
    );
    timers.current.push(window.setTimeout(() => setPhase("gone"), total));
  };

  const run = () => {
    if (phase !== "idle") return;
    setPhase("anim");
    if (mode === "fade") {
      contentRef.current?.classList.add("crease-exit");
      collapse(120, 700);
    } else if (mode === "blocks") {
      collapse(950, 1350);
    } else if (mode === "peel") {
      peelRef.current?.animate(
        [
          { transform: "rotateX(0deg) translateY(0px)", opacity: 1 },
          { transform: "rotateX(-96deg) translateY(10px)", opacity: 1, offset: 0.72 },
          { transform: "rotateX(-108deg) translateY(16px)", opacity: 0 },
        ],
        { duration: 620, easing: "cubic-bezier(0.42, 0, 1, 1)", fill: "forwards" },
      );
      collapse(640, 1080);
    } else {
      contentRef.current?.animate(
        [
          { transform: "translateY(0px) scale(1)", opacity: 1 },
          { transform: "translateY(-28px) scale(1.03)", opacity: 0 },
        ],
        { duration: 1160, easing: "cubic-bezier(0.42, 0, 0.58, 1)", fill: "forwards" },
      );
      warmRef.current?.animate([{ opacity: 0 }, { opacity: 0.85, offset: 0.3 }, { opacity: 0 }], {
        duration: 1160,
        easing: "ease-out",
        fill: "forwards",
      });
      collapse(720, 1300);
    }
  };

  const cardBody = (
    <>
      <FileText className="size-6 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="crease-caption mt-1">{meta}</p>
    </>
  );

  return (
    <div ref={wrapRef} className="overflow-hidden">
      {phase === "gone" ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed">
          <span className="crease-caption" role="status">已移除</span>
        </div>
      ) : (
        <div className="relative h-40">
          {mode === "peel" ? (
            <div className="ilab-peel-wrap h-full">
              <div ref={peelRef} className="ilab-peel h-full">
                <div className="ilab-peel-face crease-glass rounded-2xl p-5">{cardBody}</div>
                <div className="ilab-peel-face ilab-peel-back rounded-2xl bg-gradient-to-b from-white to-[#e6ecf1] p-5 shadow-[inset_0_0_0_1px_rgb(20_40_70/0.08)]">
                  <p className="crease-caption">背面 · 模切白边</p>
                </div>
              </div>
            </div>
          ) : (
            <div ref={contentRef} className="crease-glass relative h-full rounded-2xl p-5">
              {cardBody}
              {mode === "plume" && (
                <div
                  ref={warmRef}
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-[#ffd9ad]/70 via-[#ffe9c9]/40 to-transparent opacity-0"
                  aria-hidden
                />
              )}
            </div>
          )}
          {mode === "blocks" && phase === "anim" && (
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3" aria-hidden>
              {Array.from({ length: 9 }, (_, i) => {
                const dx = ((i % 3) - 1) * 90 + (i % 2 === 0 ? -18 : 22);
                const dy = 60 + (i % 4) * 26;
                return (
                  <div
                    key={i}
                    className="rounded-[4px] bg-[#eef2f5] shadow-[inset_0_0_0_1px_rgb(20_40_70/0.14)]"
                    ref={el => {
                      el?.animate(
                        [
                          { transform: "translate(0px, 0px) rotate(0deg) scale(1)", opacity: 1 },
                          {
                            transform: `translate(${dx}px, ${dy}px) rotate(${(i % 3 - 1) * 24}deg) scale(0.2)`,
                            opacity: 0,
                          },
                        ],
                        { duration: 820, delay: i * 30, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
                      );
                    }}
                  />
                );
              })}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 min-h-11 min-w-11"
            aria-label={`删除卡片：${title}`}
            onClick={run}
            disabled={phase !== "idle"}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}

function DeleteSection() {
  const [resetKey, setResetKey] = useState(0);
  return (
    <Section no="014" title="卡片的四种消失">
      <div className="mb-4 flex justify-end">
        <Button variant="outline" className="min-h-11" onClick={() => setResetKey(k => k + 1)}>
          <RotateCcw />恢复全部
        </Button>
      </div>
      <div key={resetKey} className="grid gap-4 sm:grid-cols-2">
        {deleteCards.map(c => (
          <DeleteCard key={c.id} mode={c.mode} title={c.title} meta={c.meta} />
        ))}
      </div>
    </Section>
  );
}

/* ————— 015 界面连续性 ————— */

function ContinuitySection() {
  const [open, setOpen] = useState(false);
  return (
    <Section no="015" title="界面连续性">
      <div className="relative overflow-hidden rounded-2xl border bg-white/50 p-5 sm:p-8">
        <div
          className="pointer-events-none grid grid-cols-3 gap-4"
          style={{
            transform: open ? "scale(0.94)" : "scale(1)",
            transition: "transform 450ms var(--ease-continuity)",
          }}
          aria-hidden
        >
          {[72, 48, 60].map((w, i) => (
            <div key={i} className="rounded-xl bg-secondary/80 p-4">
              <div className="h-2 rounded bg-border" style={{ width: `${w}%` }} />
              <div className="mt-3 h-2 w-2/3 rounded bg-border" />
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: open ? 0.3 : 0, transition: "opacity 450ms var(--ease-continuity)" }}
          aria-hidden
        />
        <div
          className="crease-glass relative z-10 mx-auto mt-6 max-w-lg p-5"
          style={{
            borderRadius: open ? 28 : 20,
            transition: "border-radius 450ms var(--ease-continuity)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="size-14 shrink-0 rounded-xl bg-gradient-to-br from-[#8ecdff] via-white to-[#ffb3b6]" aria-hidden />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-medium">品牌站改版 · 本周进展</h3>
              <p className="crease-caption mt-0.5">同一张卡片，长成详情</p>
            </div>
            <Button
              variant="outline"
              className="min-h-11 shrink-0"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
            >
              {open ? "收起" : "展开"}
              <ChevronDown className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </Button>
          </div>
          <div className="ilab-grow" data-open={open || undefined}>
            <div>
              <div className="ilab-continuity-detail pt-5">
                <div className="grid grid-cols-3 gap-4 border-t pt-5">
                  {[
                    { label: "已完成页面", value: "18" },
                    { label: "进行中", value: "6" },
                    { label: "待评审", value: "3" },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-2xl font-medium tabular-nums">{s.value}</p>
                      <p className="crease-caption mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  首页与产品页已通过视觉走查，剩下设置页的深色模式对比度修正。详情内容在卡片移动过半后才淡入，收起时沿原路逆放。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ————— 016 Toast 与通知 ————— */

function ToastButtons() {
  const { toast, notify } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button className="min-h-11" onClick={() => toast("设置已保存")}>
        <Check />状态提示
      </Button>
      <Button
        variant="outline"
        className="min-h-11"
        onClick={() =>
          notify({
            title: "导出完成",
            body: "季度报告.pdf 已生成，可以下载。",
            actionLabel: "下载",
            onAction: () => {},
          })
        }
      >
        <Bell />通知卡
      </Button>
      <Button
        variant="ghost"
        className="min-h-11"
        onClick={() =>
          notify({
            title: "成员邀请",
            body: "林小满邀请你加入「品牌站改版」。",
            actionLabel: "查看",
            onAction: () => {},
          })
        }
      >
        再来一条
      </Button>
    </div>
  );
}

function ToastSection() {
  return (
    <Section no="016" title="Toast 与通知">
      <ToastProvider>
        <ToastButtons />
      </ToastProvider>
    </Section>
  );
}

/* ————— 017 加载状态 ————— */

const loadRows = [
  { name: "品牌站改版", value: "68%" },
  { name: "移动端适配", value: "42%" },
  { name: "设计走查", value: "85%" },
  { name: "交付评审", value: "12%" },
];

function LoadingSection() {
  const [phase, setPhase] = useState<"idle" | "wait" | "skeleton" | "done">("idle");
  const [status, setStatus] = useState("当前显示上次的数据。");
  const timers = useRef<number[]>([]);
  const loading = phase === "wait" || phase === "skeleton";

  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);

  const run = () => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
    const duration = Math.round(200 + Math.random() * 1200);
    let skeletonAt = 0;
    setPhase("wait");
    setStatus("加载中…");
    timers.current.push(
      window.setTimeout(() => {
        skeletonAt = performance.now();
        setPhase("skeleton");
      }, 300),
    );
    timers.current.push(
      window.setTimeout(() => {
        const finish = () => {
          setPhase("done");
          setStatus(`已完成，本次等待 ${duration}ms。`);
        };
        if (skeletonAt) {
          const remain = 500 - (performance.now() - skeletonAt);
          if (remain > 0) timers.current.push(window.setTimeout(finish, remain));
          else finish();
        } else {
          finish();
        }
      }, duration),
    );
  };

  return (
    <Section no="017" title="加载状态">
      <div className="max-w-xl">
        <div className="mb-4 flex items-center gap-4">
          <Button className="min-h-11" onClick={run} disabled={loading}>
            <RotateCcw className={loading ? "animate-spin" : undefined} />
            重新加载
          </Button>
          <span className="crease-caption" role="status" aria-live="polite">{status}</span>
        </div>
        <div aria-busy={loading}>
          {phase === "skeleton" ? (
            <div className="space-y-2">
              {loadRows.map((_, i) => (
                <div key={i} className="crease-shimmer rounded-xl">
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {loadRows.map((row, i) => (
                <li
                  key={row.name}
                  className={`crease-glass flex h-12 items-center justify-between rounded-xl px-4 ${phase === "done" ? "ilab-row-in" : ""}`}
                  style={phase === "done" ? { animationDelay: `${i * 40}ms` } : undefined}
                >
                  <span className="text-sm font-medium">{row.name}</span>
                  <span className="text-sm tabular-nums">{row.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="crease-caption mt-3">规则：等待不足 300ms 不显示骨架；骨架一旦出现至少留 500ms；内容逐行淡入，间隔 40ms。</p>
      </div>
    </Section>
  );
}

/* ————— 018 全息卡片 ————— */

function HoloSection() {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const glareFrontRef = useRef<HTMLDivElement>(null);
  const glareBackRef = useRef<HTMLDivElement>(null);
  const ringFrontRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const state = useRef({
    tiltX: 0, tiltY: 0, vX: 0, vY: 0,
    flip: 0, flipV: 0, flipTarget: 0,
    gx: 34, gy: 22, gvx: 0, gvy: 0, tgx: 34, tgy: 22,
    on: 0, onTarget: 0, lastPointer: 0, raf: 0, last: 0,
    pointerTiltX: undefined as number | undefined,
    pointerTiltY: undefined as number | undefined,
  });

  useEffect(() => {
    if (reduced) return;
    const s = state.current;
    s.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      // sway target when pointer has been away
      let tX = 0;
      let tY = 0;
      if (now - s.lastPointer > 1200) {
        const t = now / 1000;
        tX = 2.2 * Math.sin(0.9 * t + 0.6) + 0.8 * Math.sin(2.3 * t);
        tY = 3.2 * Math.sin(0.7 * t) + 0.9 * Math.sin(1.9 * t + 1.2);
        s.tgx = 34 + tY * 3;
        s.tgy = 22 - tX * 3;
      }
      // tilt spring 140 / 15
      s.vX += (140 * ((s.pointerTiltX ?? tX) - s.tiltX) - 15 * s.vX) * dt;
      s.vY += (140 * ((s.pointerTiltY ?? tY) - s.tiltY) - 15 * s.vY) * dt;
      s.tiltX += s.vX * dt;
      s.tiltY += s.vY * dt;
      // glare spring k160, critically damped d≈25.3
      s.gvx += (160 * (s.tgx - s.gx) - 25.3 * s.gvx) * dt;
      s.gvy += (160 * (s.tgy - s.gy) - 25.3 * s.gvy) * dt;
      s.gx += s.gvx * dt;
      s.gy += s.gvy * dt;
      // flip spring 70 / 11
      s.flipV += (70 * (s.flipTarget - s.flip) - 11 * s.flipV) * dt;
      s.flip += s.flipV * dt;
      s.on += (s.onTarget - s.on) * (1 - Math.exp(-7 * dt));

      const card = cardRef.current;
      if (card) {
        const lift = Math.abs(Math.sin((s.flip * Math.PI) / 180)) * 40;
        card.style.transform = `translateZ(${lift}px) rotateY(${s.flip + s.tiltY}deg) rotateX(${s.tiltX}deg)`;
      }
      const glare = `radial-gradient(circle at ${s.gx}% ${s.gy}%, rgb(255 255 255 / 0.6), rgb(255 255 255 / 0.14) 28%, rgb(0 0 0 / 0.3) 95%)`;
      if (glareFrontRef.current) {
        glareFrontRef.current.style.background = glare;
        glareFrontRef.current.style.opacity = `${0.35 + s.on * 0.65}`;
      }
      if (glareBackRef.current) {
        glareBackRef.current.style.background = `radial-gradient(circle at ${100 - s.gx}% ${s.gy}%, rgb(255 255 255 / 0.6), rgb(255 255 255 / 0.14) 28%, rgb(0 0 0 / 0.3) 95%)`;
        glareBackRef.current.style.opacity = `${0.35 + s.on * 0.65}`;
      }
      if (ringFrontRef.current) {
        ringFrontRef.current.style.background = `radial-gradient(circle at ${s.gx}% ${s.gy}%, rgb(255 255 255 / 0.5), transparent 42%)`;
        ringFrontRef.current.style.opacity = `${0.6 + s.on * 0.4}`;
      }
      if (shadowRef.current) {
        shadowRef.current.style.transform = `translate(${(-s.tiltY * 1.8).toFixed(1)}px, ${(s.tiltX * 1.2).toFixed(1)}px) scaleX(${1 - Math.abs(Math.sin((s.flip * Math.PI) / 180)) * 0.45})`;
      }
      s.raf = window.requestAnimationFrame(tick);
    };
    state.current.raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(state.current.raf);
  }, [reduced]);

  const onMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const fx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const fy = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const s = state.current;
    s.lastPointer = performance.now();
    s.onTarget = 1;
    s.tgx = fx * 100;
    s.tgy = fy * 100;
    s.pointerTiltX = -(2 * fy - 1) * 12;
    s.pointerTiltY = (2 * fx - 1) * 12;
    if (reduced) {
      if (glareFrontRef.current) {
        glareFrontRef.current.style.background = `radial-gradient(circle at ${fx * 100}% ${fy * 100}%, rgb(255 255 255 / 0.6), rgb(255 255 255 / 0.14) 28%, rgb(0 0 0 / 0.3) 95%)`;
        glareFrontRef.current.style.opacity = "1";
      }
    }
  };

  const onLeave = () => {
    const s = state.current;
    s.onTarget = 0;
    s.pointerTiltX = undefined;
    s.pointerTiltY = undefined;
    s.lastPointer = performance.now();
  };

  const flip = () => {
    const s = state.current;
    s.flipTarget = s.flipTarget === 0 ? 180 : 0;
    setFlipped(s.flipTarget === 180);
    if (reduced && cardRef.current) {
      cardRef.current.style.transform = `rotateY(${s.flipTarget}deg)`;
    }
  };

  return (
    <Section no="018" title="全息卡片">
      <div className="ilab-holo-scene flex flex-col items-center py-4">
        <div className="relative">
          <div
            ref={shadowRef}
            className="absolute left-1/2 top-full mt-[30px] h-[70px] w-[84%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-[24px]"
            aria-hidden
          />
          <div
            ref={cardRef}
            className="ilab-holo h-[420px] w-[300px] cursor-pointer rounded-[28px]"
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label="CREASE 会员卡，点击翻面"
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            onClick={flip}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                flip();
              }
            }}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="ilab-holo-edge rounded-[28px]" style={{ transform: `translateZ(${-5 + i}px)` }} aria-hidden />
            ))}
            <div className="ilab-holo-face ilab-holo-front rounded-[28px] bg-gradient-to-br from-[#1d2a4a] via-[#2c4470] to-[#10182c] text-white">
              <div className="flex h-full flex-col justify-between p-6">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold tracking-[0.18em]">CREASE</p>
                  <CreditCard className="size-6 opacity-80" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.3em] opacity-70">MEMBER</p>
                  <p className="mt-2 text-xl font-medium">林小满</p>
                  <p className="mt-1 text-sm tabular-nums opacity-80">6200 ···· 2026</p>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-xs opacity-70">有效期至 2028.12</p>
                  <span className="ilab-holo-stamp grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)]" aria-hidden>
                    <Check className="size-5 text-white" />
                  </span>
                </div>
              </div>
              <div ref={glareFrontRef} className="ilab-holo-glare" aria-hidden />
              <div ref={ringFrontRef} className="ilab-holo-ring" aria-hidden />
            </div>
            <div className="ilab-holo-face ilab-holo-back crease-ink rounded-[28px]">
              <div className="flex h-full flex-col p-6">
                <div className="-mx-6 h-10 bg-black/70" aria-hidden />
                <p className="mt-6 text-sm leading-7 text-[#c5cad2]">此卡为 CREASE 会员凭证。遗失请立即在设置中冻结，补办后旧卡自动失效。</p>
                <div
                  className="mt-auto h-12 rounded-md"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, #e8ecf0 0 2px, transparent 2px 5px, #e8ecf0 5px 8px, transparent 8px 11px, #e8ecf0 11px 12px, transparent 12px 17px)",
                  }}
                  aria-hidden
                />
                <p className="mt-3 text-center text-xs tabular-nums text-[#c5cad2]">6200 2026 0018</p>
              </div>
              <div ref={glareBackRef} className="ilab-holo-glare" aria-hidden />
            </div>
          </div>
        </div>
        <p className="crease-caption mt-16">移动指针倾斜，点击翻面</p>
      </div>
    </Section>
  );
}

/* ————— 019 滚动驱动卡片 ————— */

const stackCards = [
  { title: "调研结论", tint: "#eef2f5" },
  { title: "信息架构", tint: "#e4ebef" },
  { title: "视觉走查", tint: "#d9e2e9" },
  { title: "交付清单", tint: "#cdd9e2" },
];
const flowCards = ["访谈纪要", "竞品拆解", "用户旅程", "低保真原型", "可用性测试"];

function ScrollSection() {
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const stackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ticking = useRef(false);

  const update = useCallback(() => {
    const box = boxRef.current;
    if (!box || reduced) return;
    const boxRect = box.getBoundingClientRect();
    stackRefs.current.forEach((card, i) => {
      if (!card || i >= stackCards.length - 1) return;
      const next = stackRefs.current[i + 1];
      if (!next) return;
      const stickyTop = 24 + i * 16;
      const nextTop = next.getBoundingClientRect().top - boxRect.top;
      const k = clamp((stickyTop + 190 - nextTop) / 190, 0, 1);
      card.style.transform = `scale(${1 - k * 0.05})`;
      const overlay = overlayRefs.current[i];
      if (overlay) overlay.style.opacity = `${k * 0.12}`;
    });
    const center = boxRect.top + boxRect.height / 2;
    flowRefs.current.forEach(card => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const d = clamp((r.top + r.height / 2 - center) / (boxRect.height / 2), -1.2, 1.2);
      const cd = clamp(d, -1, 1);
      card.style.transform = `rotateY(${cd * -30}deg) scale(${Math.max(0.6, 1 - Math.abs(cd) * 0.2)})`;
      card.style.opacity = `${1 - Math.min(Math.abs(d), 1) * 0.45}`;
    });
  }, [reduced]);

  useEffect(() => {
    update();
  }, [update]);

  const onScroll = () => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      update();
      ticking.current = false;
    });
  };

  return (
    <Section no="019" title="滚动驱动卡片">
      <div
        ref={boxRef}
        className="ilab-scrollbox h-[420px] overflow-y-auto rounded-2xl border bg-white/50 px-5 py-5"
        onScroll={onScroll}
        tabIndex={0}
        aria-label="滚动驱动演示区，在区域内滚动"
      >
        <p className="crease-eyebrow">堆叠卡</p>
        <div className="mt-3">
          {stackCards.map((card, i) => (
            <div key={card.title} className="h-[248px]">
              <div
                ref={el => {
                  stackRefs.current[i] = el;
                }}
                className="ilab-stack-card sticky h-[190px] overflow-hidden rounded-[24px] p-5"
                style={{ top: 24 + i * 16, background: card.tint }}
              >
                <p className="text-sm font-medium">{String(i + 1).padStart(2, "0")} · {card.title}</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">后来者到达时，这张卡退后 5%、压暗 12%，露出 16px 边条表示层序。</p>
                <div
                  ref={el => {
                    overlayRefs.current[i] = el;
                  }}
                  className="pointer-events-none absolute inset-0 bg-black opacity-0"
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </div>
        <p className="crease-eyebrow mt-4">入场流</p>
        <div className="ilab-flow-wrap mt-3 pb-10">
          {flowCards.map((title, i) => (
            <div
              key={title}
              ref={el => {
                flowRefs.current[i] = el;
              }}
              className="crease-glass mb-6 flex h-[110px] items-center justify-between rounded-2xl px-6"
            >
              <span className="text-sm font-medium">{title}</span>
              <span className="crease-caption tabular-nums">{String(i + 1).padStart(2, "0")} / 05</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ————— 020 选择控件 ————— */

const capacities = ["4 人", "6 人", "8 人", "12 人"];
const cities = ["上海", "北京", "深圳", "杭州", "成都", "广州", "南京", "远程"];

function ChoiceSection() {
  const [cap, setCap] = useState(1);
  const [city, setCity] = useState("上海");
  const [remind, setRemind] = useState(false);
  return (
    <Section no="020" title="选择控件">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="crease-glass rounded-2xl p-5">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-muted-foreground" />会议室容量
          </p>
          <div className="relative mt-4 flex rounded-full bg-secondary p-1" role="radiogroup" aria-label="会议室容量">
            <span
              className="ilab-seg-indicator absolute top-1 bottom-1 left-1 rounded-full bg-background shadow"
              style={{ width: "calc((100% - 8px) / 4)", transform: `translateX(${cap * 100}%)` }}
              aria-hidden
            />
            {capacities.map((c, i) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={cap === i}
                className={`relative z-10 min-h-11 flex-1 rounded-full text-sm ${cap === i ? "font-medium" : "text-muted-foreground"}`}
                onClick={() => setCap(i)}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="crease-caption mt-3">2–5 个短选项用分段控件 · 已选 {capacities[cap]}间</p>
        </div>
        <div className="crease-glass rounded-2xl p-5">
          <label htmlFor="city-select" className="text-sm font-medium">所在城市</label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger id="city-select" className="mt-4 h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="crease-caption mt-3">6 个以上选项用 Select · 当前值 {city}</p>
        </div>
        <div className="crease-glass rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="remind-switch" className="text-sm font-medium">会前提醒</label>
            <span className="flex min-h-11 min-w-11 items-center justify-center">
              <Switch id="remind-switch" checked={remind} onCheckedChange={setRemind} />
            </span>
          </div>
          <p className="crease-caption mt-3">开/关用 Switch，立即生效，不配保存按钮。</p>
          {remind && (
            <p className="ilab-row-in mt-4 flex items-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm text-accent-foreground" role="status">
              <Bell className="size-4 shrink-0" />演示通知：会议将在 10 分钟后开始
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ————— 021 环形卡片 ————— */

const ringCards = [
  { label: "场域", bg: "linear-gradient(160deg, #f6f8fa, #dbe4ec)" },
  { label: "玻璃", bg: "linear-gradient(160deg, #dcefff, #a8d4f5)" },
  { label: "亚克力", bg: "linear-gradient(160deg, #3a4353, #11161d)" },
  { label: "信号", bg: "linear-gradient(160deg, #ff8a8e, #d31218)" },
  { label: "刻字", bg: "linear-gradient(160deg, #fdfdfd, #e3e8ee)" },
  { label: "流光", bg: "linear-gradient(160deg, #bfe3ff, #eaf7ff)" },
  { label: "刻度", bg: "linear-gradient(160deg, #f2f4f6, #ccd5dd)" },
  { label: "路径", bg: "linear-gradient(160deg, #ffd9da, #fff1f1)" },
  { label: "留白", bg: "linear-gradient(160deg, #ffffff, #eef1f4)" },
];
const RING_R = 235;
const RING_STEP = 360 / ringCards.length;

function RingSection() {
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; angle: number } | null>(null);
  const front = ((Math.round(-angle / RING_STEP) % ringCards.length) + ringCards.length) % ringCards.length;

  const snap = (a: number) => Math.round(a / RING_STEP) * RING_STEP;

  return (
    <Section no="021" title="环形卡片">
      <div
        className="ilab-ring-scene relative h-[320px] overflow-hidden rounded-2xl border bg-white/50"
        onPointerDown={e => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          dragStart.current = { x: e.clientX, angle };
          setDragging(true);
        }}
        onPointerMove={e => {
          if (!dragStart.current) return;
          setAngle(dragStart.current.angle + (e.clientX - dragStart.current.x) * 0.35);
        }}
        onPointerUp={() => {
          if (dragStart.current) setAngle(a => snap(a));
          dragStart.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          dragStart.current = null;
          setDragging(false);
        }}
      >
        <div
          className="absolute inset-x-10 top-1/2 h-44 -translate-y-1/2 rounded-full opacity-60 blur-2xl"
          style={{ background: "linear-gradient(90deg, rgb(140 205 255 / 0.5), rgb(255 255 255 / 0.2), rgb(211 18 24 / 0.25))" }}
          aria-hidden
        />
        {ringCards.map((card, i) => {
          const a = angle + i * RING_STEP;
          const rad = (a * Math.PI) / 180;
          const z = Math.cos(rad);
          return (
            <button
              key={card.label}
              type="button"
              aria-label={`将「${card.label}」转到正前`}
              className="ilab-ring-card flex h-[180px] w-[130px] flex-col justify-between rounded-[24px] p-4 text-left shadow-[inset_0_0_0_1px_rgb(20_40_70/0.1)]"
              style={{
                transform: `translate(-50%, -50%) rotateY(${a}deg) translateZ(${RING_R}px)`,
                background: card.bg,
                opacity: 0.3 + 0.7 * ((z + 1) / 2),
                zIndex: Math.round(z * 100),
                transition: dragging ? "none" : undefined,
                color: i === 2 || i === 3 ? "#fff" : undefined,
              }}
              onClick={() => {
                if (!dragging) setAngle(snap(-i * RING_STEP + Math.round((angle + i * RING_STEP) / 360) * 360));
              }}
            >
              <span className="text-xs tabular-nums opacity-70">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-base font-medium">{card.label}</span>
            </button>
          );
        })}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
          <Button variant="outline" size="icon" className="min-h-11 min-w-11 rounded-full" aria-label="上一张" onClick={() => setAngle(a => snap(a + RING_STEP))}>
            <ChevronLeft />
          </Button>
          <span className="crease-caption w-20 text-center" role="status">当前：{ringCards[front].label}</span>
          <Button variant="outline" size="icon" className="min-h-11 min-w-11 rounded-full" aria-label="下一张" onClick={() => setAngle(a => snap(a - RING_STEP))}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* ————— 022 空状态 ————— */

function WireframeArt({ action = true }: { action?: boolean }) {
  return (
    <svg viewBox="0 0 120 90" className="h-[90px] w-[120px]" aria-hidden>
      <rect x="10" y="14" width="100" height="62" rx="10" fill="#eef1f4" stroke="#d3dbe1" />
      <rect x="20" y="26" width="46" height="5" rx="2.5" fill="#aeb9c2" />
      <rect x="20" y="40" width="80" height="4" rx="2" fill="#c6cfd7" />
      <rect x="20" y="50" width="62" height="4" rx="2" fill="#c6cfd7" />
      {action && (
        <>
          <circle cx="88" cy="61" r="9" fill="#d31218" />
          <path d="M88 56.5v9M83.5 61h9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function EmptySection() {
  return (
    <Section no="022" title="空状态">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="crease-caption mb-2">页面级</p>
          <div className="relative h-72 rounded-2xl border bg-white/50">
            <div className="absolute left-1/2 top-[40%] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center px-6 text-center">
              <WireframeArt />
              <h3 className="mt-3 text-base font-medium">还没有任务</h3>
              <p className="crease-caption mt-1">创建第一个任务，开始安排本周的工作。</p>
              <div className="mt-4 flex gap-2">
                <Button className="min-h-11">创建任务</Button>
                <Button variant="ghost" className="min-h-11">导入</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <p className="crease-caption mb-2">卡片级</p>
            <div className="crease-glass flex items-center gap-3 rounded-2xl p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-secondary">
                <Inbox className="size-[22px] text-muted-foreground" />
              </span>
              <p className="flex-1 text-sm font-medium">还没有成员加入</p>
              <Button variant="ghost" size="sm" className="min-h-11">邀请</Button>
            </div>
          </div>
          <div>
            <p className="crease-caption mb-2">行级</p>
            <ul className="divide-y rounded-2xl border bg-white/60">
              <li className="flex min-h-12 items-center justify-between px-4 text-sm">
                <span className="font-medium">首页视觉走查</span>
                <span className="crease-caption">进行中</span>
              </li>
              <li className="flex min-h-12 items-center justify-between px-4 text-sm">
                <span className="font-medium">设置页对比度修正</span>
                <span className="crease-caption">待开始</span>
              </li>
              <li className="flex min-h-12 items-center justify-between px-4">
                <span className="text-sm text-muted-foreground">暂无待处理邀请</span>
                <Button variant="ghost" size="sm" className="min-h-11">查看全部</Button>
              </li>
            </ul>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="crease-caption mb-2">菜单级</p>
              <div className="w-full rounded-xl border bg-white p-1.5 shadow-lg">
                <p className="flex min-h-11 items-center rounded-lg px-2 text-sm font-medium hover:bg-secondary">编辑</p>
                <p className="flex min-h-11 items-center rounded-lg px-2 text-sm font-medium hover:bg-secondary">复制</p>
                <div className="my-1 border-t" />
                <p className="flex min-h-11 items-center px-2 text-sm text-muted-foreground">没有更多结果</p>
              </div>
            </div>
            <div>
              <p className="crease-caption mb-2">全部处理完 · 无按钮</p>
              <div className="flex items-start gap-3 rounded-2xl border bg-white/60 p-4">
                <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[#7a869d]" />
                <div>
                  <p className="text-sm font-medium">全部处理完</p>
                  <p className="crease-caption mt-1">新的待办会出现在这里。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}
