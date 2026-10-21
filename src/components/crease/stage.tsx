import { StageArt } from "@/components/crease/mark";

export function StageView({ onWork }: { onWork: () => void }) {
  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:px-6 lg:py-20">
          <div>
            <p className="text-xs font-medium tracking-kicker text-mute uppercase">Stage</p>
            <h1 className="mt-4 font-display text-6xl leading-display tracking-display sm:text-7xl">
              亚克力。
              <br />
              一根红线。
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-mute">
              白亚克力和黑亚克力叠在浅底上。红只是一根细线或一颗点，不铺成墙。按钮仍然是黑的。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onWork}
                className="btn btn-primary"
              >
                回到日常
              </button>
              <span className="btn btn-line">红不进按钮</span>
            </div>
          </div>
          <StageArt />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-3 lg:px-6">
        {[
          ["首屏", "亚克力可以很大。红线从上面切过，不占满一块颜色。标题留在另一栏。"],
          ["空状态", "没有内容时，留一块黑亚克力和一根红线。筛选为空只留一句黑字。"],
          ["正文", "亮点结束就回到浅底。列表和输入不再出现亚克力和红线。"],
        ].map(([title, body]) => (
          <article key={title}>
            <h2 className="font-display text-3xl leading-tight">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}