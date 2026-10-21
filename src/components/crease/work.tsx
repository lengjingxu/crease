import { useEffect, useMemo, useState } from "react";
import { Cat, type CatMood } from "@/components/crease/cat";
import { KINDS, SEED, loadProjects, saveProjects, type Kind, type Project } from "@/lib/crease-data";

export function WorkBench() {
  const [projects, setProjects] = useState<Project[]>(SEED);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState(SEED[0].id);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<Kind | "全部">("全部");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftKind, setDraftKind] = useState<Kind>("页面");
  const [pulse, setPulse] = useState<"idle" | "saved">("idle");
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    setSelectedId(loaded[0]?.id ?? "");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProjects(projects);
  }, [projects, hydrated]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const kindOk = kindFilter === "全部" || project.kind === kindFilter;
      const text = `${project.title} ${project.note}`.toLowerCase();
      return kindOk && (!q || text.includes(q));
    });
  }, [projects, query, kindFilter]);

  const selected = projects.find((project) => project.id === selectedId) ?? visible[0] ?? null;

  function flash() {
    setPulse("saved");
    window.setTimeout(() => setPulse("idle"), 1200);
  }

  function addProject() {
    const title = draftTitle.trim();
    if (!title) return;
    const project: Project = {
      id: crypto.randomUUID(),
      title,
      kind: draftKind,
      note: "",
      updated: "刚刚",
    };
    setProjects((current) => [project, ...current]);
    setSelectedId(project.id);
    setDraftTitle("");
    setKindFilter("全部");
    setQuery("");
    flash();
  }

  function patch(id: string, next: Partial<Project>) {
    setProjects((current) =>
      current.map((project) =>
        project.id === id ? { ...project, ...next, updated: "刚刚" } : project,
      ),
    );
  }

  function remove(id: string) {
    setProjects((current) => {
      const next = current.filter((project) => project.id !== id);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
    flash();
  }

  const mood: CatMood = pulse === "saved" ? "happy" : writing || draftTitle ? "look" : query ? "curious" : "idle";

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[16rem_1fr] lg:px-6 lg:py-8">
      <aside className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium tracking-kicker text-mute uppercase">Work</p>
            <Cat mood={mood} className="mt-2 size-14" />
          </div>
          <Status pulse={pulse} />
        </div>
        <form
          className="card flex flex-col gap-3 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            addProject();
          }}
        >
          <label className="text-sm font-medium" htmlFor="new-title">
            新建
          </label>
          <input
            id="new-title"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onFocus={() => setWriting(true)}
            onBlur={() => setWriting(false)}
            placeholder="给它一个名字"
            className="field"
          />
          <div className="grid grid-cols-3 gap-1" role="group" aria-label="类型">
            {KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setDraftKind(kind)}
                className={
                  draftKind === kind
                    ? "btn btn-primary h-11 px-2"
                    : "btn btn-quiet h-11 px-2"
                }
              >
                {kind}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!draftTitle.trim()}
            className="btn btn-primary w-full"
          >
            添加项目
          </button>
        </form>
        <p className="text-sm leading-relaxed text-mute">
          搜索、筛选、编辑都停在这一层。没有图形叠在文字上。
        </p>
      </aside>

      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="search">
            搜索项目
          </label>
          <input
            id="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题或备注"
            className="field min-w-0 flex-1"
          />
          <div className="grid grid-cols-4 gap-1" role="group" aria-label="筛选类型">
            {(["全部", ...KINDS] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setKindFilter(kind)}
                className={
                  kindFilter === kind
                    ? "btn btn-primary px-2"
                    : "btn btn-quiet px-2"
                }
              >
                {kind}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <ul className="card divide-y divide-line overflow-hidden p-0">
            {visible.length === 0 ? (
              <li className="px-4 py-10 text-sm text-mute">
                没有匹配的项目。
                <button type="button" className="ml-2 font-medium text-ink" onClick={() => { setQuery(""); setKindFilter("全部"); }}>
                  清除筛选
                </button>
              </li>
            ) : (
              visible.map((project) => {
                const active = project.id === selected?.id;
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(project.id)}
                      className={
                        active
                          ? "flex w-full items-center gap-3 border-l border-signal px-4 py-3 text-left"
                          : "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-2"
                      }
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{project.title}</span>
                        <span className="block truncate text-sm text-mute">
                          {project.note || "还没有备注"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-mute">{project.kind}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {selected ? (
            <form
              className="card flex flex-col gap-3"
              onSubmit={(event) => event.preventDefault()}
            >
              <p className="text-xs text-mute">编辑 · {selected.updated}</p>
              <label className="text-sm font-medium" htmlFor="edit-title">
                标题
              </label>
              <input
                id="edit-title"
                value={selected.title}
                onChange={(event) => patch(selected.id, { title: event.target.value })}
                className="field"
              />
              <label className="text-sm font-medium" htmlFor="edit-note">
                备注
              </label>
              <textarea
                id="edit-note"
                value={selected.note}
                onChange={(event) => patch(selected.id, { note: event.target.value })}
                rows={5}
                className="field h-auto resize-none py-2"
              />
              <button
                type="button"
                onClick={() => remove(selected.id)}
                className="btn btn-quiet"
              >
                删除这条
              </button>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed border-line p-4 text-sm text-mute">
              还没有项目。从左侧添加第一条。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Status({ pulse }: { pulse: "idle" | "saved" }) {
  const saved = pulse === "saved";
  return (
    <span className="chip">
      <span className={`size-2 ${saved ? "bg-signal" : "bg-ink"}`} />
      {saved ? "已记下" : "就绪"}
    </span>
  );
}
