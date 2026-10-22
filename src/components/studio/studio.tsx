import {
  FinanceReference,
  TravelReference,
  PeopleReference,
} from "./references";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CircleHelp,
  Layers,
  MapPin,
  Users,
  Wallet,
  Check,
  ArrowLeft,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreaseApp } from "@/components/crease/app";
import { Mark } from "@/components/crease/mark";
import { cn } from "@/lib/utils";

const pages = [
  { id: "finance", label: "财务概览", en: "财务", icon: Wallet },
  { id: "travel", label: "探索旅程", en: "旅行", icon: MapPin },
  { id: "people", label: "团队空间", en: "成员", icon: Users },
  { id: "system", label: "设计语言", en: "设计语言", icon: Layers },
];
function Panel({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel", className)}>
      <div className="panel-heading">
        <h2>{title}</h2>
        {meta}
      </div>
      {children}
    </section>
  );
}
function Kicker({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
export function Studio() {
  const [page, setPage] = useState(() => location.hash.slice(1) || "finance");
  const [about, setAbout] = useState(false);
  useEffect(() => {
    const update = () => setPage(location.hash.slice(1) || "finance");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  if (page === "original")
    return (
      <>
        <a className="return-studio" href="#finance">
          <ArrowLeft size={16} /> 返回新主题
        </a>
        <CreaseApp />
      </>
    );
  return (
    <div className="studio reference-studio">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        跳至内容
      </a>
      <div className="study-toolbar">
        <a href="#finance" className="study-brand">
          <Mark /> CREASE <span>/ 参考设计研究</span>
        </a>
        <nav aria-label="参考页面">
          {pages.map((p, i) => (
            <a
              key={p.id}
              href={"#" + p.id}
              aria-current={page === p.id ? "page" : undefined}
            >
              <span>0{i + 1}</span>
              {p.label}
            </a>
          ))}
        </nav>
        <button onClick={() => setAbout(true)} aria-label="关于主题">
          <CircleHelp size={17} />
        </button>
      </div>
      <div className="main-shell">
        <main id="main" tabIndex={-1} className="page-content" key={page}>
          {page === "finance" ? (
            <FinanceReference />
          ) : page === "travel" ? (
            <TravelReference />
          ) : page === "people" ? (
            <PeopleReference />
          ) : page === "system" ? (
            <DesignSystem />
          ) : (
            <div className="empty-state">
              <h1>未找到参考页面</h1>
              <a href="#finance">返回财务概览</a>
            </div>
          )}
        </main>
        <footer className="site-footer">
          <span>
            <i /> CREASE — 方向，始终清晰。
          </span>
          <span>
            <a href="#original">原主题存档 ↗</a> · 示例数据{" "}
            <span className="footer-number">© 2026</span>
          </span>
        </footer>
      </div>
      <Dialog open={about} onOpenChange={setAbout}>
        <DialogContent className="studio-dialog">
          <DialogHeader>
            <DialogTitle>关于 CREASE / 参考设计</DialogTitle>
            <DialogDescription>
              保留参考稿的构图与细节，以白、黑亚克力和红色细线转译配色。
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-7">
            三份参考稿、图像细节分析与素材来源记录在
            design/DIRECTION.md。图像与原稿品牌仅用于设计研究。交易、行程和团队数据均为演示，未连接外部服务，刷新后恢复初始状态。
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Heading({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <Kicker>{kicker}</Kicker>
        <h1>
          {title}
          <span className="title-period">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
function DesignSystem() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        ":root { --background: #ffffff; --foreground: #0a0a0c; --primary: #0a0a0c; --signal: #d31218; --radius: 0.5rem; }",
      );
      setCopied(true);
      setError("");
    } catch {
      setError("剪贴板不可用，请从 src/theme/crease.css 复制变量。");
    }
  }
  return (
    <>
      <Heading
        kicker="CREASE / 第二版"
        title="清晰，自成风格"
        description="白是场域，黑是重量，红是方向。让材质服务于信息。"
      >
        <Button variant="outline" onClick={copy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
          {copied ? "已复制变量" : "复制核心变量"}
        </Button>
      </Heading>
      {error && <p role="alert">{error}</p>}
      <div className="system-hero">
        <div>
          <Kicker>少一点干扰，多一分清晰。</Kicker>
          <h2>
            白色，是场域。
            <br />
            黑色，是重量。
            <br />
            <span>红色，是方向。</span>
          </h2>
          <p>从建筑里的光与秩序，到屏幕上的每一次选择。</p>
        </div>
        <div
          className="material-study"
          aria-label="透明玻璃、黑色亚克力与红色细线的材质组合"
        >
          <div className="study-base" />
          <div className="study-glass" />
          <div className="study-black dark-glass">
            <span>
              CREASE
              <br />
              材质研究 02
            </span>
          </div>
          <div className="study-line" />
          <span className="study-caption">折射 / 02</span>
        </div>
      </div>
      <div className="system-grid">
        <Panel title="01 / 色彩即秩序">
          <div className="swatches">
            {[
              ["#ffffff", "场域", "白色场域"],
              ["#0a0a0c", "体块", "近黑体块"],
              ["#d31218", "引导", "红色细线"],
            ].map(([color, name, label]) => (
              <div key={name}>
                <i style={{ background: color }} />
                <strong>{name}</strong>
                <small>{color}</small>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="02 / 字体有分寸">
          <div className="type-spec">
            <span>Aa</span>
            <div>
              <strong>Syne / Outfit</strong>
              <p>标题有性格，正文保持安静。</p>
              <small>44 / 32 / 20 / 14 / 12</small>
            </div>
          </div>
          <div className="type-sample">
            128,450.00 <small>数字，清楚地说话。</small>
          </div>
        </Panel>
        <Panel title="03 / 交互有回响">
          <div className="button-spec">
            <Button onClick={() => (location.hash = "finance")}>
              主要操作
              <ArrowUpRight size={15} />
            </Button>
            <Button
              variant="outline"
              onClick={() => (location.hash = "travel")}
            >
              次要操作
            </Button>
            <Button disabled>不可用</Button>
          </div>
          <p className="spec-note">
            黑色承载行动。细线表达选中。
            <br />
            键盘焦点、按压反馈与减少动态效果同样重要。
          </p>
        </Panel>
        <Panel title="04 / 同一语言，不同场景">
          <div className="reference-links">
            {pages.slice(0, 3).map((p) => (
              <a key={p.id} href={"#" + p.id}>
                <span>
                  <p.icon size={18} />
                  {p.label}
                </span>
                <ArrowUpRight size={17} />
              </a>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
