import { useRef, useState } from "react";
import { Plus, CalendarDays, ArrowUpRight, Flag, CheckCheck, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeading } from "@/components/kit/page-heading";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/kit/toast";

const stages = ["待开始", "进行中", "已完成"] as const;
type Stage = typeof stages[number];
type Task = { id: string; title: string; owner: string; due: string; stage: Stage; priority: "高优先" | "常规"; note: string };
const initial: Task[] = [
  { id: "01", title: "梳理新用户的首次体验", owner: "林晓", due: "2026-10-26", stage: "待开始", priority: "高优先", note: "整理注册、创建空间到首次完成任务的关键路径。" },
  { id: "02", title: "更新产品插图资源", owner: "陈然", due: "2026-10-27", stage: "待开始", priority: "常规", note: "补齐空状态、导入与完成三个场景的插图。" },
  { id: "03", title: "设计系统 · 玻璃材质", owner: "许知", due: "2026-10-24", stage: "进行中", priority: "高优先", note: "检查冰蓝环境光、玻璃接触阴影与黑色亚克力的可读性。" },
  { id: "04", title: "评审移动端表格交互", owner: "周予", due: "2026-10-25", stage: "进行中", priority: "常规", note: "验证搜索、选择、分页和侧向滚动的触控体验。" },
  { id: "05", title: "确认品牌字体层级", owner: "林晓", due: "2026-10-22", stage: "已完成", priority: "常规", note: "正文 16px、界面文字 14px、标注不小于 12px。" },
];

type Drag = { id: string; dx: number; dy: number; stage: Stage; index: number };

export function TasksTemplate() {
  const { toast, notify } = useToast();
  const [tasks, setTasks] = useState(initial);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [create, setCreate] = useState(false);
  const [leaving, setLeaving] = useState("");
  const [drag, setDrag] = useState<Drag | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const cards = useRef<Record<string, HTMLElement | null>>({});
  const columns = useRef<Partial<Record<Stage, HTMLElement | null>>>({});
  const snap = useRef<{ cards: Record<string, DOMRect>; columns: Partial<Record<Stage, DOMRect>> }>({ cards: {}, columns: {} });

  const complete = tasks.filter(t => t.stage === "已完成").length;
  const filtered = query.trim().length > 0;
  const visible = tasks.filter(t => (t.title + t.owner).includes(query.trim()));
  const indexOf = (task: Task) => tasks.filter(t => t.stage === task.stage).findIndex(t => t.id === task.id);

  function move(task: Task, stage: Stage) {
    setTasks(tasks.map(t => t.id === task.id ? { ...t, stage } : t));
    toast("「" + task.title + "」已移至 " + stage + "。");
  }

  function remove(task: Task) {
    const index = tasks.findIndex(t => t.id === task.id);
    setLeaving(task.id);
    window.setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setLeaving("");
    }, 240);
    notify({
      title: "任务已删除",
      body: task.title,
      actionLabel: "撤销",
      onAction: () => setTasks(prev => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, task);
        return next;
      }),
    });
  }

  function capture() {
    const cardRects: Record<string, DOMRect> = {};
    for (const task of tasks) {
      const el = cards.current[task.id];
      if (el) cardRects[task.id] = el.getBoundingClientRect();
    }
    const columnRects: Partial<Record<Stage, DOMRect>> = {};
    for (const stage of stages) {
      const el = columns.current[stage];
      if (el) columnRects[stage] = el.getBoundingClientRect();
    }
    snap.current = { cards: cardRects, columns: columnRects };
  }

  function targetAt(x: number, y: number, fallback: Stage, dragged: string) {
    let stage = fallback;
    for (const name of stages) {
      const rect = snap.current.columns[name];
      if (rect && x >= rect.left && x <= rect.right && y >= rect.top - 32 && y <= rect.bottom + 32) { stage = name; break; }
    }
    const rest = tasks.filter(t => t.stage === stage && t.id !== dragged);
    let index = rest.length;
    for (let i = 0; i < rest.length; i++) {
      const rect = snap.current.cards[rest[i].id];
      if (rect && y < rect.top + rect.height / 2) { index = i; break; }
    }
    return { stage, index };
  }

  function endDrag(commit: boolean) {
    if (!drag) return;
    const task = tasks.find(t => t.id === drag.id);
    const { stage, index } = drag;
    setDrag(null);
    if (!commit || !task) return;
    if (task.stage === stage && indexOf(task) === index) return;
    setTasks(prev => {
      const groups = stages.map(name => prev.filter(t => t.stage === name && t.id !== task.id));
      groups[stages.indexOf(stage)].splice(index, 0, { ...task, stage });
      return stages.flatMap((_, i) => groups[i]);
    });
    toast(task.stage === stage ? "已调整「" + task.title + "」的顺序。" : "「" + task.title + "」已移至 " + stage + "。");
  }

  return <div className="space-y-7">
    <PageHeading eyebrow="团队协作 / 本周看板" title="让好的想法，有序发生" description="把目标拆成可以完成的小事，让每个人知道下一步。演示操作仅保留在当前页面。" actions={<Button onClick={() => { setEditing(null); setCreate(true); }}><Plus />添加任务</Button>} />
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
      <section data-reveal className="crease-ink crease-instrument rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" />第 43 周 · 设计迭代</span><span className="rounded-full border border-white/20 px-3 py-1 text-xs">10.22 — 10.28</span></div>
        <div className="my-6 flex items-end gap-3"><span className="text-5xl tabular-nums">{complete.toString().padStart(2, "0")}</span><span className="pb-1 text-sm text-muted-foreground">/ {tasks.length.toString().padStart(2, "0")} 项已完成</span></div>
        <Progress value={tasks.length ? complete / tasks.length * 100 : 0} aria-label="本周任务完成比例" className="h-1.5 bg-white/15" />
        <div className="mt-5 flex items-center justify-between"><p className="text-sm text-muted-foreground">一点一点，让计划成为现实。</p><CheckCheck className="size-5 text-primary" /></div>
      </section>
      <section data-reveal className="crease-glass relative overflow-hidden rounded-2xl p-6">
        <div className="crease-ticks mb-5" />
        <p className="text-xs tracking-widest text-muted-foreground">下一次团队评审</p>
        <div className="mt-4 flex items-center gap-5"><div className="border-r pr-5"><span className="block text-4xl font-light tabular-nums">28</span><span className="text-xs text-muted-foreground">星期三</span></div><div><h2 className="font-medium">产品体验与材质评审</h2><p className="mt-2 text-sm text-muted-foreground">14:00 — 14:45 · 设计工作室</p></div></div>
        <div className="mt-5 flex items-center"><div className="flex -space-x-2">{["林", "陈", "许", "周"].map((name, i) => <span key={name} className={"grid size-9 place-items-center rounded-full border-2 border-background text-xs " + (i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>{name}</span>)}</div><span className="ml-3 text-xs text-muted-foreground">4 位成员 · 示例安排</span></div>
      </section>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-xl font-medium">迭代任务 <span className="ml-2 text-sm font-normal text-muted-foreground">{visible.length} 项</span></h2>
      <Input aria-label="搜索任务" placeholder="搜索任务或负责人" value={query} onChange={e => setQuery(e.target.value)} className="h-11 w-full sm:w-64" />
    </div>
    <p role="status" className="text-xs text-muted-foreground">{filtered ? "搜索时暂停拖拽，清空关键词后可调整顺序。" : "拖动卡片左上角的把手调整顺序或跨列移动；Esc 取消。"}</p>

    <div className="grid items-start gap-5 xl:grid-cols-3">
      {stages.map((stage, stageIndex) => <section key={stage} className="min-w-0" ref={el => { columns.current[stage] = el; }} data-drop={drag?.stage === stage && drag.id ? "true" : undefined}>
        <div className="mb-5 flex items-center justify-between border-t border-border pt-4">
          <h3 className="flex items-center gap-2 text-sm font-medium"><span className={"size-2 rounded-full " + (stageIndex === 1 ? "bg-primary" : stageIndex === 2 ? "bg-foreground" : "border border-muted-foreground")} />{stage}</h3>
          <span className="font-mono text-xs text-muted-foreground">0{visible.filter(t => t.stage === stage).length}</span>
        </div>
        <div className="space-y-4">
          {visible.filter(t => t.stage === stage).map(task => {
            const dragging = drag?.id === task.id;
            let shift = 0;
            if (drag && !dragging && drag.stage === stage) {
              const rest = tasks.filter(t => t.stage === stage && t.id !== drag.id);
              const slot = rest.findIndex(t => t.id === task.id);
              const n = slot >= drag.index ? slot - drag.index : drag.index - slot - 1;
              shift = (slot >= drag.index ? 1 : -1) * 8 * Math.pow(0.7, n);
            }
            return <article
              key={task.id}
              ref={el => { cards.current[task.id] = el; }}
              data-dragging={dragging || undefined}
              className={(task.id === "03" ? "crease-ink crease-instrument" : "crease-glass") + " crease-lift relative rounded-2xl p-5 " + (leaving === task.id ? "crease-exit" : "")}
              style={dragging
                ? { transform: "translate(" + drag!.dx + "px, " + drag!.dy + "px) scale(1.02)", zIndex: 30, transition: "none" }
                : shift
                  ? { transform: "translateY(" + shift + "px)", transition: "transform 250ms var(--ease-settle) 24ms" }
                  : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={"拖动任务：" + task.title}
                    disabled={filtered}
                    className="-ml-2 grid size-8 cursor-grab place-items-center rounded-lg text-muted-foreground touch-none disabled:cursor-not-allowed disabled:opacity-40"
                    onPointerDown={e => {
                      if (filtered) return;
                      e.currentTarget.setPointerCapture(e.pointerId);
                      start.current = { x: e.clientX, y: e.clientY };
                      capture();
                      setDrag({ id: task.id, dx: 0, dy: 0, stage: task.stage, index: indexOf(task) });
                    }}
                    onPointerMove={e => {
                      if (drag?.id !== task.id) return;
                      const dx = e.clientX - start.current.x;
                      const dy = e.clientY - start.current.y;
                      setDrag({ ...drag, dx, dy, ...targetAt(e.clientX, e.clientY, drag.stage, task.id) });
                    }}
                    onPointerUp={() => endDrag(true)}
                    onPointerCancel={() => endDrag(false)}
                    onKeyDown={e => { if (e.key === "Escape") endDrag(false); }}
                  ><GripVertical className="size-4" /></button>
                  <Badge variant={task.priority === "高优先" ? "default" : "outline"}>{task.priority === "高优先" && <Flag className="size-3" />}{task.priority}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs tabular-nums text-muted-foreground">CR / {task.id}</span>
                  <Button variant="ghost" size="icon" aria-label={"删除任务：" + task.title} onClick={() => remove(task)}><Trash2 className="size-4" /></Button>
                </div>
              </div>
              <button onClick={() => { setEditing(task); setCreate(true); }} className="mt-5 flex w-full items-start justify-between gap-3 text-left"><h4 className="text-lg leading-7 font-medium">{task.title}</h4><ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground" /></button>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{task.note}</p>
              <div className="my-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-secondary text-secondary-foreground">{task.owner[0]}</span>{task.owner}</span><span>{task.due.slice(5).replace("-", "月")}日</span></div>
              <Select value={task.stage} onValueChange={v => move(task, v as Stage)}><SelectTrigger className="min-h-11 w-full" aria-label={"移动任务：" + task.title}><SelectValue /></SelectTrigger><SelectContent>{stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </article>;
          })}
          {!visible.some(t => t.stage === stage) && <div className="rounded-2xl border border-dashed px-5 py-12 text-center text-sm text-muted-foreground">{query ? "没有匹配的任务" : "这一列还没有任务"}</div>}
        </div>
      </section>)}
    </div>

    <Dialog open={create} onOpenChange={setCreate}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "任务详情" : "添加任务"}</DialogTitle><DialogDescription>编辑任务说明、负责人和交付日期。</DialogDescription></DialogHeader>
        <form key={editing?.id || "new"} className="space-y-4" onSubmit={e => {
          e.preventDefault();
          const data = new FormData(e.currentTarget), title = String(data.get("title")).trim(), owner = String(data.get("owner")).trim();
          if (!title || !owner) return;
          const task: Task = { id: editing?.id || crypto.randomUUID().slice(0, 6), title, owner, due: String(data.get("due")), note: String(data.get("note")).trim(), stage: editing?.stage || "待开始", priority: editing?.priority || "常规" };
          setTasks(editing ? tasks.map(t => t.id === task.id ? task : t) : [...tasks, task]);
          toast(editing ? "任务已更新。" : "任务已添加到待开始。");
          setCreate(false);
        }}>
          {[{ name: "title", label: "任务名称", value: editing?.title }, { name: "owner", label: "负责人", value: editing?.owner }, { name: "due", label: "截止日期", value: editing?.due || "2026-10-28" }, { name: "note", label: "任务说明", value: editing?.note }].map(field => <label key={field.name} className="block space-y-2 text-sm"><span>{field.label}</span><Input name={field.name} type={field.name === "due" ? "date" : "text"} defaultValue={field.value} required={field.name !== "note"} maxLength={field.name === "note" ? 200 : 80} className="h-11" /></label>)}
          <Button className="w-full" type="submit">{editing ? "保存任务" : "创建任务"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
