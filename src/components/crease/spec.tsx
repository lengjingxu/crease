import { useState, type ReactNode } from "react";
import { Cat, type CatMood } from "@/components/crease/cat";
import { FigureCard } from "@/components/crease/ui";

const SWATCHES = [
  ["白", "acrylic", "半透亚克力"],
  ["黑", "acrylic-ink", "磨砂半透"],
  ["红", "bg-paper", "细线，不是墙"],
  ["光", "lamp", "弥散光源"],
  ["底", "bg-paper", "日常环境"],
];

const TYPE = [
  ["眉题", "type-kicker", "Kicker · 分区，不承载句子"],
  ["展示", "type-display", "光从后面来。"],
  ["标题", "type-title", "一块卡片的名字"],
  ["正文", "type-body", "要读的话用这个尺寸，行距放开。"],
  ["说明", "type-note", "次要信息、时间、空状态。不和正文抢。"],
];

export function Spec() {
  const [saved, setSaved] = useState(false);
  const [picked, setPicked] = useState("页面");
  const [mood, setMood] = useState<CatMood>("idle");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 lg:px-6">
      <header>
        <p className="type-kicker">Spec</p>
        <h1 className="type-display mt-3">用得上的细节</h1>
        <p className="type-note mt-3 max-w-xl">
          颜色和材质不变。下面是按钮、卡片、文字和状态。红仍然只是细线。
        </p>
      </header>

      <section>
        <h2 className="text-sm font-medium">主题</h2>
        <p className="type-note mt-2">
          没有现成的 shadcn 主题能对上。配置在 src/theme/crease.css，变量名按 shadcn 来。
        </p>
        <ul className="card mt-4 divide-y divide-line p-0 text-sm">
          {[
            ["background", "纯白底"],
            ["foreground / primary", "黑，按钮用这个"],
            ["muted", "说明和次要底"],
            ["signal", "红，只做细线"],
            ["destructive", "仍是黑，不会变成红按钮"],
          ].map(([token, use]) => (
            <li key={token} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="font-medium">{token}</span>
              <span className="type-note">{use}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium">颜色</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SWATCHES.map(([name, tone, role]) => (
            <li key={name} className="card overflow-hidden p-0">
              <div className={`relative h-16 ${tone}`}>
                {name === "红" && (
                  <>
                    <span className="absolute top-1/2 right-3 left-3 h-px bg-signal" />
                    <span className="absolute top-3 right-3 size-1.5 bg-signal" />
                  </>
                )}
              </div>
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{name}</p>
                <p className="type-note text-xs">{role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium">文字</h2>
        <div className="card mt-4 flex flex-col gap-5">
          {TYPE.map(([name, kind, sample]) => (
            <div key={name} className="grid items-baseline gap-2 sm:grid-cols-[5rem_1fr]">
              <p className="type-note">{name}</p>
              <p className={kind}>{sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium">按钮</h2>
        <p className="type-note mt-2">悬停会变深一点，按下再深一档。不可用是同一颗，只是淡掉。没有红色按钮。</p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Label name="主操作">
            <button type="button" className="btn btn-primary">
              添加项目
            </button>
          </Label>
          <Label name="次操作">
            <button type="button" className="btn btn-line">
              返回
            </button>
          </Label>
          <Label name="安静">
            <button type="button" className="btn btn-quiet">
              取消
            </button>
          </Label>
          <Label name="不可用">
            <button type="button" className="btn btn-primary" disabled>
              添加项目
            </button>
          </Label>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium">卡片</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <article className="card">
            <p className="type-kicker">日常</p>
            <h3 className="mt-2 text-lg font-medium">平面白卡</h3>
            <p className="type-note mt-2">列表、表单、说明用这张。不透，不发光，保证能读。</p>
          </article>
          <article className="acrylic p-4">
            <p className="type-kicker">亮点</p>
            <h3 className="type-title mt-2">白亚克力</h3>
            <p className="type-note mt-2">半透，边缘有一层薄光。只在首屏和需要被记住的地方。</p>
          </article>
          <article className="acrylic-ink relative overflow-hidden p-4">
            <div className="lamp pointer-events-none absolute -top-6 right-4 size-16" />
            <p className="type-kicker text-paper/60">亮点</p>
            <h3 className="type-title relative mt-2">黑亚克力</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-paper/90">
              黑也是磨砂的。能看见后面一点，顶上有一层薄光。
            </p>
            <div className="ember relative mt-4 h-px bg-signal" />
          </article>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium">度量</h2>
        <ul className="card mt-4 grid gap-3 p-4 text-sm sm:grid-cols-4">
          {[
            ["4", "图标和红点"],
            ["8", "控件圆角、紧间距"],
            ["16", "卡片圆角、栏间距"],
            ["24", "区块之间"],
          ].map(([size, use]) => (
            <li key={size}>
              <p className="font-display text-3xl leading-none">{size}</p>
              <p className="type-note mt-2">{use}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium">图片卡片</h2>
        <p className="type-note mt-2">
          默认 16:10。图在上，说明在下。字不压在图上，除非托在黑亚克力上。红不铺进画面。
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <FigureCard kicker="平面" title="白天的体块" body="说明跟在图下面，保持能读。" plate="field" />
          <FigureCard tone="acrylic" kicker="白亚克力" title="透出一层边" body="框是半透的，图本身不发虚。" plate="mass" />
          <FigureCard tone="ink" kicker="黑亚克力" title="字可以压在这里" plate="cut" />
        </div>
        <div className="card mt-4 border-dashed px-4 py-8 text-center">
          <p className="text-sm font-medium">还没有图片</p>
          <p className="type-note mt-1">缺图只留这一句。不放假图，也不铺红。</p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium">状态</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="card flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="chip" onClick={() => setSaved((value) => !value)}>
                <span className={`size-1.5 ${saved ? "bg-signal" : "bg-ink"}`} />
                {saved ? "已记下" : "就绪"}
              </button>
              <span className="type-note">点一下，红点只在记下之后出现。</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-line">
              {["页面", "组件", "系统"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPicked(item)}
                  className={
                    picked === item
                      ? "flex w-full items-center justify-between border-l border-signal px-4 py-3 text-left text-sm font-medium"
                      : "flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-paper-2"
                  }
                >
                  <span>{item}</span>
                  <span className="type-note">{picked === item ? "选中" : "未选"}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card flex flex-col gap-4">
            <label className="text-sm font-medium" htmlFor="spec-live">
              输入 · 焦点
              <input id="spec-live" className="field mt-2" placeholder="点这里，边会变成黑" />
            </label>
            <label className="text-sm font-medium" htmlFor="spec-bad">
              输入 · 无效
              <input id="spec-bad" className="field field-invalid mt-2" defaultValue="" placeholder="名字还空着" readOnly />
              <span className="type-note mt-2 block">缺一句话。红只在底边，字不变红。</span>
            </label>
            <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center type-note">
              空状态。没有图形，只有这一句。
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium">猫</h2>
        <p className="type-note mt-2">极简圆头。没有嘴，耳朵很弱。点一个状态，眼睛会换。</p>
        <div className="card mt-4 flex flex-wrap items-end gap-6">
          <Cat mood={mood} className="size-20" />
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["idle", "闲着"],
                ["look", "在看"],
                ["curious", "好奇"],
                ["happy", "高兴"],
                ["sleepy", "困了"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMood(id)}
                className={mood === id ? "btn btn-primary" : "btn btn-quiet"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Label({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="type-note">{name}</span>
      {children}
    </div>
  );
}
