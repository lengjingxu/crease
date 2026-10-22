import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatePanel } from "./feedback";

export type DataColumn<T> = { key: string; title: string; align?: "left" | "right"; render: (row: T) => ReactNode; sortValue?: (row: T) => string | number };
export function DataTable<T extends { id: string }>({ rows, columns, searchText, label, onDelete, state = "ready", onRetry }: { rows: T[]; columns: DataColumn<T>[]; searchText: (row: T) => string; label: string; onDelete?: (ids: string[]) => void; state?: "ready" | "loading" | "error"; onRetry?: () => void }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const [selection, setSelection] = useState<string[]>([]);
  const filtered = rows.filter(row => searchText(row).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const column = columns.find(c => c.key === sort?.key);
  if (column?.sortValue) filtered.sort((a, b) => {
    const x = column.sortValue!(a), y = column.sortValue!(b);
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "zh-CN")) * (sort?.desc ? -1 : 1);
  });
  const last = Math.max(0, Math.ceil(filtered.length / 5) - 1), current = Math.min(page, last);
  const visible = filtered.slice(current * 5, current * 5 + 5);
  const selected = selection.filter(id => rows.some(row => row.id === id));
  const checked = visible.length > 0 && visible.every(row => selected.includes(row.id));
  return <section className="crease-glass crease-data-table min-w-0 overflow-hidden rounded-2xl" aria-label={label}><div className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h2 className="text-lg font-medium">{label}</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} 条记录 · 已选 {selected.length} 条</p></div><div className="flex w-full flex-wrap items-center gap-2 sm:w-auto"><label className="relative min-w-0 flex-1 sm:w-56"><span className="sr-only">搜索{label}</span><Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" /><Input value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="搜索名称、成员或状态" className="h-11 pl-9" /></label>{onDelete && <Button variant="outline" disabled={!selected.length || state !== "ready"} onClick={() => onDelete(selected)}>删除所选</Button>}</div></div>
    {state !== "ready" ? <StatePanel state={state} onAction={state === "error" ? onRetry : undefined} /> : !filtered.length ? <StatePanel state="empty" title={query ? "没有匹配的记录" : "还没有记录"} description={query ? "试试其他关键词，或清除当前搜索。" : "添加第一条记录后会显示在这里。"} actionLabel="清除搜索" onAction={query ? () => setQuery("") : undefined} /> : <><Table><TableHeader><TableRow>{onDelete && <TableHead className="w-14"><label className="grid size-11 place-items-center"><span className="sr-only">选择当前页</span><Checkbox checked={checked ? true : visible.some(row => selected.includes(row.id)) ? "indeterminate" : false} onCheckedChange={value => setSelection(value === true ? [...new Set([...selected, ...visible.map(row => row.id)])] : selected.filter(id => !visible.some(row => row.id === id)))} /></label></TableHead>}{columns.map(c => <TableHead key={c.key} className={c.align === "right" ? "text-right" : undefined} aria-sort={sort?.key === c.key ? sort.desc ? "descending" : "ascending" : undefined}>{c.sortValue ? <button className={"flex min-h-11 items-center gap-2 whitespace-nowrap " + (c.align === "right" ? "ml-auto" : "")} onClick={() => { setSort({key:c.key,desc:sort?.key === c.key && !sort.desc}); setPage(0); }}>{c.title}{sort?.key !== c.key ? <ArrowUpDown className="size-3" /> : sort.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}</button> : c.title}</TableHead>)}</TableRow></TableHeader><TableBody>{visible.map(row => <TableRow key={row.id} data-state={selected.includes(row.id) ? "selected" : undefined}>{onDelete && <TableCell><label className="grid size-11 place-items-center"><span className="sr-only">选择记录 {row.id}</span><Checkbox checked={selected.includes(row.id)} onCheckedChange={value => setSelection(value === true ? [...selected, row.id] : selected.filter(id => id !== row.id))} /></label></TableCell>}{columns.map(c => <TableCell key={c.key} className={"py-4 text-sm " + (c.align === "right" ? "text-right tabular-nums" : "")}>{c.render(row)}</TableCell>)}</TableRow>)}</TableBody></Table><div className="flex items-center justify-between gap-3 border-t px-5 py-3"><span className="text-xs text-muted-foreground">第 {current*5+1}–{Math.min((current+1)*5,filtered.length)} 条，共 {filtered.length} 条</span><div className="flex gap-2"><Button variant="ghost" size="icon" aria-label="上一页" disabled={current === 0} onClick={() => setPage(current-1)}><ChevronLeft /></Button><Button variant="ghost" size="icon" aria-label="下一页" disabled={current === last} onClick={() => setPage(current+1)}><ChevronRight /></Button></div></div></>}
  </section>;
}
