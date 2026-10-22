import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Sparkline({ values, label, className }: { values: number[]; label: string; className?: string }) {
  const data = values.filter(Number.isFinite);
  if (data.length < 2) return <p className="text-xs text-muted-foreground">暂无趋势数据</p>;
  const min = Math.min(...data), range = Math.max(...data) - min || 1;
  const points = data.map((v, i) => ((i / (data.length - 1)) * 200) + "," + (46 - (v - min) / range * 38)).join(" ");
  return <svg viewBox="0 0 200 54" className={cn("h-14 w-full text-primary", className)} role="img" aria-label={label}><polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} /></svg>;
}
export function MetricCard({ label, value, unit, change, detail, trend, emphasis = false }: { label: string; value: string; unit?: string; change: number; detail: string; trend: number[]; emphasis?: boolean }) {
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return <Card className={cn("min-w-0 gap-0 text-foreground rounded-2xl border-white/60 shadow-none", emphasis ? "crease-ink" : "crease-glass")}><CardContent className="space-y-5"><div className="flex items-start justify-between gap-3"><h3 className="text-sm text-muted-foreground">{label}</h3><Icon className="size-4" /></div><p className="text-3xl tracking-tight tabular-nums">{value}<span className="ml-1 text-sm text-muted-foreground">{unit}</span></p><Sparkline values={trend} label={label + "趋势"} /><div className="flex flex-wrap gap-x-2 gap-y-1 text-xs"><span>{change > 0 ? "+" : ""}{change}%</span><span className="text-muted-foreground">{detail}</span></div></CardContent></Card>;
}
