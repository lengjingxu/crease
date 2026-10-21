export type Kind = "页面" | "组件" | "系统";

export type Project = {
  id: string;
  title: string;
  kind: Kind;
  note: string;
  updated: string;
};

export const KINDS: Kind[] = ["页面", "组件", "系统"];

export const SEED: Project[] = [
  {
    id: "home-stage",
    title: "首页舞台",
    kind: "页面",
    note: "大标题和几何只留在首屏。往下滚动就回到可阅读的正文。",
    updated: "今天",
  },
  {
    id: "project-list",
    title: "项目列表",
    kind: "组件",
    note: "列表、搜索、新建保持安静。一次只有一个主按钮。",
    updated: "昨天",
  },
  {
    id: "color-spec",
    title: "色板规范",
    kind: "系统",
    note: "红是细线。亚克力只出现在亮点。按钮保持黑色。",
    updated: "周一",
  },
];

const KEY = "crease-projects-v1";

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return SEED;
    const projects = data.filter(isProject);
    return projects.length > 0 ? projects : SEED;
  } catch {
    return SEED;
  }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(KEY, JSON.stringify(projects));
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    (row.kind === "页面" || row.kind === "组件" || row.kind === "系统") &&
    typeof row.note === "string" &&
    typeof row.updated === "string"
  );
}
