import { useState } from "react";
import { StatePanel } from "./feedback";

export type BarDatum = { label: string; value: number; comparison: number };
/** Nonnegative paired values. Buttons expose exact values on keyboard, touch and pointer. */
export function BarChart({ data, label, unit = "次" }: { data: BarDatum[]; label: string; unit?: string }) {
  const [active, setActive] = useState<number | null>(null);
  if (!data.length) return <StatePanel state="empty" title="暂无统计数据" description="选择其他时间范围后重试。" />;
  if (data.some(d => !Number.isFinite(d.value) || !Number.isFinite(d.comparison) || d.value < 0 || d.comparison < 0)) return <StatePanel state="error" title="统计数据不可用" description="图表需要有效的非负数值。" />;
  const max = Math.max(1, ...data.flatMap(d => [d.value, d.comparison]));
  const selected = active === null ? null : data[active];
  return <div><div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span>单位：{unit} · 最大值 {max.toLocaleString()}</span><span className="flex gap-4"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-primary" />本期</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-foreground/25" />上期</span></span></div><div className="overflow-x-auto pb-2"><div className="relative grid min-w-[420px] gap-3 border-b pt-4" style={{gridTemplateColumns:"repeat(" + data.length + ", minmax(0,1fr))"}} role="group" aria-label={label}>{data.map((d, index) => <button key={d.label} type="button" aria-pressed={active === index} aria-label={d.label + "：本期 " + d.value + unit + "，上期 " + d.comparison + unit} onClick={() => setActive(index)} className="crease-chart-column group relative rounded-t-lg px-1 pt-3 hover:bg-accent/40 focus-visible:bg-accent/40"><span className="crease-chart-bars flex h-48 items-end justify-center gap-1.5 border-b border-border/50"><span className="crease-chart-bar w-5 rounded-t bg-foreground/20" style={{height:(d.comparison/max*100)+"%"}} /><span className="crease-chart-bar w-5 rounded-t bg-primary" style={{height:(d.value/max*100)+"%"}} /></span><span className="block py-3 text-xs text-muted-foreground">{d.label}</span></button>)}</div></div><p role="status" className="mt-4 min-h-6 text-sm text-muted-foreground">{selected ? selected.label + " · 本期 " + selected.value.toLocaleString() + unit + " / 上期 " + selected.comparison.toLocaleString() + unit : "点击任一组柱形，查看准确数值。"}</p></div>;
}
