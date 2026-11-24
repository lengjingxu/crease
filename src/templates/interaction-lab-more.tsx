import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Bell, Check, ChevronDown, CreditCard, Download, FileText, RotateCcw, Send, Trash2, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/kit/toast";
import bridge from "@/assets/bridge.svg";
import { Section, clamp, lerp, smooth, useReducedMotion } from "./interaction-lab-shared";

/* ————— 012 消息气泡：材质切换 + 输入指示 + 逐词到达 ————— */

type Bubble = { id: number; from: "me" | "ai"; text: string; fresh?: boolean };
const bubbleInitial: Bubble[] = [
  { id: 1, from: "ai", text: "新版首页的视觉走查安排在周四下午。" },
  { id: 2, from: "ai", text: "记得带上深色模式的截图。" },
  { id: 3, from: "me", text: "好，我把问题清单一起整理过去。" },
  { id: 4, from: "ai", text: "收到，走查结论会同步到项目页。" },
];
type BubbleMaterial = "solid" | "cirrus" | "gradient" | "aqua";
const bubbleMaterials: { id: BubbleMaterial; name: string }[] = [
  { id: "solid", name: "Solid 纯色" },
  { id: "cirrus", name: "Cirrus 磨砂" },
  { id: "gradient", name: "Gradient 切片" },
  { id: "aqua", name: "Aqua 果冻" },
];

function bubbleRadius(b: Bubble, prev?: Bubble, next?: Bubble) {
  const prevSame = prev?.from === b.from;
  const nextSame = next?.from === b.from;
  if (b.from === "me") return `20px ${prevSame ? 10 : 20}px ${nextSame ? 10 : 20}px 20px`;
  return `${prevSame ? 10 : 20}px 20px 20px ${nextSame ? 10 : 20}px`;
}

function bubbleStyle(material: BubbleMaterial, from: "me" | "ai", index: number, total: number): React.CSSProperties {
  switch (material) {
    case "cirrus":
      return {
        background: from === "me" ? "rgb(46 128 232 / 0.34)" : "rgb(104 134 168 / 0.34)",
        color: "#fff",
        textShadow: "0 1px 2px rgb(10 30 60 / 0.25)",
      };
    case "gradient": {
      const t = total > 1 ? index / (total - 1) : 0;
      return from === "me"
        ? { background: `linear-gradient(180deg, ${`hsl(${352 - t * 18} 84% ${46 + t * 8}%)`}, ${`hsl(${330 - t * 14} 72% ${40 + t * 8}%)`})`, color: "#fff" }
        : { background: "rgb(233 233 235)", color: "#10151b" };
    }
    case "aqua":
      return from === "me"
        ? {
            background: "linear-gradient(180deg, #8ec9ff 0%, #5aa9f5 45%, #2f7fe0 55%, #4a97ec 100%)",
            color: "#fff",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.65), inset 0 -8px 14px rgb(255 255 255 / 0.18), 0 2px 6px rgb(30 90 180 / 0.3)",
            textShadow: "0 -1px 0 rgb(0 40 90 / 0.3)",
          }
        : {
            background: "linear-gradient(180deg, #ffffff 0%, #eef2f6 45%, #dbe4ec 55%, #e8eef4 100%)",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.9), inset 0 -8px 14px rgb(255 255 255 / 0.5), 0 2px 6px rgb(20 40 70 / 0.14)",
          };
    default:
      return from === "me"
        ? { background: "rgb(10 132 255)", color: "#fff" }
        : { background: "rgb(233 233 235)", color: "#10151b" };
  }
}

export function BubblesSection() {
  const reduced = useReducedMotion();
  const [material, setMaterial] = useState<BubbleMaterial>("solid");
  const [messages, setMessages] = useState(bubbleInitial);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const seq = useRef(5);
  const els = useRef(new Map<number, HTMLDivElement>());
  const entered = useRef(new Set<number>());
  const pendingFlip = useRef<{ tops: Map<number, number>; deletedIndex: number } | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);

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
    setTyping(true);
    timers.current.push(
      window.setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, { id: seq.current++, from: "ai", text: "好的，我记下了，稍后同步到项目页。", fresh: true }]);
      }, reduced ? 200 : 1400),
    );
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
        <div className="mb-4 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="气泡材质">
          {bubbleMaterials.map(m => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={material === m.id}
              onClick={() => setMaterial(m.id)}
              className={`min-h-11 rounded-full px-4 text-sm ${material === m.id ? "bg-secondary font-medium" : "text-muted-foreground"}`}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div
          className={`flex flex-col rounded-2xl p-4 transition-colors duration-300 ${material === "cirrus" ? "" : "bg-white/40"}`}
          style={material === "cirrus" ? { background: "linear-gradient(160deg, #a8c8e8, #5b84ad 55%, #33506e)" } : undefined}
          role="log"
          aria-label="演示对话"
        >
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
                  className={`px-4 py-2.5 text-sm leading-6 ${material === "cirrus" ? "ilab-bubble-cirrus" : ""}`}
                  style={{ borderRadius: bubbleRadius(m, prev, next), ...bubbleStyle(material, m.from, i, messages.length) }}
                >
                  {m.fresh && !reduced
                    ? m.text.split("").map((ch, ci) => (
                        <span key={ci} className="ilab-word-in" style={{ animationDelay: `${160 + ci * 26}ms` }}>{ch === " " ? " " : ch}</span>
                      ))
                    : m.text}
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
          {typing && (
            <div className="mt-4 flex items-center gap-1.5 self-start rounded-full bg-white/70 px-3.5 py-2.5 text-[#263140]" role="status" aria-label="对方正在输入">
              {[0, 1, 2, 3, 4].map(i => (
                <span key={i} className="ilab-typing-dot" style={{ animationDelay: `${i * 110}ms` }} />
              ))}
            </div>
          )}
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
            placeholder="写一句话发送，看回复的点阵等待与逐字到达"
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

/* ————— 013 冲击波光晕 + 可展开输入框 ————— */

export function ShockSection() {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const fringeRRef = useRef<HTMLDivElement>(null);
  const fringeBRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const [burst, setBurst] = useState(0);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [pillOpen, setPillOpen] = useState(false);

  useEffect(() => () => window.cancelAnimationFrame(rafId.current), []);

  const fire = (originEl: HTMLElement) => {
    const panel = panelRef.current;
    const ring = ringRef.current;
    if (!panel || !ring) return;
    const p = panel.getBoundingClientRect();
    const b = originEl.getBoundingClientRect();
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
      const radius = 40 + (760 * (1 - Math.pow(2, -9 * t))) / (1 - Math.pow(2, -9));
      const strength = Math.min(1, t / 0.03) * (1 - Math.pow(t, 2.2));
      const size = `${radius * 2}px`;
      for (const [el, scale] of [[ring, 1], [fringeRRef.current, 1.03], [fringeBRef.current, 0.97]] as const) {
        if (!el) continue;
        el.style.width = size;
        el.style.height = size;
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }
      ring.style.opacity = `${clamp(strength, 0, 1)}`;
      if (fringeRRef.current) fringeRRef.current.style.opacity = `${clamp(strength, 0, 1) * 0.5}`;
      if (fringeBRef.current) fringeBRef.current.style.opacity = `${clamp(strength, 0, 1) * 0.5}`;
      if (t < 1) rafId.current = window.requestAnimationFrame(tick);
      else ring.style.opacity = "0";
    };
    rafId.current = window.requestAnimationFrame(tick);
  };

  const togglePill = (e: React.MouseEvent<HTMLButtonElement>) => {
    const opening = !pillOpen;
    setPillOpen(opening);
    if (opening) {
      fire(e.currentTarget);
      // metal edge light sweeps -60deg -> 300deg over 900ms
      const edge = edgeRef.current;
      if (edge && !reduced) {
        const start = performance.now();
        const sweep = (now: number) => {
          const t = clamp((now - start) / 900, 0, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          edge.style.setProperty("--ilab-edge-angle", `${-60 + 360 * eased}deg`);
          edge.style.opacity = `${Math.sin(Math.PI * t) * 0.75}`;
          if (t < 1) requestAnimationFrame(sweep);
          else edge.style.opacity = "0";
        };
        requestAnimationFrame(sweep);
      }
    }
  };

  const band = (stops: string) => `radial-gradient(closest-side, transparent 52%, ${stops}, transparent 100%)`;

  return (
    <Section no="013" title="冲击波光晕">
      <div ref={panelRef} className="crease-canvas relative flex h-80 flex-col overflow-hidden rounded-2xl border p-6">
        <div className="grid max-w-lg gap-3" aria-hidden>
          <div className="rounded-xl bg-white/80 p-4 shadow-[inset_0_0_0_1px_rgb(20_40_70/0.08)]">
            <div className="h-2 w-2/5 rounded bg-[#263140]/25" />
            <div className="mt-2.5 h-2 w-4/5 rounded bg-[#263140]/12" />
          </div>
          <div className="rounded-xl bg-white/80 p-4 shadow-[inset_0_0_0_1px_rgb(20_40_70/0.08)]">
            <div className="h-2 w-1/3 rounded bg-[#263140]/25" />
            <div className="mt-2.5 h-2 w-3/5 rounded bg-[#263140]/12" />
          </div>
        </div>
        <div key={burst} aria-hidden>
          <div
            ref={fringeRRef}
            className="ilab-shock-ring"
            style={{ left: center.x, top: center.y, width: 80, height: 80, opacity: 0, background: band("rgb(255 90 90 / 0.35) 74%, rgb(255 90 90 / 0.12) 88%") }}
          />
          <div
            ref={fringeBRef}
            className="ilab-shock-ring"
            style={{ left: center.x, top: center.y, width: 80, height: 80, opacity: 0, background: band("rgb(90 140 255 / 0.35) 74%, rgb(90 140 255 / 0.12) 88%") }}
          />
          <div
            ref={ringRef}
            className="ilab-shock-ring"
            style={{
              left: center.x, top: center.y, width: 80, height: 80, opacity: 0,
              background: band("rgb(80 140 255 / 0.5) 62%, rgb(160 110 255 / 0.48) 72%, rgb(255 110 180 / 0.44) 82%, rgb(255 190 140 / 0.34) 91%"),
            }}
          />
        </div>
        <div className="mt-auto flex justify-center">
          <div
            className="relative overflow-hidden bg-white shadow-[0_0_0_1px_rgb(15_23_42/0.09),0_2px_4px_rgb(15_23_42/0.04),0_28px_64px_-16px_rgb(15_23_42/0.22)] transition-all duration-[580ms]"
            style={{
              width: pillOpen ? "min(460px, 92%)" : 300,
              height: pillOpen ? 132 : 44,
              borderRadius: pillOpen ? 16 : 22,
              transitionTimingFunction: "cubic-bezier(0.22, 1.3, 0.36, 1)",
            }}
          >
            <div ref={edgeRef} className="ilab-pill-edge" style={{ opacity: 0 }} aria-hidden />
            <button
              type="button"
              className="flex h-11 w-full items-center gap-2 px-4 text-left text-sm text-muted-foreground"
              aria-expanded={pillOpen}
              onClick={togglePill}
            >
              <Zap className="size-4 shrink-0 text-primary" />
              {pillOpen ? "输入框已展开 · 点此收起" : "点此展开输入框，光晕同时扫过页面"}
            </button>
            <div
              className="px-4 transition-opacity duration-300"
              style={{ opacity: pillOpen ? 1 : 0, transitionDelay: pillOpen ? "180ms" : "0ms" }}
              aria-hidden={!pillOpen}
            >
              <p className="text-sm leading-6 text-muted-foreground">内容按最终尺寸排版，展开到 30% 起由裁剪揭示。光晕是四色环 + 红蓝错位的痕量色散，1000ms 内扫过后完全消失。</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ————— 014 卡片的四种消失：燃 / 烟羽 / 碎块 / 剥离 ————— */

type DeleteMode = "burn" | "plume" | "blocks" | "peel";
const deleteCards: { id: string; mode: DeleteMode; title: string; meta: string }[] = [
  { id: "burn", mode: "burn", title: "燃烧", meta: "炭化前锋从点击处扩散 · 2s" },
  { id: "plume", mode: "plume", title: "烟羽", meta: "暖化后瓣片上浮散开 · 1.4s" },
  { id: "blocks", mode: "blocks", title: "碎块", meta: "先闪白命中帧，再分块坠落 · 1.5s" },
  { id: "peel", mode: "peel", title: "剥离", meta: "掀起、脱离、飞走 · 1.2s" },
];

function DeleteCard({ mode, title, meta }: { mode: DeleteMode; title: string; meta: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const peelRef = useRef<HTMLDivElement>(null);
  const peelShadowRef = useRef<HTMLDivElement>(null);
  const burnRef = useRef<HTMLDivElement>(null);
  const emberRef = useRef<HTMLDivElement>(null);
  const plumeFxRef = useRef<HTMLDivElement>(null);
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

  const run = (e: React.MouseEvent) => {
    if (phase !== "idle") return;
    setPhase("anim");
    if (mode === "burn") {
      const burn = burnRef.current;
      if (burn) {
        const rect = burn.parentElement!.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        burn.style.background = `radial-gradient(circle at ${cx}px ${cy}px, rgb(13 9 8) 34%, rgb(43 31 26) 52%, rgb(107 51 18) 63%, rgb(247 194 102) 71%, rgb(255 250 214) 76%, transparent 82%)`;
        burn.animate(
          [{ clipPath: `circle(0px at ${cx}px ${cy}px)`, opacity: 1 }, { clipPath: `circle(${Math.hypot(rect.width, rect.height)}px at ${cx}px ${cy}px)`, opacity: 1 }],
          { duration: 1150, easing: "cubic-bezier(0.42, 0, 0.58, 1)", fill: "forwards" },
        );
        burn.animate([{ opacity: 1 }, { opacity: 1, offset: 0.82 }, { opacity: 0 }], { duration: 2000, fill: "forwards" });
      }
      const ember = emberRef.current;
      if (ember) {
        [...ember.children].forEach((dot, i) => {
          (dot as HTMLElement).animate(
            [
              { transform: "translate(0, 0)", opacity: 0 },
              { transform: `translate(${(i % 5 - 2) * 14}px, ${-30 - (i % 4) * 12}px)`, opacity: 1, offset: 0.25 },
              { transform: `translate(${(i % 5 - 2) * 26}px, ${-90 - (i % 3) * 30}px)`, opacity: 0 },
            ],
            { duration: 900 + i * 60, delay: 250 + i * 70, easing: "ease-out", fill: "forwards" },
          );
        });
      }
      collapse(900, 2000);
    } else if (mode === "blocks") {
      collapse(950, 1500);
    } else if (mode === "peel") {
      peelRef.current?.animate(
        [
          { transform: "rotateX(0deg) translateY(0px)", opacity: 1 },
          { transform: "rotateX(-96deg) translateY(10px)", opacity: 1, offset: 0.55 },
          { transform: "rotateX(-122deg) translate(46px, -30px) rotate(7deg)", opacity: 0 },
        ],
        { duration: 1200, easing: "cubic-bezier(0.42, 0, 1, 1)", fill: "forwards" },
      );
      peelShadowRef.current?.animate(
        [{ transform: "scaleX(0.6)", opacity: 0 }, { transform: "scaleX(1)", opacity: 0.4, offset: 0.5 }, { transform: "scaleX(1.15)", opacity: 0 }],
        { duration: 1200, easing: "ease-out", fill: "forwards" },
      );
      collapse(640, 1250);
    } else {
      const fx = plumeFxRef.current;
      if (fx) {
        [...fx.children].forEach((piece, i) => {
          const el = piece as HTMLElement;
          const isPetal = i < 6;
          el.animate(
            [
              { transform: "translate(0, 10px) rotate(0deg) scale(1)", opacity: 0 },
              { transform: `translate(${(i % 3 - 1) * 16}px, ${isPetal ? -34 : -52}px) rotate(${(i % 3 - 1) * 14}deg) scale(0.92)`, opacity: isPetal ? 0.95 : 0.8, offset: 0.35 },
              { transform: `translate(${(i % 3 - 1) * 44}px, ${isPetal ? -110 : -140}px) rotate(${(i % 3 - 1) * 30}deg) scale(0.3)`, opacity: 0 },
            ],
            { duration: isPetal ? 800 : 700, delay: 250 + i * (isPetal ? 130 : 55), easing: "ease-out", fill: "forwards" },
          );
        });
      }
      collapse(720, 1400);
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
          <span className="crease-caption" role="status">已移除（数据已提交，特效只是离开的画面）</span>
        </div>
      ) : (
        <div className="relative h-40">
          {mode === "peel" ? (
            <div className="ilab-peel-wrap h-full">
              <div className="absolute inset-x-8 bottom-1 h-5 rounded-[50%] bg-black/50 blur-md" ref={peelShadowRef} style={{ opacity: 0 }} aria-hidden />
              <div className="absolute inset-0 grid place-items-center" aria-hidden>
                <div className="grid grid-cols-6 gap-3 opacity-0" style={{ opacity: phase === "anim" ? 0.5 : 0, transition: "opacity 300ms 500ms" }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className="size-1 rounded-full bg-white shadow-[0_0_0_1px_rgb(20_40_70/0.15)]" />
                  ))}
                </div>
              </div>
              <div ref={peelRef} className="ilab-peel h-full" style={{ transformOrigin: "bottom center", transformStyle: "preserve-3d", position: "relative" }}>
                <div className="ilab-peel-face crease-glass rounded-2xl p-5" style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>{cardBody}</div>
                <div className="rounded-2xl bg-gradient-to-b from-white to-[#e6ecf1] p-5 shadow-[inset_0_0_0_6px_#fff,inset_0_0_0_7px_rgb(20_40_70/0.12)]" style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}>
                  <p className="crease-caption">背面 · 6px 模切白边</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="crease-glass relative h-full overflow-hidden rounded-2xl p-5">
              {cardBody}
              {mode === "burn" && (
                <>
                  <div ref={burnRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }} aria-hidden />
                  <div ref={emberRef} className="pointer-events-none absolute inset-0" aria-hidden>
                    {Array.from({ length: 10 }, (_, i) => (
                      <span key={i} className="absolute rounded-full" style={{ left: `${18 + (i * 7) % 60}%`, top: `${58 + (i % 3) * 10}%`, width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3, background: i % 2 ? "#ffcc42" : "#ff7013", opacity: 0 }} />
                    ))}
                  </div>
                </>
              )}
              {mode === "plume" && (
                <>
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgb(255 212 173 / 0.85), rgb(255 233 201 / 0.35) 55%, transparent 80%)",
                      opacity: phase === "anim" ? undefined : 0,
                      transform: phase === "anim" ? "translateY(-14%)" : undefined,
                      transition: "opacity 500ms, transform 900ms",
                    }}
                    aria-hidden
                  />
                  <div ref={plumeFxRef} className="pointer-events-none absolute inset-0" aria-hidden>
                    {Array.from({ length: 6 }, (_, i) => (
                      <span key={`p${i}`} className="absolute bottom-3 rounded-[50%]" style={{ left: `${34 + i * 6}%`, width: 26 - i * 3, height: 15 - i * 1.5, background: i % 2 ? "rgb(255 168 87 / 0.85)" : "rgb(250 153 168 / 0.85)", opacity: 0 }} />
                    ))}
                    {Array.from({ length: 10 }, (_, i) => (
                      <span key={`d${i}`} className="absolute bottom-4 rounded-full" style={{ left: `${16 + (i * 8) % 68}%`, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, background: "rgb(255 237 189 / 0.9)", opacity: 0 }} />
                    ))}
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      opacity: phase === "anim" ? 0 : 1,
                      transform: phase === "anim" ? "translateY(-26px) scale(1.02)" : undefined,
                      transition: "opacity 900ms 300ms, transform 1160ms",
                      pointerEvents: "none",
                    }}
                    aria-hidden
                  />
                </>
              )}
              {mode === "blocks" && phase === "anim" && (
                <>
                  <div className="pointer-events-none absolute inset-0 z-10 bg-white" style={{ animation: "ilab-hitflash 70ms ease-out both" }} aria-hidden />
                  <style>{`@keyframes ilab-hitflash { 0% { opacity: 0; } 40% { opacity: 0.55; } 100% { opacity: 0; } }`}</style>
                  <div className="absolute inset-0 z-20" aria-hidden>
                    {Array.from({ length: 12 }, (_, i) => {
                      const col = i % 4;
                      const row = Math.floor(i / 4);
                      const dx = (col - 1.5) * 56 + (i % 2 ? 14 : -10);
                      const rot = (i % 3 - 1) * 26;
                      return (
                        <div
                          key={i}
                          className="ilab-block-slice"
                          style={{ left: `${col * 25}%`, top: `${row * 33.333}%`, width: "25%", height: "33.333%" }}
                          ref={el => {
                            el?.animate(
                              [
                                { transform: "translate(0px, 0px) rotate(0deg)", opacity: 1 },
                                { transform: `translate(${dx}px, 66px) rotate(${rot}deg)`, opacity: 1, offset: 0.55 },
                                { transform: `translate(${dx * 1.15}px, 52px) rotate(${rot * 1.2}deg)`, opacity: 0.9, offset: 0.72 },
                                { transform: `translate(${dx * 1.3}px, 130px) rotate(${rot * 1.5}deg) scale(0.2)`, opacity: 0 },
                              ],
                              { duration: 1150, delay: 70 + (i % 4) * 24, easing: "cubic-bezier(0.5, 0, 0.9, 0.6)", fill: "forwards" },
                            );
                          }}
                        >
                          <div className="ilab-block-inner crease-glass p-5" style={{ width: "400%", height: "300%", left: `${-col * 100}%`, top: `${-row * 100}%`, boxShadow: "inset 0 0 0 1px rgb(20 40 70 / 0.2)" }}>
                            {cardBody}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 z-30 min-h-11 min-w-11"
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

export function DeleteSection() {
  const [resetKey, setResetKey] = useState(0);
  return (
    <Section no="014" title="卡片的四种消失">
      <div className="mb-4 flex items-center justify-between">
        <p className="crease-caption">一个产品只选一种消失方式；补位在特效播完前就开始。</p>
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

/* ————— 015 界面连续性：卡片生长 + 拉伸指示器 ————— */

export function ContinuitySection() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const tabBtns = useRef<(HTMLButtonElement | null)[]>([]);
  const indRef = useRef<HTMLSpanElement>(null);
  const indState = useRef({ left: 0, width: 0 });

  const moveIndicator = useCallback((i: number, animate: boolean) => {
    const btn = tabBtns.current[i];
    const ind = indRef.current;
    if (!btn || !ind) return;
    const target = { left: btn.offsetLeft, width: btn.offsetWidth };
    if (!animate || indState.current.width === 0) {
      ind.style.transform = `translateX(${target.left}px)`;
      ind.style.width = `${target.width}px`;
    } else {
      const from = indState.current;
      const stretch = target.left > from.left
        ? { left: from.left, width: target.left + target.width - from.left }
        : { left: target.left, width: from.left + from.width - target.left };
      ind.animate(
        [
          { transform: `translateX(${from.left}px)`, width: `${from.width}px` },
          { transform: `translateX(${stretch.left}px)`, width: `${stretch.width}px`, offset: 0.45 },
          { transform: `translateX(${target.left}px) scaleY(0.85)`, width: `${target.width}px`, offset: 0.82 },
          { transform: `translateX(${target.left}px) scaleY(1)`, width: `${target.width}px` },
        ],
        { duration: 430, easing: "cubic-bezier(0.32, 0.72, 0, 1)", fill: "forwards" },
      );
      ind.style.transform = `translateX(${target.left}px)`;
      ind.style.width = `${target.width}px`;
    }
    indState.current = target;
  }, []);

  useLayoutEffect(() => {
    moveIndicator(0, false);
  }, [moveIndicator]);

  const tabs = ["概览", "数据", "成员动态"];
  return (
    <Section no="015" title="界面连续性">
      <div className="relative overflow-hidden rounded-2xl border bg-white/50 p-5 sm:p-8">
        <div className="mb-6 max-w-sm">
          <div className="relative flex rounded-full bg-secondary p-1" role="tablist" aria-label="连续性标签演示">
            <span ref={indRef} className="ilab-tab-ind absolute top-1 bottom-1 left-0 rounded-full bg-background shadow" aria-hidden />
            {tabs.map((t, i) => (
              <button
                key={t}
                ref={el => {
                  tabBtns.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={tab === i}
                className={`relative z-10 min-h-11 flex-1 rounded-full text-sm ${tab === i ? "font-medium" : "text-muted-foreground"}`}
                onClick={() => {
                  setTab(i);
                  moveIndicator(i, true);
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="crease-caption mt-2">指示器前缘先走、后缘跟上，移动中拉伸，落定时压扁约 15%。</p>
        </div>
        <div
          className="pointer-events-none grid grid-cols-3 gap-4"
          style={{
            transform: open ? "scale(0.94)" : "scale(1)",
            opacity: open ? 0.7 : 1,
            transition: "transform 450ms var(--ease-continuity), opacity 450ms var(--ease-continuity)",
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
              <p className="crease-caption mt-0.5">同一张卡片，长成详情；背后页面缩到 0.94 并压暗</p>
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

/* ————— 016 Toast 与通知：含进度型 ————— */

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

function ProgressToastDemo() {
  const [run, setRunState] = useState<{ pct: number; done: boolean; visible: boolean } | null>(null);
  const raf = useRef(0);
  const startExport = () => {
    window.cancelAnimationFrame(raf.current);
    const start = performance.now();
    const total = 2400;
    const tick = (now: number) => {
      const t = clamp((now - start) / total, 0, 1);
      const pct = Math.round((1 - Math.pow(1 - t, 2)) * 100);
      if (t < 1) {
        setRunState({ pct, done: false, visible: true });
        raf.current = requestAnimationFrame(tick);
      } else {
        setRunState({ pct: 100, done: true, visible: true });
        window.setTimeout(() => setRunState(s => (s ? { ...s, visible: false } : s)), 3000);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => window.cancelAnimationFrame(raf.current), []);
  return (
    <div className="relative mt-5 h-44 overflow-hidden rounded-2xl border bg-white/50">
      <div className="absolute bottom-4 left-4">
        <Button variant="outline" className="min-h-11" onClick={startExport}>
          <Download />进度型：导出 1,240 行
        </Button>
      </div>
      {run?.visible && (
        <article className="crease-glass ilab-row-in absolute top-3 right-3 w-[min(344px,calc(100%-1.5rem))] rounded-3xl p-3.5 shadow-xl" role="status">
          <div className="flex items-center gap-3">
            <span className={`grid size-8 shrink-0 place-items-center rounded-[10px] ${run.done ? "bg-emerald-500 text-white" : "bg-accent text-accent-foreground"}`}>
              {run.done ? <Check className="size-[18px]" strokeWidth={3} /> : <FileText className="size-[18px]" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{run.done ? "导出完成" : "正在导出季度报告"}</p>
              <p className="crease-caption mt-0.5 tabular-nums">
                {run.done ? "季度报告.pdf · 已就绪" : `${Math.round(run.pct * 12.4)} of 1,240 rows · About ${Math.max(1, Math.ceil((100 - run.pct) / 42))}s left`}
              </p>
            </div>
          </div>
          {!run.done && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-primary/10">
              <div className="h-full rounded-full bg-primary transition-[width] duration-100" style={{ width: `${run.pct}%` }} />
            </div>
          )}
        </article>
      )}
      <p className="crease-caption absolute bottom-4 left-1/2 hidden -translate-x-1/4 sm:block">进度型在原地变成结果，不再弹第二个。</p>
    </div>
  );
}

export function ToastSection() {
  return (
    <Section no="016" title="Toast 与通知">
      <ToastProvider>
        <ToastButtons />
        <ProgressToastDemo />
      </ToastProvider>
    </Section>
  );
}

/* ————— 017 加载状态：骨架 / 按钮转轮 / 乐观更新 ————— */

const loadRows = [
  { name: "品牌站改版", value: "68%" },
  { name: "移动端适配", value: "42%" },
  { name: "设计走查", value: "85%" },
  { name: "交付评审", value: "12%" },
];

export function LoadingSection() {
  const [phase, setPhase] = useState<"idle" | "wait" | "skeleton" | "done">("idle");
  const [status, setStatus] = useState("当前显示上次的数据。");
  const timers = useRef<number[]>([]);
  const loading = phase === "wait" || phase === "skeleton";

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [optChecked, setOptChecked] = useState(false);
  const [optState, setOptState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [failNext, setFailNext] = useState(false);
  const [shake, setShake] = useState(0);

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

  const runSync = () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMsg("");
    // icon itself spins from the press; at least one full revolution (640ms)
    window.setTimeout(() => {
      setSyncing(false);
      setSyncMsg("同步完成 · 刚刚");
    }, 1100);
  };

  const toggleOpt = () => {
    if (optState === "saving") return;
    const next = !optChecked;
    setOptChecked(next);
    setOptState("saving");
    window.setTimeout(() => {
      if (failNext) {
        setFailNext(false);
        setOptChecked(!next);
        setOptState("error");
        setShake(k => k + 1);
      } else {
        setOptState("saved");
        window.setTimeout(() => setOptState(s => (s === "saved" ? "idle" : s)), 1600);
      }
    }, 700);
  };

  return (
    <Section no="017" title="加载状态">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
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
          <p className="crease-caption mt-3">等待不足 300ms 不出骨架；骨架一旦出现至少留 500ms；亮带全列表同步一条；内容逐行淡入间隔 40ms。</p>
        </div>
        <div className="space-y-5">
          <div className="crease-glass rounded-2xl p-5">
            <p className="text-sm font-medium">按钮内转轮</p>
            <p className="crease-caption mt-1">图标本身就是同步含义：从按下起转、至少转满一整圈，标签与宽度不变。</p>
            <div className="mt-4 flex items-center gap-4">
              <Button variant="outline" className="min-h-11" onClick={runSync} disabled={syncing} aria-busy={syncing}>
                <RotateCcw className={syncing ? "animate-spin" : undefined} style={syncing ? { animationDuration: "640ms", animationTimingFunction: "cubic-bezier(0.3, 0.7, 0.4, 1)" } : undefined} />
                同步数据
              </Button>
              <span className="crease-caption" role="status">{syncMsg}</span>
            </div>
          </div>
          <div className="crease-glass rounded-2xl p-5">
            <p className="text-sm font-medium">乐观更新</p>
            <p className="crease-caption mt-1">结果立即生效，保存状态只在条目固定位置安静显示；失败回滚全部变化并给 Retry。</p>
            <div key={shake} className={`mt-4 flex min-h-12 items-center gap-3 rounded-xl bg-secondary/60 px-3 ${shake ? "ilab-shake" : ""}`}>
              <button
                type="button"
                role="checkbox"
                aria-checked={optChecked}
                aria-label="完成走查清单"
                onClick={toggleOpt}
                className={`grid size-6 shrink-0 place-items-center rounded-md transition-colors ${optChecked ? "bg-emerald-500 text-white" : "bg-white shadow-[inset_0_0_0_1.5px_rgb(20_40_70/0.3)]"}`}
              >
                {optChecked && <Check className="size-4" strokeWidth={3} />}
              </button>
              <span className={`flex-1 text-sm font-medium ${optChecked ? "text-muted-foreground line-through" : ""}`}>完成走查清单</span>
              <span className="flex w-28 items-center justify-end gap-1.5 text-xs" role="status">
                {optState === "saving" && <><RotateCcw className="size-3.5 animate-spin" />Saving…</>}
                {optState === "saved" && <span className="flex items-center gap-1 text-emerald-600"><Check className="size-3.5" />Saved</span>}
                {optState === "error" && (
                  <>
                    <span className="text-primary">网络中断，未保存</span>
                    <button type="button" className="font-medium text-primary underline underline-offset-2" onClick={toggleOpt}>Retry</button>
                  </>
                )}
              </span>
            </div>
            <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={failNext} onChange={e => setFailNext(e.target.checked)} className="size-4" style={{ accentColor: "var(--primary)" }} />
              下一次保存模拟失败
            </label>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ————— 018 全息卡片：箔面 + 倾斜 + 翻面 ————— */

type HoloFinish = "prism" | "rainbow" | "pearl" | "sparkle";
const holoFinishes: { id: HoloFinish; name: string; edge: string }[] = [
  { id: "prism", name: "Prism 棱镜", edge: "#1a2a8a" },
  { id: "rainbow", name: "Rainbow 彩虹", edge: "#2a2c35" },
  { id: "pearl", name: "Pearl 珍珠", edge: "#c9b8c4" },
  { id: "sparkle", name: "Sparkle 闪粉", edge: "#2c3550" },
];

export function HoloSection() {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const glareFrontRef = useRef<HTMLDivElement>(null);
  const glareBackRef = useRef<HTMLDivElement>(null);
  const foilRef = useRef<HTMLDivElement>(null);
  const ringFrontRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [finish, setFinish] = useState<HoloFinish>("rainbow");
  const finishRef = useRef<HoloFinish>("rainbow");
  finishRef.current = finish;
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
      let tX = 0;
      let tY = 0;
      if (now - s.lastPointer > 1200) {
        const t = now / 1000;
        tX = 2.2 * Math.sin(0.9 * t + 0.6) + 0.8 * Math.sin(2.3 * t);
        tY = 3.2 * Math.sin(0.7 * t) + 0.9 * Math.sin(1.9 * t + 1.2);
        s.tgx = 34 + tY * 3;
        s.tgy = 22 - tX * 3;
      }
      s.vX += (140 * ((s.pointerTiltX ?? tX) - s.tiltX) - 15 * s.vX) * dt;
      s.vY += (140 * ((s.pointerTiltY ?? tY) - s.tiltY) - 15 * s.vY) * dt;
      s.tiltX += s.vX * dt;
      s.tiltY += s.vY * dt;
      s.gvx += (160 * (s.tgx - s.gx) - 25.3 * s.gvx) * dt;
      s.gvy += (160 * (s.tgy - s.gy) - 25.3 * s.gvy) * dt;
      s.gx += s.gvx * dt;
      s.gy += s.gvy * dt;
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
      const foil = foilRef.current;
      if (foil) {
        const f = finishRef.current;
        if (f === "rainbow") {
          foil.style.background = "repeating-linear-gradient(115deg, #ff5a5a 0 34px, #ffb35a 34px 68px, #f7e05a 68px 102px, #5ad97a 102px 136px, #5aa8ff 136px 170px, #b45aff 170px 204px)";
          foil.style.backgroundPosition = `${s.gx * 1.6}px ${s.gy * 1.6}px`;
          foil.style.mixBlendMode = "color-dodge";
          foil.style.opacity = `${(0.3 + s.on * 0.6) * 0.85}`;
          foil.style.maskImage = `radial-gradient(circle at ${s.gx}% ${s.gy}%, black 12%, transparent 68%)`;
          foil.style.transform = "none";
        } else if (f === "prism") {
          foil.style.background = `repeating-radial-gradient(circle at ${s.gx}% ${s.gy}%, rgb(150 190 255 / 0.5) 0 2px, transparent 2px 26px)`;
          foil.style.backgroundPosition = "0 0";
          foil.style.mixBlendMode = "screen";
          foil.style.opacity = `${0.25 + s.on * 0.45}`;
          foil.style.maskImage = "none";
          foil.style.transform = "none";
        } else if (f === "pearl") {
          foil.style.background = `linear-gradient(${115 + s.gx}deg, rgb(255 183 214 / 0.55), rgb(183 224 255 / 0.5) 38%, rgb(214 255 224 / 0.5) 62%, rgb(255 240 183 / 0.55))`;
          foil.style.backgroundPosition = "0 0";
          foil.style.mixBlendMode = "multiply";
          foil.style.opacity = `${0.35 + s.on * 0.4}`;
          foil.style.maskImage = "none";
          foil.style.transform = `translate(${s.gx * 0.4 - 20}px, ${s.gy * 0.4 - 20}px)`;
        } else {
          foil.style.background =
            "radial-gradient(circle, rgb(255 255 255 / 0.95) 0 1.2px, transparent 1.6px), radial-gradient(circle, rgb(190 220 255 / 0.9) 0 1px, transparent 1.4px)";
          foil.style.backgroundSize = "23px 23px, 17px 17px";
          foil.style.backgroundPosition = `${s.gx * 0.8}px ${s.gy * 0.8}px, ${-s.gx * 0.6 + 8}px ${-s.gy * 0.6 + 5}px`;
          foil.style.mixBlendMode = "screen";
          foil.style.opacity = `${0.3 + s.on * 0.65}`;
          foil.style.maskImage = `radial-gradient(circle at ${s.gx}% ${s.gy}%, black 20%, transparent 75%)`;
          foil.style.transform = "none";
        }
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
    if (reduced && glareFrontRef.current) {
      glareFrontRef.current.style.background = `radial-gradient(circle at ${fx * 100}% ${fy * 100}%, rgb(255 255 255 / 0.6), rgb(255 255 255 / 0.14) 28%, rgb(0 0 0 / 0.3) 95%)`;
      glareFrontRef.current.style.opacity = "1";
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

  const edgeColor = holoFinishes.find(f => f.id === finish)?.edge ?? "#232a38";
  const frontBg = finish === "pearl"
    ? "linear-gradient(140deg, #fdf7fa, #f3e4ee 55%, #e8dfe9)"
    : "linear-gradient(140deg, #1d2a4a, #2c4470 55%, #10182c)";

  return (
    <Section no="018" title="全息卡片">
      <div className="ilab-holo-scene flex flex-col items-center py-4">
        <div className="relative">
          <div
            ref={shadowRef}
            className="absolute top-full left-1/2 mt-[30px] h-[70px] w-[84%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-[24px]"
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
              <div key={i} className="ilab-holo-edge rounded-[28px]" style={{ transform: `translateZ(${-5 + i}px)`, background: edgeColor }} aria-hidden />
            ))}
            <div className="ilab-holo-face ilab-holo-front rounded-[28px]" style={{ background: frontBg, color: finish === "pearl" ? "#3d2b38" : "#fff" }}>
              <div ref={foilRef} className="ilab-holo-foil" aria-hidden />
              <div className="relative flex h-full flex-col justify-between p-6" style={{ transform: "translateZ(18px)" }}>
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold tracking-[0.18em]">CREASE</p>
                  <CreditCard className="size-6 opacity-80" />
                </div>
                <div
                  className="mx-auto grid size-24 place-items-center rounded-full"
                  style={{ transform: "translateZ(16px)", background: "radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.35), rgb(255 255 255 / 0.06) 60%)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.35)" }}
                  aria-hidden
                >
                  <span className="text-2xl font-semibold tracking-widest">CR</span>
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
        <div className="mt-16 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="全息面 finish">
          {holoFinishes.map(f => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={finish === f.id}
              onClick={() => setFinish(f.id)}
              className={`min-h-11 rounded-full px-4 text-sm ${finish === f.id ? "bg-secondary font-medium" : "text-muted-foreground"}`}
            >
              {f.name}
            </button>
          ))}
        </div>
        <p className="crease-caption mt-3">分层固定：底图 → 箔面 → 印刷层 → 眩光 → 边光环。倾斜走带过冲的弹簧、光点走无过冲弹簧，两者分开才有实物感；离开后卡片自摇、光点停在左上。</p>
      </div>
    </Section>
  );
}

/* ————— 019 滚动驱动卡片：堆叠 / 飞牌 / 钉住画廊 / 封面流 / 图片展开 ————— */

const stackCards = [
  { title: "调研结论", tint: "#eef2f5" },
  { title: "信息架构", tint: "#e4ebef" },
  { title: "视觉走查", tint: "#d9e2e9" },
  { title: "交付清单", tint: "#cdd9e2" },
];
const deckCards = ["访谈纪要", "竞品拆解", "用户旅程", "低保真原型", "可用性测试"];
const galleryCards = ["场域", "玻璃", "亚克力", "信号红", "刻字", "流光", "刻度", "留白"];
const coverCards = ["访谈", "旅程", "原型", "走查", "交付", "复盘", "归档"];

export function ScrollSection() {
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const stackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const deckWrapRef = useRef<HTMLDivElement>(null);
  const deckRefs = useRef<(HTMLDivElement | null)[]>([]);
  const galWrapRef = useRef<HTMLDivElement>(null);
  const galRowRef = useRef<HTMLDivElement>(null);
  const galBarRef = useRef<HTMLDivElement>(null);
  const expWrapRef = useRef<HTMLDivElement>(null);
  const expClipRef = useRef<HTMLDivElement>(null);
  const expImgRef = useRef<HTMLImageElement>(null);
  const expTitleRef = useRef<HTMLDivElement>(null);
  const coverRowRef = useRef<HTMLDivElement>(null);
  const coverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const coverDarkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ticking = useRef(false);

  const update = useCallback(() => {
    const box = boxRef.current;
    if (!box || reduced) return;
    const boxRect = box.getBoundingClientRect();
    // Stacked: covered cards recede 5% and darken 12% per cover
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
    // Deck: each 1/4 of the travel throws one card out, alternating sides
    const deckWrap = deckWrapRef.current;
    if (deckWrap) {
      const D = deckWrap.offsetHeight - 330;
      const scrolled = clamp(boxRect.top - deckWrap.getBoundingClientRect().top, 0, D);
      const f = D > 0 ? scrolled / (D / 4) : 0;
      deckRefs.current.forEach((card, i) => {
        if (!card) return;
        const t = clamp(f - i, 0, 1);
        const side = i % 2 === 0 ? 1 : -1;
        const depth = Math.max(0, i - f);
        const x = side * t * t * 560;
        const y = t * (140 * t - 36) + (t < 1 ? depth * 16 : 0);
        const scale = t < 1 ? 1 - depth * 0.05 : 1;
        card.style.transform = `translate(-50%, 0) translate(${x}px, ${y}px) rotate(${side * t * 16}deg) scale(${scale})`;
        card.style.filter = `brightness(${t < 1 ? 1 - depth * 0.05 : 1})`;
        card.style.zIndex = `${20 - i}`;
        card.style.opacity = t >= 1 ? "0" : "1";
      });
    }
    // Pinned gallery: vertical scroll becomes horizontal travel, 1:1
    const galWrap = galWrapRef.current;
    const galRow = galRowRef.current;
    if (galWrap && galRow) {
      const D = galWrap.offsetHeight - 300;
      const scrolled = clamp(boxRect.top - galWrap.getBoundingClientRect().top, 0, D);
      const p = D > 0 ? scrolled / D : 0;
      const overflow = Math.max(0, galRow.scrollWidth - galWrap.clientWidth + 40);
      galRow.style.transform = `translateX(${-p * overflow}px)`;
      if (galBarRef.current) galBarRef.current.style.width = `${p * 100}%`;
    }
    // Image expand: clip-path opens the frame to full bleed
    const expWrap = expWrapRef.current;
    if (expWrap && expClipRef.current) {
      const D = expWrap.offsetHeight - 330;
      const scrolled = clamp(boxRect.top - expWrap.getBoundingClientRect().top, 0, D);
      const p = D > 0 ? scrolled / D : 0;
      const e = smooth(clamp(p / 0.78, 0, 1));
      expClipRef.current.style.clipPath = `inset(${26 * (1 - e)}% ${15 * (1 - e)}% round ${20 * (1 - e)}px)`;
      if (expImgRef.current) expImgRef.current.style.transform = `scale(${1.2 - 0.2 * e})`;
      if (expTitleRef.current) {
        const tf = clamp(p * 2, 0, 1);
        expTitleRef.current.style.opacity = `${1 - tf}`;
        expTitleRef.current.style.transform = `translateY(${-60 * tf}px)`;
      }
    }
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

  const onCoverScroll = () => {
    const row = coverRowRef.current;
    if (!row || reduced) return;
    const center = row.scrollLeft + row.clientWidth / 2;
    coverRefs.current.forEach((card, i) => {
      if (!card) return;
      const cc = card.offsetLeft + card.offsetWidth / 2;
      const d = (cc - center) / 210;
      const cd = clamp(d, -1, 1);
      card.style.transform = `rotateY(${cd * -30}deg) scale(${Math.max(0.6, 1 - Math.abs(cd) * 0.2)})`;
      card.style.zIndex = `${Math.round(10 - Math.abs(d))}`;
      const dark = coverDarkRefs.current[i];
      if (dark) dark.style.opacity = `${Math.min(Math.abs(d), 3) * 0.15}`;
    });
  };

  useEffect(() => {
    onCoverScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <Section no="019" title="滚动驱动卡片">
      <div
        ref={boxRef}
        className="ilab-scrollbox h-[440px] overflow-y-auto rounded-2xl border bg-white/50 px-5 py-5"
        onScroll={onScroll}
        tabIndex={0}
        aria-label="滚动驱动演示区，在区域内滚动"
      >
        <p className="crease-eyebrow">堆叠卡 · 后来者粘住时，前卡退后压暗</p>
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
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">被盖住时 scale 1→0.95、压暗 12%，每张低 16px 粘住，边条表示层序。</p>
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

        <p className="crease-eyebrow mt-2">卡组飞牌 · 每滚一段扔一张，左右交替抛物飞出</p>
        <div ref={deckWrapRef} className="relative mt-3" style={{ height: 1050 }}>
          <div className="sticky top-0 flex h-[330px] items-start justify-center overflow-visible pt-4">
            {deckCards.map((title, i) => (
              <div
                key={title}
                ref={el => {
                  deckRefs.current[i] = el;
                }}
                className="crease-glass absolute left-1/2 flex h-[240px] w-[210px] flex-col justify-between rounded-[24px] p-5"
                style={{ transformOrigin: "bottom center" }}
              >
                <p className="crease-eyebrow">卡组 · {String(i + 1).padStart(2, "0")}</p>
                <p className="text-base font-medium">{title}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="crease-eyebrow mt-2">钉住画廊 · 纵向滚动 1:1 变横移，无缓动</p>
        <div ref={galWrapRef} className="relative mt-3" style={{ height: 860 }}>
          <div className="sticky top-0 flex h-[300px] flex-col justify-center overflow-hidden">
            <div ref={galRowRef} className="flex gap-6 will-change-transform">
              {galleryCards.map((t, i) => (
                <div key={t} className="flex h-[190px] w-[240px] shrink-0 flex-col justify-between rounded-[24px] p-5" style={{ background: ["#eef2f5", "#e2ecf3", "#d8e4ee", "#f6e3e4", "#e9e9ec", "#e4f0e8", "#efe9dc", "#e6e2f0"][i] }}>
                  <p className="crease-eyebrow">{String(i + 1).padStart(2, "0")}</p>
                  <p className="text-base font-medium">{t}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 h-0.5 w-full rounded bg-black/5">
              <div ref={galBarRef} className="h-full rounded bg-black/30" style={{ width: 0 }} />
            </div>
          </div>
        </div>

        <p className="crease-eyebrow mt-2">图片展开 · 图框用 clip-path 开到满幅，标题两倍速淡出</p>
        <div ref={expWrapRef} className="relative mt-3" style={{ height: 900 }}>
          <div className="sticky top-0 h-[330px] overflow-hidden rounded-[20px] bg-[#10151b]">
            <div ref={expClipRef} className="absolute inset-0" style={{ clipPath: "inset(26% 15% round 20px)" }}>
              <img ref={expImgRef} src={bridge} alt="" aria-hidden className="h-full w-full object-cover" style={{ transform: "scale(1.2)" }} />
            </div>
            <div ref={expTitleRef} className="absolute inset-x-0 top-8 text-center text-white">
              <p className="text-lg font-medium">下一章 · 视觉走查</p>
              <p className="mt-1 text-sm text-white/70">主图开启下一章，展开后图静止、标题继续以 0.25 倍速上升</p>
            </div>
          </div>
        </div>
        <div className="h-10" />
      </div>

      <p className="crease-eyebrow mt-6 mb-3">封面流 · 横向滚动，离中心越远转得越侧</p>
      <div
        ref={coverRowRef}
        className="ilab-cover-row flex snap-x snap-mandatory gap-0 overflow-x-auto rounded-2xl border bg-white/50 px-[38%] py-6"
        onScroll={onCoverScroll}
        tabIndex={0}
        aria-label="封面流演示，横向滚动"
      >
        {coverCards.map((t, i) => (
          <div key={t} className="w-[210px] shrink-0 snap-center px-[5px]">
            <div
              ref={el => {
                coverRefs.current[i] = el;
              }}
              className="ilab-flow-card relative flex h-[200px] items-end overflow-hidden rounded-[20px] p-4"
              style={{ background: `linear-gradient(160deg, ${["#dfe9f2", "#f3e2e3", "#e6ecdf", "#ece7f5", "#f5ecd9", "#dfeef0", "#e9e4da"][i]}, #ffffff)` }}
            >
              <p className="text-sm font-medium">{t}</p>
              <div
                ref={el => {
                  coverDarkRefs.current[i] = el;
                }}
                className="pointer-events-none absolute inset-0 bg-black opacity-0"
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>
      <p className="crease-caption mt-3">五种效果全部由滚动位置直接决定：停在中间就停在中间，回滚就反着播；不吸附、不劫持滚轮（封面流的吸附点除外）。</p>
    </Section>
  );
}

