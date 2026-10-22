# CREASE 设计标准 · Agent 执行版

更新日期：2026-10-22。

这是本仓库及新项目的设计与实现约束。**先读本文，再使用 [src/theme/crease.css](src/theme/crease.css)，最后对照 [独立示例](examples/theme.tsx) 验收。** 主题定义视觉语言，不代替业务信息架构、版式设计和交互设计；加载文件不等于自动达到成稿质量。

## 接手顺序与当前基线

1. 在本仓库先读 [AGENTS.md](AGENTS.md)，再按本文执行；迁移到新项目时保留本文与 [资产说明](design/ASSETS.md)，把读取要求写入目标项目的 Agent 入口。
2. 以 /examples/library.html 为当前产品模板基线，查看本次要修改的场景；/examples/theme.html 只验证最小主题接入。根入口的参考研究页用于构图与细节比较，不是十个模板的布局壳。
3. 在修改前后用同页面、同视口、同明暗模式、同交互状态作对照；比较动画时暂停到可复现相位。保留本次相关截图与实际行为结果。
4. 参数与实现不一致时，先检查下表对应源码，说明差异并同步修正文档；不要把旧文案当成已实现功能。用户新反馈优先于历史研究档案。

| 本次工作 | 必须核对的实现 | 设计要求所在章节 |
| --- | --- | --- |
| 配色、玻璃、中文排版 | src/theme/crease.css、受影响的组件 | 语义颜色、材质、字体与阅读 |
| 刻字、按钮、表单与弹窗 | crease.css、src/components/ui/ | 控件细节与层次、亚克力刻字 |
| 流光与视差 | kit/workspace-shell.tsx、kit/use-scroll-depth.ts、crease.css | 背景流光；ASSETS.md 的滚动视差 |
| 动态形象 | kit/companion.tsx、kit/companion.css | ASSETS.md 的折光规范 |
| 新业务场景 | src/templates/ 中最接近的模板 | 布局与信息密度；ASSETS.md 的场景构图 |

上表 kit/ 路径均位于 src/components/。目标是保持参考稿级别的构图与细节，沿用 CREASE 配色；不能把“更多页面”或“主题文件已接入”当作质量证据。

## 交付物与适用范围

| 文件 | 用途 |
| --- | --- |
| src/theme/crease.css | 唯一可迁移主题入口：Tailwind v4、shadcn 完整语义变量、浅/深色、字体栈、圆角、玻璃与环境光工具类 |
| examples/theme.tsx | 不依赖参考页 CSS、图片或业务数据的 React + shadcn 示例；可复制到新项目修改 |
| examples/theme.html | 独立入口，运行后访问 /examples/theme.html |
| design.md | 本仓库与新项目的设计规则、实现流程和验收标准 |
| AGENTS.md | 本仓库 Agent 的读取顺序、完成标准与提交流程 |
| design/ASSETS.md | 十个模板、组件 API、复制依赖与动态形象规范 |
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

静态 crease-canvas 的光场由 --crease-ambient / --crease-reflection 控制；WorkspaceShell 的流光由 crease-depth-far / crease-depth-near 的背景及动画控制，不能只改静态变量就声称工作区流光已更新。材质改 --crease-glass、--crease-ink、--crease-glass-shadow 等主题变量，所有改动集中在 crease.css；浅/深模式分别核对。工作区会局部调整白玻璃配方，不能把基础工具类的透明度范围当成所有场景的固定值。

## 背景流光

WorkspaceShell 的冰蓝远光与近层反射单程分别为 22 秒、30 秒，完整往返为 44 秒、60 秒，近层错开 8 秒起始相位。渐变画好后只动画 transform 与 opacity，不逐帧修改模糊半径或触发 React 渲染。光位于正文和玻璃下方，容器裁切溢出且不接收指针事件。

流光 transform 与滚动视差 translate 独立叠加：页面不滚动时也有缓慢光变，滚动仍保留远近层速差。手机延长周期至 28 / 36 秒。工具栏可暂停/恢复流光，暂停保持当前相位；切换模板保留暂停状态。页面隐藏时暂停，回到前台按用户的播放状态恢复。系统启用减少动态效果时显示静态光场，并隐藏流光开关。

复制 CSS 不会创建背景 DOM、工具栏控制或滚动监听。完整接入应复制 WorkspaceShell、use-scroll-depth.ts 及其导入的基础组件；自建布局需显式实现同等结构与行为并验证。仅使用 crease-canvas 是静态主题接入。流光开关、MaterialStudy 的局部光影开关和 Companion 的动画开关各自独立。

视差倍率、位移边界与监听清理要求见 [ASSETS.md 的滚动视差](design/ASSETS.md#滚动视差)。

## 字体与阅读

- 拉丁正文/数字：Outfit 400/500。拉丁品牌标题：Syne 600。中文统一使用自托管 Noto Sans SC Variable（思源黑体字形），由主题 CSS 导入；支持 100–900 连续字重，避免不同设备依赖不同中文字体。Outfit 与 Syne 不提供中文字形。
- 正文段落：16px / 1.85（crease-body）；长文使用 crease-prose，行高 1.9、段间距 1.25em、行宽不超过 38em。密集界面的普通文案、控件、表格：14px / 至少 1.5（text-sm leading-6）。
- 次级说明与图表刻度：**不得低于 12px**（crease-caption / text-xs），重要操作不能用 12px。
- 产品页面主标题采用 crease-title 的 28–36px，章节 20–24px，卡片标题 16–20px；参考研究页的大型展示标题按构图单独验收。手机不压缩正文。
- 普通正文至少 4.5:1，大字和有意义的图形边界至少 3:1；玻璃按实际合成背景检查，不能只检查纯白底色值。
- 深黑卡上的正文保持白色，说明用浅灰。不要给整个已完成行加低 opacity 让文字消失；用复选框、删除线与标签表达状态。
- 输入框在手机上采用 16px 字号，避免浏览器自动缩放；触控目标至少 44px。

### 中文排版角色（直接复用）

| 工具类 | 字号 / 字重 / 行高 | 用途 |
| --- | --- | --- |
| crease-title | 28–36px / 550 / 1.4 | 页面标题，中文自然字宽，0.015em 微字距 |
| crease-heading | 20px / 550 / 1.5 | 区域、文章卡片标题 |
| crease-body | 16px / 400 / 1.85 | 说明与正文 |
| crease-prose | 16px / 400 / 1.9 | 多段中文阅读，自动段间距与合理行宽 |
| crease-label | 14px / 500 / 1.6 | 操作、字段标签 |
| crease-caption | 12px / 400 / 1.75 | 时间、辅助说明 |
| crease-eyebrow | 12px / 500 / 1.75 | 短章节引导，0.1em 字距 |

中文标题禁止套用 tracking-tight/tighter 与 leading-none；不要用细字重或降低透明度制造精致感。普通控件 500、标题 550、正文 400；已选中控件及主按钮的 600 字重按「亚克力刻字」规则使用；字重用真实可变字形，主题关闭合成粗体。段落采用严格中文禁则与自然换行，不手工插空格撑开汉字。数值继续使用 tabular-nums，紧字距仅用于纯数字/拉丁展示。中英文之间按语义留正常空格。

字体随构建自托管，不请求 Google Fonts；常规页面按 unicode-range 加载需要的分片。单文件导出会内嵌完整字体（约增加 6 MB），保证离线预览中文字形一致。组件实验室内有浅色/黑色材质中文样张，可用于后续项目验收。

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

## 控件细节与层次

- 分为三层：玻璃内容面板、轻微内凹的输入框、带边缘反光的操作按钮。输入底色与内阴影由 --crease-control / --crease-control-shadow 控制；深色模式单独定义，不能复用白色高光。
- 输入框、Textarea、Select 共用一个 2px 红色焦点轮廓，不叠加粗光晕。错误保留 destructive 边框，禁用与悬停不能覆盖错误语义。字段标签与输入保持真实 8px 间距。
- Tabs 选中项使用清晰文字、微高光、短红标记；键盘焦点另行保留。未选中文字使用 muted-foreground，禁止把文字 opacity 降到难以阅读。
- 数据表格外层使用 crease-data-table：轻表头、细行分隔，选中行带浅红底与左侧红边。金额列声明 align: "right"，同时作用于列标题、排序按钮及单元格。分页说明当前记录范围。
- Dialog 内容保持不透明以便阅读，边缘与投影负责层级；背景遮罩做 5px 模糊。关闭按钮至少 44px；弹窗高度不超过视口减 32px，内容超出时内部滚动。关闭后焦点返回打开弹窗的控件；自定义 onCloseAutoFocus 可覆盖这一行为。
- 控件反馈限于颜色、阴影、transform，时长 150–180ms；弹窗退出 120ms。仅精细指针开启悬停位移；减少动态效果时取消位移和过渡。Tooltip 首次悬停等待 350ms，避免移动鼠标时不断闪现。

## 亚克力刻字

标题与选中状态使用浅刻字：上缘暗切线、下缘反射光，保留不透明字形和原有语义文字色。它是 CSS text-shadow 的视觉模拟，不是真实三维凹槽。

- crease-title 自动带标题刻字；局部标题可添加 crease-engraved-title，短标签可添加 crease-engraved。工具类只改变文字光影，不修改背景、布局或正文颜色。
- Tabs 选中项、aria-pressed="true" 的 Button 自动添加刻字，字重 600。主按钮与当前导航采用适合红色亚克力的暗红切边；普通标题保持 550。
- 白玻璃、全局 dark、局部 crease-ink 分别继承 --crease-etch / --crease-etch-title。刻字类放在材质容器内部，避免在业务页写死白色高光。
- 控件的光影偏移约 1px，标题最多约 2px；不使用模糊发光、透明文字、粗描边、重复文字图层。正文、说明、未选中控件不叠加刻字。
- 高对比与强制颜色模式关闭文字阴影，保留原有文字与状态标记。组件实验室的「文字与材质」提供浅色玻璃、黑色亚克力的对照样张。


## 新项目接入

### 1. 准备工程

建立 React + TypeScript 工程，接入 Tailwind v4。Vite 使用 @tailwindcss/vite 插件；其他框架按 Tailwind v4 官方方式配置。安装：

~~~sh
npm install tailwindcss tw-animate-css @fontsource-variable/noto-sans-sc @fontsource/outfit @fontsource/syne
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
          <h1 className="crease-title">项目概览</h1>
          <p className="crease-body mt-4 text-muted-foreground">让目标、进度与下一步清楚可见。</p>
          <Button className="mt-6 min-h-11">创建项目</Button>
        </section>
        <aside className="crease-ink rounded-2xl p-6 sm:p-8">
          <h2 className="crease-heading crease-engraved-title">本周目标</h2>
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
所有界面工作开始前读取 ./design.md；复用模板、视差、流光或形象时同时读取 ./design/ASSETS.md 的对应章节。
使用 src/theme/crease.css 作为唯一主题来源，使用现有 shadcn 组件；保留材质、中文排版与动效细节。
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

先确定本次影响范围，再检查对应项目。新增页面或全局主题调整需覆盖 1440、900、390、320px；单一组件细化检查其桌面与最窄可用视口。只有纯文档改动时，检查链接、路径、参数与源码一致性即可。出现故障、跨模块影响或架构调整再扩大测试，不机械重复全套检查。

以下适用项不满足时，不能以“主题已加载”替代完成：

- [ ] 在本次要求的视口下无页面横向溢出，中文不重叠、不被裁切。
- [ ] 常规文字至少 14px，注释至少 12px，段落 16px；浅/深材质上的文字都能读清。
- [ ] 白玻璃透出底层环境光，高光与阴影克制，没有大面积死灰填充。
- [ ] 黑亚克力中心足够深，文字清楚；冰蓝只作照明，红色形成明确行动节奏。
- [ ] 有主次信息结构，不是模板式等尺寸卡片堆叠；内容密度与业务相符。
- [ ] 输入标签、错误说明、焦点、键盘、44px 触控目标、空/加载/错误状态按需完整。
- [ ] 支持深色的项目，在 html.dark 下实际检查背景、图表、表单、Dialog portal，不能只切页面底色。
- [ ] 动效改动须实际播放验证，不能只看截图：流光暂停/恢复稳定，暂停不影响滚动视差；切模板保持暂停选择；后台暂停、回前台恢复遵循用户选择。
- [ ] 刻字改动检查白玻璃、黑亚克力与红色控件；正文和未选中项保持无阴影，高对比模式关闭刻字。
- [ ] 视差不影响原生滚动、点击和 sticky；正常与 reduced-motion 模式均可用，后者为静态光场且清除视差。
- [ ] 形象改动检查相应状态、暂停和 reduced-motion；保留抽象柔性轮廓与两枚极简眼点。
- [ ] 构建通过；验证本次修改影响的最小行为范围，并保存桌面/手机截图比较。

## 资产与边界

可迁移主题不依赖 Dribbble 原图、人物照片、风车裁图或品牌。这些保留在研究档案，不随新产品复制发布。生产项目使用自己拥有权利的图像与内容。独立示例只有代码、字体依赖、图标与演示数据。

本文件是工作标准，不是“加载后必然达到同等设计质量”的承诺。相同质量来自统一的主题约束、合适的业务版式、真实内容、截图比较和逐项验收。

## 扩展资产与页面模板

读取 [design/ASSETS.md](design/ASSETS.md) 获取十个模板、组合组件 API、复制依赖、AI 适配契约和原创动态形象规范。运行 /examples/library.html 查看管理后台、内容中心、AI 对话、设置、组件状态和折光实验室；顶部可查看并复制源码。npm run export:library 导出自包含 HTML 预览。新项目应同时加载本文件与 ASSETS.md，并从最接近业务的模板起步。


### 精细度不可随复用退化

白色玻璃必须能看见下层光与内容的柔化；黑色亚克力用局部反射表达表面，不能整体抬亮为灰色。复用同时保留边缘高光、接触阴影、刻度、图表端点和行动反馈，不能把不同场景统一成卡片墙。以组件库的材质光影实验、数据分析和任务协作作为补充验收样本；详情见 ASSETS.md 的精细度与场景构图章节。
