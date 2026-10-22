# CREASE / Reference studies

白色场域、近黑亚克力、玻璃叠层与红色细线。以三个 Dribbble 稿件为结构基准，保留卡片组合、比例、信息层级与图表细节，转译为 CREASE 原主题配色。界面导航、按钮、说明与弹窗统一使用中文。

## 运行

Node.js 22+。

~~~sh
npm ci
npm run dev
~~~

打开终端输出的本机地址。生产检查：

~~~sh
npm run build
npm run preview
~~~

## 参考页

- /#finance — Financial Dashboard：银行卡与费用嵌套、收支模块、点阵、增长环、年度套叠圆、三张活动卡、股票折线与评价。
- /#travel — TripAI：风车场景、磨砂导航、助手、天气/预算/繁忙度卡、地点示意图。源稿仅有倾斜静帧；被裁切的区域不声称精确还原。
- /#people — HR：胶囊导航、占比分段、四栏卡片、人物、细柱图、刻度计时器、折叠设备、日历与跨行叠层任务卡。
- /#system — 主题变量、材质、字体与基础组件。
- /#original — 完整保留原主题的总览、日常、亮点、模板与规范。

所有业务数据为演示。周期/年份切换、搜索、评价、验证状态、计时、任务复选框、邀请表单、折叠项、月份、旅行分类/收藏/地图缩放均在本地运行；刷新或切换参考页后恢复初值。助手是明确的本地示例回复，不调用 AI 或其他外部服务。没有真实支付、邮件或预订。

## 实现

React 19 + TypeScript + Vite + Tailwind CSS v4。Button、Input、Dialog 使用 shadcn/ui（Radix）。Outfit / Syne 字体本地打包。

- src/theme/crease.css：保留原来的 shadcn 主题变量；主操作是近黑，红色 --signal 只用于路径、细线与点。
- src/theme/references.css：三个参考页的结构、材质和响应式布局。
- src/theme/studio.css：主题规范与参考页导航。
- src/components/studio/references.tsx：三个独立页面及交互。
- src/components/ui/：shadcn 基础组件。
- [design/DIRECTION.md](design/DIRECTION.md)：原图出处、逐图分析、结构对应、取舍及素材限制。

## 来源与素材

原图保存在 design/references/，来自用户指定的公开 Dribbble 稿件，仅作设计研究。HR 人像与 TripAI 风车/缩略图从这些图中裁切提取，保存在 public/reference-details/；原稿、照片与品牌的权利归各自权利人，不将其声明为原创或可自由商用素材。新页面中的示意地图、图表与 CSS 材质由代码绘制。

原主题的视觉方法来自 Mirror’s Edge，而非游戏素材：白色环境、必要体块、红色引导。原主题标志和 public/sources/red-line.svg 保留；没有引入游戏截图、角色或官方宣传图。

原主题来源：https://bloom-gem-crane-flame.grok.me
