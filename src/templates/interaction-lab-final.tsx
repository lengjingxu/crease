import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle, Bell, Check, CheckCircle2, ChevronLeft, ChevronRight, Inbox, Lock, RotateCcw, Search, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Section, clamp, lerp, smooth, useReducedMotion } from "./interaction-lab-shared";

/* ————— 020 选择控件：诊断对照 ————— */

const capacities = ["4 人", "6 人", "8 人", "12 人"];
const cities = ["上海", "北京", "深圳", "杭州", "成都", "广州", "南京", "远程"];
const planOptions = [
  { id: "basic", name: "基础版", desc: "3 个项目 · 5 名成员，适合个人试用" },
  { id: "pro", name: "专业版", desc: "不限项目 · 50 名成员，含高级权限" },
  { id: "team", name: "团队版", desc: "含审计日志与单点登录，按席位计费" },
];

export function ChoiceSection() {
  const [cap, setCap] = useState(1);
  const [city, setCity] = useState("上海");
  const [remind, setRemind] = useState(false);
  const [plan, setPlan] = useState("pro");
  const [extras, setExtras] = useState<string[]>(["导出"]);
  const toggleExtra = (x: string) => setExtras(prev => (prev.includes(x) ? prev.filter(v => v !== x) : [...prev, x]));
  return (
    <Section no="020" title="选择控件">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
          <p className="crease-caption mt-3">2–5 个短选项单选 → 分段控件 · 已选 {capacities[cap]}间</p>
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
          <p className="crease-caption mt-3">≥6 个选项装值 → Select，选中项打勾 · 当前值 {city}</p>
        </div>
        <div className="crease-glass rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="remind-switch" className="text-sm font-medium">会前提醒</label>
            <span className="flex min-h-11 min-w-11 items-center justify-center">
              <Switch id="remind-switch" checked={remind} onCheckedChange={setRemind} />
            </span>
          </div>
          <p className="crease-caption mt-3">立即生效的开/关 → Switch，不配保存按钮。</p>
          {remind && (
            <p className="ilab-row-in mt-4 flex items-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm text-accent-foreground" role="status">
              <Bell className="size-4 shrink-0" />演示通知：会议将在 10 分钟后开始
            </p>
          )}
        </div>
        <div className="crease-glass rounded-2xl p-5">
          <p className="text-sm font-medium" id="plan-label">订阅版本（必须读全选项才能答）</p>
          <div className="mt-3 space-y-1" role="radiogroup" aria-labelledby="plan-label">
            {planOptions.map(o => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={plan === o.id}
                onClick={() => setPlan(o.id)}
                className={`flex min-h-11 w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ${plan === o.id ? "bg-secondary" : ""}`}
              >
                <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${plan === o.id ? "bg-primary" : "shadow-[inset_0_0_0_1.5px_rgb(20_40_70/0.3)]"}`}>
                  {plan === o.id && <span className="size-2 rounded-full bg-white" />}
                </span>
                <span>
                  <span className="block text-sm font-medium">{o.name}</span>
                  <span className="crease-caption mt-0.5 block">{o.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="crease-caption mt-3">每个选项带一行说明 → 单选钮竖排，随表单提交才生效则用复选框语义。</p>
        </div>
        <div className="crease-glass rounded-2xl p-5">
          <p className="text-sm font-medium" id="extras-label">附加能力（可多选）</p>
          <div className="mt-3 space-y-1" role="group" aria-labelledby="extras-label">
            {["导出", "批注", "版本历史"].map(x => (
              <button
                key={x}
                type="button"
                role="checkbox"
                aria-checked={extras.includes(x)}
                onClick={() => toggleExtra(x)}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-secondary/70"
              >
                <span className={`grid size-5 shrink-0 place-items-center rounded-md ${extras.includes(x) ? "bg-primary text-white" : "bg-white shadow-[inset_0_0_0_1.5px_rgb(20_40_70/0.3)]"}`}>
                  {extras.includes(x) && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="text-sm font-medium">{x}</span>
              </button>
            ))}
          </div>
          <p className="crease-caption mt-3">能选几个 → 多选永远竖排复选框 · 已选 {extras.length} 项</p>
        </div>
        <div className="rounded-2xl border border-dashed p-5">
          <p className="text-sm font-medium">诊断顺序</p>
          <ul className="crease-caption mt-2 list-disc space-y-1.5 pl-4 leading-5">
            <li>何时生效：立即 → Switch；随提交 → Checkbox</li>
            <li>装值 → Select；装动作 → 下拉菜单</li>
            <li>选项数：2–5 短选项 → 分段；带说明 → 单选竖排；≥6 → Select</li>
            <li>操作后结果必须立刻可见</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ————— 021 环形卡片：内视 / 外视 + 流动渐变 + 翻面波 ————— */

const ringData = [
  { label: "场域", colors: "#f6f8fa, #dbe4ec, #aebfd0, #eef3f7", dark: false },
  { label: "玻璃", colors: "#dcefff, #a8d4f5, #5aa9e8, #eaf7ff", dark: false },
  { label: "亚克力", colors: "#3a4353, #11161d, #5a6a80, #232b38", dark: true },
  { label: "信号", colors: "#ff8a8e, #d31218, #ff5a3d, #ffc46b", dark: true },
  { label: "刻字", colors: "#fdfdfd, #e3e8ee, #c3cedb, #ffffff", dark: false },
  { label: "流光", colors: "#bfe3ff, #eaf7ff, #7ec3f5, #ffffff", dark: false },
  { label: "刻度", colors: "#f2f4f6, #ccd5dd, #9fb0c0, #eef1f4", dark: false },
  { label: "路径", colors: "#ffd9da, #fff1f1, #ff9d9d, #ffe9c9", dark: false },
  { label: "留白", colors: "#ffffff, #eef1f4, #d5dde5, #ffffff", dark: false },
  { label: "冰蓝", colors: "#cfeeff, #8ecdff, #4a97ec, #eaf7ff", dark: false },
  { label: "深黑", colors: "#232a38, #0c0f14, #46536a, #1a212e", dark: true },
];
const RING_N = ringData.length;
const RING_STEP = 168;
const RING_R = (RING_N * RING_STEP) / (2 * Math.PI);
const wrapArc = (s: number) => {
  const total = RING_N * RING_STEP;
  return ((((s + total / 2) % total) + total) % total) - total / 2;
};

export function RingSection() {
  const reduced = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frontLabelRef = useRef<HTMLSpanElement>(null);
  const anim = useRef({
    offset: 0, bend: 1, bendTarget: 1, flip: 0, flipTarget: 0,
    tween: null as null | { from: number; to: number; start: number; dur: number },
    drag: null as null | { x: number; offset: number; lastX: number; lastT: number; v: number },
    raf: 0, lastFront: 0,
  });
  const [outer, setOuter] = useState(false);
  const [dragging, setDragging] = useState(false);

  const layout = useCallback(() => {
    const a = anim.current;
    const scene = sceneRef.current;
    if (scene) scene.style.perspective = `${lerp(1500, 860, (a.bend + 1) / 2)}px`;
    const outerMix = clamp(-a.bend, 0, 1);
    for (let i = 0; i < RING_N; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const s = wrapArc(i * RING_STEP - a.offset);
      const bend = Math.abs(a.bend) < 0.02 ? 0.02 * Math.sign(a.bend || 1) : a.bend;
      const ang = (s * bend) / RING_R;
      const x = (Math.sin(ang) * RING_R) / bend;
      const depth = Math.abs(((1 - Math.cos(ang)) * RING_R) / bend);
      const rot = ((s / RING_R) * (180 / Math.PI)) * bend;
      const lag = Math.min(Math.abs(s) / (6 * RING_STEP), 1);
      const flipLocal = clamp(a.flip * 1.55 - lag * 0.55, 0, 1);
      const flipDeg = 180 * smooth(flipLocal);
      const back = clamp(depth / (2 * RING_R), 0, 1);
      const blurH = 14 * Math.pow(clamp((Math.abs(x) - 110) / Math.max(1, 340 - 110), 0, 1), 1.4);
      const blurD = 14 * Math.pow(clamp((back - 0.25) / 0.55, 0, 1), 1.2);
      const blur = outerMix * Math.max(blurH, blurD);
      const fade = 1 - outerMix * 0.5 * clamp((back - 0.3) / 0.7, 0, 1);
      el.style.transform = `translate(-50%, -50%) translateX(${x.toFixed(1)}px) translateZ(${(-depth).toFixed(1)}px) rotateY(${(rot + flipDeg).toFixed(2)}deg)`;
      el.style.zIndex = `${Math.round(100 - depth)}`;
      el.style.opacity = `${fade}`;
      el.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "";
      el.style.pointerEvents = Math.abs(s) < RING_STEP / 2 ? "auto" : "none";
    }
    const front = ((Math.round(a.offset / RING_STEP) % RING_N) + RING_N) % RING_N;
    if (front !== a.lastFront) {
      a.lastFront = front;
      if (frontLabelRef.current) frontLabelRef.current.textContent = ringData[front].label;
    }
  }, []);

  useEffect(() => {
    const a = anim.current;
    if (reduced) {
      a.bend = a.bendTarget;
      a.flip = a.flipTarget;
      layout();
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // bend: 1100ms cubic-bezier(0.65, 0, 0.35, 1) approximated by rate-limited approach
      const bendDelta = a.bendTarget - a.bend;
      if (Math.abs(bendDelta) > 0.001) a.bend += bendDelta * Math.min(1, dt * 4.2);
      else a.bend = a.bendTarget;
      const flipDelta = a.flipTarget - a.flip;
      if (Math.abs(flipDelta) > 0.001) a.flip += flipDelta * Math.min(1, dt * (1000 / 1800) * 3.4);
      else a.flip = a.flipTarget;
      if (a.tween) {
        const tw = a.tween;
        const t = clamp((now - tw.start) / tw.dur, 0, 1);
        const e = 1 - Math.pow(1 - t, 3);
        a.offset = lerp(tw.from, tw.to, e);
        if (t >= 1) a.tween = null;
      }
      layout();
      a.raf = requestAnimationFrame(tick);
    };
    a.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(a.raf);
  }, [layout, reduced]);

  const snapTo = (targetOffset: number) => {
    const a = anim.current;
    const dist = targetOffset - a.offset;
    a.tween = { from: a.offset, to: targetOffset, start: performance.now(), dur: clamp(Math.abs(dist) * 1.6, 420, 1100) };
    if (reduced) {
      a.offset = targetOffset;
      a.tween = null;
      layout();
    }
  };
  const snap = (v: number) => Math.round(v / RING_STEP) * RING_STEP;

  const switchView = (toOuter: boolean) => {
    setOuter(toOuter);
    anim.current.bendTarget = toOuter ? -1 : 1;
    anim.current.flipTarget = toOuter ? 1 : 0;
  };

  return (
    <Section no="021" title="环形卡片">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full bg-secondary p-1" role="radiogroup" aria-label="环形视角">
          {(["内视", "外视"] as const).map((name, i) => {
            const isOuter = i === 1;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={outer === isOuter}
                className={`min-h-11 rounded-full px-5 text-sm ${outer === isOuter ? "bg-background font-medium shadow" : "text-muted-foreground"}`}
                onClick={() => switchView(isOuter)}
              >
                {name}
              </button>
            );
          })}
        </div>
        <p className="crease-caption">内视站在环内（透视 860，一屏约 5 张）；外视切过去时曲率连续反转，卡片从中间向外逐张翻面，远侧用模糊与淡出做景深——白底不用阴影。</p>
      </div>
      <div
        ref={sceneRef}
        className="ilab-ring-scene relative h-[340px] touch-none overflow-hidden rounded-2xl border bg-white/50 select-none"
        style={{ perspective: 860 }}
        onPointerDown={e => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          anim.current.drag = { x: e.clientX, offset: anim.current.offset, lastX: e.clientX, lastT: performance.now(), v: 0 };
          anim.current.tween = null;
          setDragging(true);
        }}
        onPointerMove={e => {
          const d = anim.current.drag;
          if (!d) return;
          const now = performance.now();
          const dx = e.clientX - d.lastX;
          if (now > d.lastT) d.v = dx / Math.max(1, now - d.lastT);
          d.lastX = e.clientX;
          d.lastT = now;
          anim.current.offset = d.offset - (e.clientX - d.x) * 1.4;
          if (reduced) layout();
        }}
        onPointerUp={() => {
          const d = anim.current.drag;
          if (d) {
            const glide = -d.v * 260 * 1.4;
            snapTo(snap(anim.current.offset + glide));
          }
          anim.current.drag = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          anim.current.drag = null;
          setDragging(false);
        }}
      >
        {ringData.map((card, i) => (
          <div
            key={card.label}
            ref={el => {
              cardRefs.current[i] = el;
            }}
            className="ilab-ring-card h-[228px] w-[148px]"
            role="button"
            aria-label={`将「${card.label}」带到正前`}
            onClick={() => {
              if (!dragging) snapTo(snap(i * RING_STEP + Math.round((anim.current.offset - i * RING_STEP) / (RING_N * RING_STEP)) * RING_N * RING_STEP));
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[inset_0_0_0_1px_rgb(20_40_70/0.1)]" style={{ backfaceVisibility: "hidden" }}>
              <div className="ilab-ring-flow flex h-full flex-col justify-between p-4" style={{ backgroundImage: `linear-gradient(160deg, ${card.colors})`, animationDelay: `${-i * 1.7}s`, color: card.dark ? "#fff" : undefined }}>
                <span className="text-xs tabular-nums opacity-70">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-base font-medium">{card.label}</span>
              </div>
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[inset_0_0_0_1px_rgb(20_40_70/0.1)]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div className="flex h-full flex-col justify-between p-4" style={{ background: `linear-gradient(200deg, ${card.colors})`, color: card.dark ? "#fff" : undefined }}>
                <span className="text-xs tabular-nums opacity-70">背面 · 图</span>
                <span>
                  <span className="block text-base font-medium">{card.label}</span>
                  <span className="crease-caption mt-1 block" style={card.dark ? { color: "rgb(255 255 255 / 0.75)" } : undefined}>外视翻面后露出</span>
                </span>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
          <Button variant="outline" size="icon" className="min-h-11 min-w-11 rounded-full" aria-label="上一张" onClick={() => snapTo(snap(anim.current.offset - RING_STEP))}>
            <ChevronLeft />
          </Button>
          <span className="crease-caption w-20 text-center" role="status">当前：<span ref={frontLabelRef}>{ringData[0].label}</span></span>
          <Button variant="outline" size="icon" className="min-h-11 min-w-11 rounded-full" aria-label="下一张" onClick={() => snapTo(snap(anim.current.offset + RING_STEP))}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <p className="crease-caption mt-3">拖动 1:1 跟随，松手按速度滑行并吸附最近卡；点一张卡 760ms 量级带到正前。渐变每张错相流动、约 17s 一圈无缝循环。</p>
    </Section>
  );
}

/* ————— 022 空状态：五种 × 四种尺寸 ————— */

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

const memberNames = ["林小满", "周屿", "陈默", "苏青", "高远", "唐棠"];

export function EmptySection() {
  const [query, setQuery] = useState("");
  const [loadState, setLoadState] = useState<"ok" | "loading" | "error">("ok");
  const [tried, setTried] = useState(false);
  const [access, setAccess] = useState<"none" | "sent">("none");
  const matches = memberNames.filter(n => n.includes(query.trim()));
  const retryLoad = () => {
    setLoadState("loading");
    window.setTimeout(() => {
      if (!tried) {
        setTried(true);
        setLoadState("error");
      } else {
        setLoadState("ok");
      }
    }, 650);
  };
  return (
    <Section no="022" title="空状态">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="crease-caption mb-2">页面级 · 首次使用</p>
          <div className="relative h-72 rounded-2xl border bg-white/50">
            <div className="ilab-empty-in absolute top-[40%] left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center px-6 text-center">
              <WireframeArt />
              <h3 className="mt-3 text-base font-medium">还没有任务</h3>
              <p className="crease-caption mt-1">创建第一个任务，开始安排本周的工作。</p>
              <div className="mt-4 flex gap-2">
                <Button className="min-h-11">创建任务</Button>
                <Button variant="ghost" className="min-h-11">导入</Button>
              </div>
            </div>
          </div>
          <p className="crease-caption mt-4 mb-2">无结果 · 保留搜索词与修法</p>
          <div className="rounded-2xl border bg-white/60 p-4">
            <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜索成员，如「林」"
                aria-label="搜索成员"
                className="min-h-11 flex-1 bg-transparent text-sm outline-none"
              />
              {query && (
                <button type="button" className="min-h-11 text-sm text-muted-foreground" onClick={() => setQuery("")}>清除</button>
              )}
            </div>
            {matches.length > 0 ? (
              <ul className="mt-2 divide-y">
                {matches.map(n => (
                  <li key={n} className="flex min-h-11 items-center text-sm font-medium">{n}</li>
                ))}
              </ul>
            ) : (
              <div className="ilab-empty-in py-5 text-center" role="status">
                <p className="text-sm font-medium">没有成员匹配「{query}」</p>
                <p className="crease-caption mt-1">检查拼写，或清除搜索看全部成员。</p>
                <Button variant="outline" size="sm" className="mt-3 min-h-11" onClick={() => setQuery("")}>清除搜索</Button>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <p className="crease-caption mb-2">卡片级 · 首次使用（mini）</p>
            <div className="crease-glass flex items-center gap-3 rounded-2xl p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-secondary">
                <Inbox className="size-[22px] text-muted-foreground" />
              </span>
              <p className="flex-1 text-sm font-medium">还没有成员加入</p>
              <Button variant="ghost" size="sm" className="min-h-11">邀请</Button>
            </div>
          </div>
          <div>
            <p className="crease-caption mb-2">加载失败 · 只倒在失败的那一块</p>
            <div className="rounded-2xl border bg-white/60 p-4">
              {loadState === "loading" ? (
                <div className="space-y-2" aria-busy="true">
                  <Skeleton className="h-5 w-2/5 rounded-md" />
                  <Skeleton className="h-5 w-4/5 rounded-md" />
                  <Skeleton className="h-5 w-3/5 rounded-md" />
                </div>
              ) : loadState === "error" ? (
                <div className="ilab-empty-in flex items-start gap-3" role="alert">
                  <AlertTriangle className="mt-0.5 size-6 shrink-0 text-[#7a869d]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">动态没有加载出来</p>
                    <p className="crease-caption mt-1">连接中断了。已加载的内容都在，什么都没丢。</p>
                  </div>
                  <Button variant="outline" size="sm" className="min-h-11 shrink-0" onClick={retryLoad}>
                    <RotateCcw />重试
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">动态已加载 · 共 24 条</p>
                  <Button variant="ghost" size="sm" className="min-h-11" onClick={retryLoad}>重新加载</Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="crease-caption mb-2">无权限 · 说清归谁、怎么进</p>
            <div className="flex items-start gap-3 rounded-2xl border bg-white/60 p-4">
              <Lock className="mt-0.5 size-6 shrink-0 text-[#7a869d]" />
              <div className="flex-1">
                <p className="text-sm font-medium">财务报表需要权限</p>
                <p className="crease-caption mt-1">{access === "sent" ? "申请已发出，管理员通过后会通知你。" : "由财务组管理。申请通过后即可查看。"}</p>
              </div>
              {access === "none" ? (
                <Button size="sm" className="min-h-11 shrink-0" onClick={() => setAccess("sent")}>申请权限</Button>
              ) : (
                <span className="flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-600" role="status">
                  <Check className="size-4" />已申请
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="crease-caption mb-2">菜单级 · 一行灰字</p>
              <div className="w-full rounded-xl border bg-white p-1.5 shadow-lg">
                <p className="flex min-h-11 items-center rounded-lg px-2 text-sm font-medium hover:bg-secondary">编辑</p>
                <p className="flex min-h-11 items-center rounded-lg px-2 text-sm font-medium hover:bg-secondary">复制</p>
                <div className="my-1 border-t" />
                <p className="flex min-h-11 items-center px-2 text-sm text-muted-foreground">没有更多结果</p>
              </div>
            </div>
            <div>
              <p className="crease-caption mb-2">全部处理完 · 无按钮、不用主题色</p>
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

