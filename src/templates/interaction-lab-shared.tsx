import { useEffect, useState, type ReactNode } from "react";

/* ————— shared helpers ————— */

export function useReducedMotion() {
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

export function Section({ no, title, children }: { no: string; title: string; children: ReactNode }) {
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

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function SliderRow({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex w-full max-w-md items-center gap-4 text-sm">
      <span className="w-20 shrink-0 font-medium">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="min-h-11 min-w-0 flex-1" style={{ accentColor: "var(--primary)" }} aria-label={label}
      />
      <span className="w-14 text-right tabular-nums">{value}{unit}</span>
    </label>
  );
}

export const smooth = (t: number) => t * t * (3 - 2 * t);
