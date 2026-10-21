import { useState } from "react";
import { Mark } from "@/components/crease/mark";
import { Overview } from "@/components/crease/overview";
import { Spec } from "@/components/crease/spec";
import { StageView } from "@/components/crease/stage";
import { Templates } from "@/components/crease/templates";
import { WorkBench } from "@/components/crease/work";

const VIEWS = [
  { id: "overview", label: "总览" },
  { id: "work", label: "日常" },
  { id: "stage", label: "亮点" },
  { id: "templates", label: "模板" },
  { id: "spec", label: "规范" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export function CreaseApp() {
  const [view, setView] = useState<ViewId>("overview");

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="veil sticky top-0 z-20 border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
          <button
            type="button"
            onClick={() => setView("overview")}
            className="flex h-11 items-center gap-2 pr-2"
          >
            <Mark />
            <span className="font-medium tracking-tight">CREASE</span>
          </button>
          <nav className="flex flex-1 gap-1" aria-label="章节">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={
                  view === item.id
                    ? "btn btn-primary"
                    : "btn btn-quiet border-transparent"
                }
                aria-current={view === item.id ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {view === "overview" && (
        <Overview onWork={() => setView("work")} onStage={() => setView("stage")} />
      )}
      {view === "work" && <WorkBench />}
      {view === "stage" && <StageView onWork={() => setView("work")} />}
      {view === "templates" && <Templates />}
      {view === "spec" && <Spec />}
    </div>
  );
}
