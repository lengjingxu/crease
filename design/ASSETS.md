# CREASE 可复用设计资产

先读取根目录 [design.md](../design.md)，再选模板。所有模板使用同一份 [crease.css](../src/theme/crease.css)，不依赖历史参考页样式。中文界面、白色玻璃、深黑亚克力、信号红和底层冰蓝环境光保持一致。

## 六个可运行页面

运行 npm run dev 后访问 /examples/library.html，通过左侧导航或手机菜单切换。

| 地址后缀 | 模板 | 已实现交互 |
| --- | --- | --- |
| #admin | 管理后台 | 指标、状态筛选、搜索、排序、分页、跨页选择、新建、详情、删除确认、CSV 导出 |
| #content | 内容中心 | 文章与图片卡片、搜索、文章阅读、图片放大 |
| #assistant | AI 对话 | 发送、等待、停止、失败重试、历史清空、模拟失败 |
| #settings | 偏好设置 | 表单校验、标签页、通知开关、保存反馈 |
| #components | 组件与状态 | 按钮、徽标、输入框、提示、弹窗、告警、进度、骨架、空白与错误 |
| #companion | 折光动态形象 | 七种状态、播放/暂停、动作重播、嵌入场景 |

以上业务数据只保存在组件内存中，刷新或离开对应模板会重置。导出为真实 CSV 下载，但项目增删不写入服务器。AI 模板明确使用本地规则演示，无真实模型请求，也不模拟逐字流式生成。

## 复制方式

1. 在 React + TypeScript + Tailwind v4 项目中设置 @/ 指向 src/。
2. 复制 src/theme/crease.css，在应用入口导入一次；配置 @tailwindcss/vite 与 tw-animate-css。
3. 复制 src/lib/utils.ts、需要的 src/components/ui/ 文件及对应 kit 文件。安装 react、react-dom、radix-ui、lucide-react、class-variance-authority、clsx、tailwind-merge；版本以根 package.json 为准。
4. 页面根部使用 crease-canvas。玻璃容器使用 crease-glass，重点黑色区域使用 crease-ink。深色模式由祖先 .dark 控制。
5. 复制所选 src/templates/ 文件和它直接导入的组件；内容模板还需 src/assets/ 三张原创 SVG。Companion 必须连同 companion.css 复制。
6. Outfit / Syne 为可选本地拉丁字体；中文遵循主题系统字体栈。如使用 examples/library.tsx 的完整入口，同时安装 @fontsource/outfit 和 @fontsource/syne。

顶部“查看可复制源码”提供模板、组合组件与主题源码。该视图不包含完整依赖树；迁移仍须按 imports 复制基础组件。Tooltip 的使用区域需包裹 TooltipProvider。

## 组合组件 API

| 文件 | 导出与主要参数 |
| --- | --- |
| kit/workspace-shell.tsx | WorkspaceShell：nav、active、onNavigate、actions、children；桌面侧栏与移动导航 |
| kit/metric-card.tsx | MetricCard：label、value、unit、change、detail、trend、emphasis；Sparkline 可独立使用 |
| kit/data-table.tsx | DataTable：rows（唯一 id）、columns、searchText、label、onDelete、state、onRetry；列用 render 定义内容，sortValue 启用排序 |
| kit/content-card.tsx | ArticleCard / ImageCard：文章摘要与阅读动作、图片及打开动作；图片失败显示明确状态 |
| kit/feedback.tsx | Notice：info/success/warning/error；StatePanel：loading/empty/error；TaskProgress：进度与取消；ConfirmDialog：受控确认框 |
| kit/chat-panel.tsx | ChatPanel：必传 onReply，可选 demo；纯文本安全显示、AbortSignal 取消 |
| kit/companion.tsx | Companion：state、animated、size、className；默认不播放动画 |

DataTable 当前为本地五条分页，选择在搜索和分页间保留；删除回调接收选中 ID，实际删除由调用者负责。远程分页应由业务页明确实现服务器契约，不能把本地分页当远程数据接口。ConfirmDialog 的 onConfirm 为同步动作；异步删除应由调用者增加提交中、错误和关闭策略。

ChatReply 签名为 (text, signal, history) => Promise<string>。history 包含本次用户消息；重试不会重复追加用户消息。真实适配器需将 signal 传给 fetch，检查响应状态并抛出可展示的中文错误。认证密钥只留在服务端。停止后即使旧请求继续返回，也不会写入新对话。当前组件不提供 token 流式协议。

## 基础组件

src/components/ui/ 包含 shadcn Button、Input、Dialog，以及 Card、Badge、Table、Alert、Skeleton、Progress、Tabs、Textarea、Checkbox、Select、Switch、Tooltip、AlertDialog。使用项目内版本以保留主题色与触控尺寸调整。不要重新安装覆盖定制 Button。

## 折光 · ZHÉ

原创 SVG 与 CSS，白色折面外壳、黑玻璃面罩、红色信号及冰蓝边缘。无需 Canvas、WebGL 或图片请求。渐变 ID 及聊天输入 ID 支持同页多实例。

| state | 含义 | 动作 |
| --- | --- | --- |
| idle | 待命 | 轻浮动、眨眼 |
| listening | 倾听 | 输入波形 |
| thinking | 思考 | 轻倾斜、轨道运动 |
| speaking | 回应 | 输出波形 |
| success | 完成 | 一次点头 |
| error | 需要协助 | 一次轻摇 |
| sleeping | 休息 | 静止 |

持续动画必须提供暂停入口；系统 prefers-reduced-motion 时停用动画。状态始终同时有文字，不能只靠动作表达进度。完成/错误重播需重新挂载（例如修改 key）。应用内默认 animated=false，实验页显式启用动画。

动作组织参考 [iduu/grokbot-animation](https://github.com/iduu/grokbot-animation)。该项目无明确开放许可，因此这里只参考持续状态/一次性动作的组织方式，未复制角色轮廓、素材或实现。src/assets 的庭院、红桥和折面也是本项目代码绘制的原创 SVG；它们与 design/references 的第三方研究稿件分开。

## 单文件预览与验收

运行 npm run export:library，输出 output/portable/examples/library.html。脚本、样式、字体和 SVG 内联，可独立转发预览；源码与文档仍以仓库为准。页面内 GitHub 文档链接需要网络，复制按钮依赖浏览器剪贴板权限。

新增资产需同时检查：320px/390px 手机与桌面、深浅模式、键盘焦点与 Escape、加载/空白/错误、正文对比度、减少动态效果。不要通过把正文缩到 12px 以下或隐藏溢出解决拥挤。表格允许容器内横向滚动，整页不允许横向溢出。主题文件提供统一材质，具体页面仍需版式与交互验收。
