# CREASE 设计标准 · 1.0

这是新项目的设计与实现约束。**先读本文，再使用 [src/theme/crease.css](src/theme/crease.css)，最后对照 [独立示例](examples/theme.tsx) 验收。** 主题定义视觉语言，不代替业务信息架构、版式设计和交互设计；加载文件不等于自动达到成稿质量。

## 交付物与适用范围

| 文件 | 用途 |
| --- | --- |
| src/theme/crease.css | 唯一可迁移主题入口：Tailwind v4、shadcn 完整语义变量、浅/深色、字体栈、圆角、玻璃与环境光工具类 |
| examples/theme.tsx | 不依赖参考页 CSS、图片或业务数据的 React + shadcn 示例；可复制到新项目修改 |
| examples/theme.html | 独立入口，运行后访问 /examples/theme.html |
| design.md | 新项目的设计规则、实现流程和验收标准 |
| design/DIRECTION.md | 本次三张参考稿的分析、来源与取舍，属于研究档案 |

可迁移栈：React、TypeScript、Tailwind CSS **v4**、shadcn/ui。crease.css 含 Tailwind 指令，必须经过 Tailwind 构建，不可作为普通 CSS 用 link 直接加载。不要混用 v3 的 @tailwind 指令或 HSL 三元组变量写法。

src/styles.css、src/theme/references.css、src/theme/studio.css 是本仓库的历史页面与展示布局，**不是新项目必须复制的文件**。不要把几千行参考页 CSS 当作通用组件库。

## 视觉方向

白色是场域，玻璃提供空间层次，深黑形成重量，红色标记行动。冰蓝只作为底层环境照明。沿用 Mirror’s Edge 的冷白建筑感、清晰路径与强对比，而不是游戏贴图、霓虹 HUD 或赛博界面。

- 页面以白色留白为主，黑色集中在有意义的重点模块。
- 红色必须可见：主行动、当前选项、关键进度/数据。不能退回只剩发丝线与小点。
- 冰蓝光放在画布下层，透过透明玻璃；不能把正文、按钮和每张卡都染成蓝色。
- 内容先于装饰。照片、图表、不同密度的模块构成节奏，不要把所有页面做成等宽等高的卡片墙。
- 用真实中文文案与信息密度设计；禁止用超小字号把内容强塞进原稿比例。

## 语义颜色

使用 bg-background、text-foreground、text-muted-foreground、bg-primary 等语义工具类，禁止在业务组件里重新定义一套近似颜色。

| 语义 | 浅色值 | 用法 |
| --- | --- | --- |
| background / foreground | #ffffff / #0a0a0c | 页面与正文 |
| muted-foreground | #555b63 | 标签、说明、时间，不通过降低父元素 opacity 模拟 |
| primary / primary-foreground | #d31218 / #ffffff | 主要行动，shadcn 默认 Button 自动采用 |
| accent / accent-foreground | #fceced / #a00d12 | 低权重选中区域与悬停 |
| destructive | #b60f16 | 错误与破坏性动作；必须同时有文字/图标，不能仅凭红色区分 |
| input / border | #89919b / #dce1e6 | 可交互输入边界 / 非交互分隔线 |
| ring | #d31218 | 键盘焦点 |
| chart-1…5 | 红、近黑及中性阶调 | 类别配合标签、线型或纹理，不能只靠颜色 |

深色错误文字使用更亮的 #ff777d，与 destructive-foreground 的近黑色配对。链接文字使用 text-accent-foreground，品牌 text-primary 不用于深色背景上的小字。

主题包含标准 shadcn card、popover、secondary、muted、sidebar 与 chart 变量及 Tailwind 映射。--signal 是品牌红，不是错误状态的唯一表达。

### 深色模式与黑色材质是两件事

全局深色模式把 dark class 放在 **html** 上，使 Dialog 等 portal 内的内容也继承主题。不要只把 dark 放在页面局部包裹层。

白色页面中的黑卡使用 crease-ink，不需要切换全局模式。它把内部正文与次级文字分别设为白色和 #c5cad2，并提供可读的浅红链接与悬停色，但不会重写所有嵌套组件语义；深色卡上的表单建议使用语义完整的 dark 区域，或把表单放在 Dialog 中。

## 材质：先有下层，再有玻璃

结构：crease-canvas 画布 → 半透明 crease-glass → 正文与控件。

| 工具类 | 物理含义 | 规则 |
| --- | --- | --- |
| crease-canvas | 白场、右上冰蓝光、局部红反射 | 放在页面/主要工作区底层，每个视口只需一个主光场 |
| crease-glass | 白色约 40%–74% 透明度、22px 背景模糊、边缘高光、接触阴影 | 配合 rounded-2xl p-6，不再加不透明 bg-gray-* 或重阴影 |
| crease-ink | 近黑亚克力、24px 模糊、微弱边缘反光 | 中心保持深黑，不能用大面积亮灰渐变模拟反光 |

材料工具类不包含宽高、圆角和 padding，让布局按场景决定。高频滚动列表只在外层使用一次玻璃，避免每行都创建 backdrop blur。模糊不能抹到内容层：禁止对卡片本身使用 filter: blur()。

调光只改 --crease-ambient；材质只改 --crease-glass、--crease-ink、--crease-glass-shadow 等主题变量。不要每页复制新渐变。浅/深模式分别有环境光与玻璃参数。

## 字体与阅读

- 拉丁正文/数字：Outfit 400/500。拉丁品牌标题：Syne 600。中文使用 PingFang SC / Microsoft YaHei 等系统中文字体；Outfit 与 Syne 不提供中文字形。
- 正文段落：16px / 1.7（crease-body）。密集界面的普通文案、控件、表格：14px / 至少 1.5（text-sm leading-6）。
- 次级说明与图表刻度：**不得低于 12px**（crease-caption / text-xs），重要操作不能用 12px。
- 主标题 32–48px，章节 20–24px，卡片标题 16–20px。手机标题相应减小，但不压缩正文。
- 普通正文至少 4.5:1，大字和有意义的图形边界至少 3:1；玻璃按实际合成背景检查，不能只检查纯白底色值。
- 深黑卡上的正文保持白色，说明用浅灰。不要给整个已完成行加低 opacity 让文字消失；用复选框、删除线与标签表达状态。
- 输入框在手机上采用 16px 字号，避免浏览器自动缩放；触控目标至少 44px。

## 布局与信息密度

使用 4px 间距基准。页面内边距桌面 32–40px、手机 16px；主要模块 gap 20–24px；卡片 padding 24–32px，紧凑行内 12–16px。正文最大行宽约 60–70 个拉丁字符，不把说明铺满超宽画布。

每页先确定一个主任务，再分配主/次信息区。例如：财务以余额与趋势为主；旅行以目的地与行程为主；团队以进度与任务为主。保持三个层级：页面标题 → 区域标题 → 数据与说明。

桌面用 12 栏或主次区约 1.6:1。不是所有屏幕都维持同样列数：内容开始挤压时折叠为单列。320px 不能有页面级横向滚动；数据表可在明确的局部容器横向滚动。不要依靠 overflow:hidden 掩盖文字溢出。

圆角由 --radius 推导：控件约 8–12px，内容卡 20–28px，主画布 40px。不要所有元素都用同一个超大圆角。金额使用等宽数字，单位与说明必须可读。

## shadcn 组件约定

| 组件 | 使用方式 |
| --- | --- |
| Button | 默认 variant 为红底白字主行动；次要操作用 outline，轻操作用 ghost。一组操作只突出一个主按钮。触控加 min-h-11。 |
| Input | 使用可见 label；placeholder 不能替代 label；错误在字段下方，配合 aria-invalid、aria-describedby。 |
| Card / section | 普通容器用 card 语义；玻璃额外加 crease-glass rounded-2xl p-6。仅替换 shadcn 颜色变量不会自动生成玻璃。 |
| Dialog | 保留 Radix 的焦点圈定、Escape 和焦点返回；背景使用不透明 popover/background 保证阅读，禁止透明叠透明。 |
| Tabs / Navigation | 选中状态有明确文字对比、底色或底边，不仅靠几乎不可见的红点；支持键盘。 |
| 图表 | 只突出关键系列/当前数据；标明单位、时间范围、空状态。浅蓝环境光不能作为数据语义。 |

交互反馈 150–200ms，优先 opacity/transform；尊重 reduced-motion。需要 loading、empty、error、disabled 时必须设计真实状态，不能写死永远成功的界面。图标按钮必须有中文 accessible name。

## 新项目接入

### 1. 准备工程

建立 React + TypeScript 工程，接入 Tailwind v4。Vite 使用 @tailwindcss/vite 插件；其他框架按 Tailwind v4 官方方式配置。安装：

~~~sh
npm install tailwindcss tw-animate-css @fontsource/outfit @fontsource/syne
npm install -D @tailwindcss/vite
npx shadcn@latest init
npx shadcn@latest add button input dialog
~~~

先初始化 shadcn，再复制主题，避免初始化覆盖主题。按目标框架选择 shadcn 配置与 @/ 别名。本仓库使用 radix-ui，新生成的 shadcn 组件以其实际依赖为准，不要为了复制示例改掉已有组件实现。

若生成的 Button default/icon 尺寸不足 44px，分别改为 h-11 / size-11；紧凑 sm/xs 只用于非触控的辅助场景，移动端仍应扩大触控区域。

若生成的 Button destructive variant 写死了 text-white，改为 text-destructive-foreground，并移除 dark:bg-destructive/60；link variant 使用 text-accent-foreground。本仓库的 Button 已完成这两项适配，确保深色错误状态与链接对比度。

### 2. 复制并导入唯一入口

从本仓库复制 src/theme/crease.css 到目标工程相同目录。入口 CSS 只需：

~~~css
@import "./theme/crease.css";
/* 项目自身的布局样式写在这里。 */
~~~

主题已导入 Tailwind 与 tw-animate-css，不要再次重复导入，也不要保留 shadcn init 生成的第二套 :root / .dark / @theme inline 颜色定义。把 components.json 的 tailwind.css 指向入口 CSS（如果直接导入 crease.css，则指向 crease.css）。

应用入口导入字体及 CSS：

~~~tsx
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/syne/latin-600.css";
import "./styles.css";
~~~

Tailwind 默认扫描项目源码。把组件放在工程源码目录内；若从外部包加载组件，在入口 CSS 用 @source 显式登记该包源码目录。

### 3. 先跑最小材质组合

~~~tsx
import { Button } from "@/components/ui/button";

export function Overview() {
  return (
    <main className="crease-canvas min-h-dvh p-4 sm:p-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="crease-glass rounded-2xl p-6 sm:p-8">
          <h1 className="text-3xl font-medium">项目概览</h1>
          <p className="crease-body mt-4 text-muted-foreground">让目标、进度与下一步清楚可见。</p>
          <Button className="mt-6 min-h-11">创建项目</Button>
        </section>
        <aside className="crease-ink rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl">本周目标</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">深色材料中的说明保持清楚可读。</p>
        </aside>
      </div>
    </main>
  );
}
~~~

这段只展示材质。完整弹窗、错误状态、项目新增和深浅切换见 examples/theme.tsx。本仓库运行 npm run dev 后打开 /examples/theme.html；生产构建也包含该入口。

### 4. 让未来的 Agent 真正读取规范

把 design.md 放到目标项目根目录，并在项目 AGENTS.md 中明确引用：

~~~md
所有界面工作开始前读取 ./design.md。
使用 src/theme/crease.css 作为唯一主题来源，使用现有 shadcn 组件。
必须在真实内容、手机与桌面视口中验收；不能仅凭代码中存在 token 宣称设计完成。
用户的新反馈优先，同步更新设计规范与主题，避免两者分叉。
~~~

仅把文档放进仓库不会保证所有开发工具自动加载。人类开发者也应把本文列为 PR 的设计验收依据。

## 每个新页面的工作流程

1. 明确主任务、必须显示的信息、真实中文文案及状态。
2. 对照合适的参考页，写出布局比例、视觉重点、模块密度；不要直接复制无关业务结构。
3. 先接主题、字体与 shadcn，再实现一个包含真实信息的主要区域。
4. 以桌面与手机截图检查文字、留白、层级、透明材质和操作重点，再扩展页面。
5. 删除不必要的装饰、模糊层与重复抽象，复测受影响行为。

## 交付验收

任一项不满足，都不能以“主题已加载”替代完成。

- [ ] 在 1440、900、390、320px 下无页面横向溢出，中文不重叠、不被裁切。
- [ ] 常规文字至少 14px，注释至少 12px，段落 16px；浅/深材质上的文字都能读清。
- [ ] 白玻璃透出底层环境光，高光与阴影克制，没有大面积死灰填充。
- [ ] 黑亚克力中心足够深，文字清楚；冰蓝只作照明，红色形成明确行动节奏。
- [ ] 有主次信息结构，不是模板式等尺寸卡片堆叠；内容密度与业务相符。
- [ ] 输入标签、错误说明、焦点、键盘、44px 触控目标、空/加载/错误状态按需完整。
- [ ] 支持深色的项目，在 html.dark 下实际检查背景、图表、表单、Dialog portal，不能只切页面底色。
- [ ] 正常和 reduced-motion 模式都可用，交互不只停留在静态截图。
- [ ] 构建通过；验证本次修改影响的最小行为范围，并保存桌面/手机截图比较。

## 资产与边界

可迁移主题不依赖 Dribbble 原图、人物照片、风车裁图或品牌。这些保留在研究档案，不随新产品复制发布。生产项目使用自己拥有权利的图像与内容。独立示例只有代码、字体依赖、图标与演示数据。

本文件是工作标准，不是“加载后必然达到同等设计质量”的承诺。相同质量来自统一的主题约束、合适的业务版式、真实内容、截图比较和逐项验收。
