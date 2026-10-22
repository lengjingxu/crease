import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/syne/latin-600.css";
import "../src/theme/crease.css";

function ThemeExample() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [projects, setProjects] = useState(["城市空间研究", "产品体验升级"]);
  const [notice, setNotice] = useState("");
  return (
    <main className="crease-canvas min-h-dvh px-4 py-6 sm:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between gap-4 border-b pb-5">
          <a href="/" className="font-display text-xl font-semibold tracking-widest">CREASE<span className="text-primary">.</span></a>
          <Button variant="outline" className="min-h-11" onClick={() => {
            document.documentElement.classList.toggle("dark", !dark);
            setDark(!dark);
          }}>
            {dark ? <Sun /> : <Moon />}{dark ? "浅色模式" : "深色模式"}
          </Button>
        </header>
        <section className="grid items-end gap-6 py-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <p className="crease-caption tracking-widest">工作空间 / 设计团队</p>
            <h1 className="text-3xl leading-tight font-medium tracking-tight sm:text-5xl">让好想法，清晰发生<span className="text-primary">。</span></h1>
            <p className="crease-body max-w-xl text-muted-foreground">把目标、进度与下一步放在同一个地方，给重要的工作留出空间。</p>
          </div>
          <Button className="min-h-11" onClick={() => setOpen(true)}>新建项目<ArrowUpRight /></Button>
        </section>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <section className="crease-glass min-w-0 rounded-2xl p-6 sm:p-8" aria-labelledby="projects-title">
            <div className="flex items-center justify-between gap-4">
              <h2 id="projects-title" className="text-xl font-medium">进行中的项目</h2>
              <span className="crease-caption">{projects.length} 个项目</span>
            </div>
            <div className="mt-6 divide-y">
              {projects.map((project, i) => (
                <div className="space-y-4 py-5" key={project}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0"><h3 className="break-words text-base font-medium">{project}</h3><p className="mt-1 text-sm text-muted-foreground">{i < 2 ? "设计交付 · 团队协作" : "等待安排 · 新项目"}</p></div>
                    <span className="shrink-0 text-sm tabular-nums">{i < 2 ? 72 - i * 30 : 0}%</span>
                  </div>
                  <div role="progressbar" aria-label={project + "进度"} aria-valuenow={i < 2 ? 72 - i * 30 : 0} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-primary" style={{ width: (i < 2 ? 72 - i * 30 : 0) + "%" }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground" role="status">{notice || "示例数据。新建内容仅保存在本次页面中。"}</p>
          </section>
          <aside className="crease-ink flex flex-col justify-between gap-8 rounded-2xl p-6 sm:p-8">
            <div><p className="text-sm text-muted-foreground">本周专注时间</p><p className="mt-4 text-5xl tracking-tight tabular-nums">24.5 <span className="text-base text-muted-foreground">小时</span></p></div>
            <div className="space-y-4"><span className="inline-block h-1 w-12 bg-primary" /><h2 className="text-xl">下一步，保持专注。</h2><p className="text-sm leading-7 text-muted-foreground">明确一个目标，完成一件重要的事。让信息层级和阅读节奏服务于行动。</p></div>
          </aside>
        </div>
        <footer className="flex flex-wrap justify-between gap-3 pb-6 text-xs text-muted-foreground"><span>白色场域 · 玻璃透光 · 深黑亚克力 · 信号红</span><a href="/#system" className="underline underline-offset-4">查看设计规范</a></footer>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>新建项目</DialogTitle><DialogDescription>为下一件重要的事起个名字。此操作只更新本地示例。</DialogDescription></DialogHeader>
          <form className="space-y-5" onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) { setError("请输入项目名称。"); return; }
            if (projects.includes(name.trim())) { setError("这个项目名称已存在。"); return; }
            setProjects([...projects, name.trim()]);
            setNotice("已创建项目：" + name.trim());
            setName(""); setError(""); setOpen(false);
          }}>
            <div className="space-y-2"><label htmlFor="project-name" className="text-sm font-medium">项目名称</label><Input id="project-name" value={name} onChange={event => {setName(event.target.value); setError("");}} maxLength={40} aria-invalid={!!error} aria-describedby={error ? "name-error" : undefined} className="min-h-11" placeholder="例如：品牌官网改版" />{error && <p id="name-error" role="alert" className="text-sm text-destructive">{error}</p>}</div>
            <Button type="submit" className="min-h-11 w-full">创建项目</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<ThemeExample />);
