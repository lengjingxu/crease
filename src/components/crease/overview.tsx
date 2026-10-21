import { Cat } from "@/components/crease/cat";
import { StageArt } from "@/components/crease/mark";

const RULES = [
  {
    name: "白",
    en: "Field",
    body: "环境保持浅色。列表和表单不上大色块，句子停在能读的白上。",
  },
  {
    name: "亚克力",
    en: "Acrylic",
    body: "白是半透的，黑也是半透的。边缘有一层薄光，底下是柔和的影子。",
  },
  {
    name: "光",
    en: "Light",
    body: "红只做细线、红点和切口。不成墙，不做按钮。灯是散开的白。",
  },
];

export function Overview({
  onWork,
  onStage,
}: {
  onWork: () => void;
  onStage: () => void;
}) {
  return (
    <div>
      <section className="hero border-b border-line">
        <div className="mx-auto grid max-w-6xl items-end gap-10 px-4 py-12 lg:grid-cols-12 lg:px-6 lg:py-16">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-kicker text-mute uppercase">Crease</p>
            <h1 className="title-cut mt-4 font-display text-6xl leading-display tracking-display sm:text-7xl">
              红是细线。
              <br />
              <span className="text-mute">光是散的。</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-mute">
              日常仍是浅底、黑按钮。亮点用白亚克力和黑亚克力。红只切一条线，不铺开。
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-5">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={onWork} className="btn btn-primary">
                  试用日常
                </button>
                <button type="button" onClick={onStage} className="btn btn-line">
                  看亚克力
                </button>
              </div>
              <Cat className="size-16" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <StageArt className="min-h-64" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 lg:grid-cols-3 lg:px-6">
        {RULES.map((rule) => (
          <article key={rule.en} className="card p-5">
            <p className="text-xs font-medium tracking-kicker text-mute uppercase">{rule.en}</p>
            <h2 className="title-cut mt-3 font-display text-3xl">{rule.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">{rule.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 lg:grid-cols-2 lg:px-6">
        <article className="rounded-lg border border-line bg-paper p-5">
          <p className="text-xs font-medium tracking-kicker text-mute uppercase">Field</p>
          <h3 className="mt-2 text-lg font-medium">项目</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
            {[
              ["首页舞台", "页面"],
              ["项目列表", "组件"],
              ["色板规范", "系统"],
            ].map(([title, kind]) => (
              <li key={title} className="flex items-center justify-between py-3">
                <span>{title}</span>
                <span className="text-mute">{kind}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onWork}
            className="btn btn-primary mt-4"
          >
            打开这个列表
          </button>
        </article>

        <article className="acrylic-ink relative overflow-hidden p-5">
          <div className="lamp pointer-events-none absolute -top-6 right-8 size-16" />
          <p className="text-xs font-medium tracking-kicker text-paper/60 uppercase">Line</p>
          <h3 className="relative mt-6 max-w-xs font-display text-5xl leading-display tracking-display">
            红不铺开。
          </h3>
          <p className="relative mt-4 max-w-xs text-sm leading-relaxed text-paper/75">
            黑亚克力托住句子。红是一条细线。按钮仍然是黑的。
          </p>
          <span className="ember absolute right-6 bottom-6 left-6 h-px bg-signal" />
        </article>
      </section>
    </div>
  );
}