import { useId } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Sparkline({ values, label, className }: { values: number[]; label: string; className?: string }) {
  const id = useId();
  const data = values.filter(Number.isFinite);
  if (data.length < 2) return <p className="text-xs text-muted-foreground">暂无趋势数据</p>;
  const min = Math.min(...data), range = Math.max(...data) - min || 1;
  const points = data.map((v, i) => ((i / (data.length - 1)) * 200) + "," + (46 - (v - min) / range * 38)).join(" ");
  return <svg viewBox="0 0 200 54" className={cn("h-16 w-full overflow-visible text-primary", className)} role="img" aria-label={label}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="currentColor" stopOpacity=".16" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    <path d="M0 14H200M0 32H200M0 50H200" stroke="currentColor" strokeDasharray="2 5" className="crease-sparkline-grid" />
    <polygon points={"0,54 " + points + " 200,54"} fill={"url(#"+id+")"} />
    <polyline className="crease-sparkline-stroke" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
    <circle cx="200" cy={46-(data[data.length-1]-min)/range*38} r="3" fill="currentColor" stroke="var(--background)" strokeWidth="1.5" />
  </svg>;
}
export function MetricCard({ label, value, unit, change, detail, trend, emphasis = false }: { label: string; value: string; unit?: string; change: number; detail: string; trend: number[]; emphasis?: boolean }) {
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return <Card className={cn("crease-instrument min-w-0 gap-0 text-foreground rounded-2xl", emphasis ? "crease-ink" : "crease-glass")}><CardContent className="space-y-5"><div className="flex items-start justify-between gap-3"><h3 className="text-sm text-muted-foreground">{label}</h3><Icon className="size-4" /></div><p className="text-[42px] leading-none tracking-tight tabular-nums">{value}<span className="ml-1 text-sm text-muted-foreground">{unit}</span></p><Sparkline values={trend} label={label + "趋势"} /><div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"><span className="rounded-full border border-current/10 px-2 py-0.5">{change > 0 ? "+" : ""}{change}%</span><span className="text-muted-foreground">{detail}</span></div></CardContent></Card>;
}
