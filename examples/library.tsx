import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { LayoutDashboard, BarChart3, Kanban, FolderOpen, Bell, Files, MessageCircle, Settings, Shapes, Sparkles, Moon, Sun, Search, Code2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkspaceShell } from "@/components/kit/workspace-shell";
import { AdminTemplate } from "@/templates/admin";
import { ContentTemplate } from "@/templates/content";
import { AssistantTemplate } from "@/templates/assistant";
import { SettingsTemplate } from "@/templates/settings";
import { ComponentGallery } from "@/templates/component-gallery";
import { CompanionLab } from "@/templates/companion-lab";
import { AnalyticsTemplate } from "@/templates/analytics";
import { TasksTemplate } from "@/templates/tasks";
import { FilesTemplate } from "@/templates/files";
import { NotificationsTemplate } from "@/templates/notifications";
import analyticsSource from "@/templates/analytics.tsx?raw";
import tasksSource from "@/templates/tasks.tsx?raw";
import filesSource from "@/templates/files.tsx?raw";
import notificationsSource from "@/templates/notifications.tsx?raw";
import barSource from "@/components/kit/bar-chart.tsx?raw";
import headingSource from "@/components/kit/page-heading.tsx?raw";
import materialSource from "@/components/kit/material-study.tsx?raw";
import ringSource from "@/components/kit/progress-ring.tsx?raw";
import adminSource from "@/templates/admin.tsx?raw";
import contentSource from "@/templates/content.tsx?raw";
import assistantSource from "@/templates/assistant.tsx?raw";
import settingsSource from "@/templates/settings.tsx?raw";
import gallerySource from "@/templates/component-gallery.tsx?raw";
import companionLabSource from "@/templates/companion-lab.tsx?raw";
import shellSource from "@/components/kit/workspace-shell.tsx?raw";
import tableSource from "@/components/kit/data-table.tsx?raw";
import metricSource from "@/components/kit/metric-card.tsx?raw";
import cardSource from "@/components/kit/content-card.tsx?raw";
import feedbackSource from "@/components/kit/feedback.tsx?raw";
import chatSource from "@/components/kit/chat-panel.tsx?raw";
import companionSource from "@/components/kit/companion.tsx?raw";
import companionCss from "@/components/kit/companion.css?raw";
import themeSource from "@/theme/crease.css?raw";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/syne/latin-600.css";
import "@/theme/crease.css";

const pages=[
 {id:"admin",label:"管理后台",icon:<LayoutDashboard className="size-4" />,Component:AdminTemplate,keywords:"表格 数据 指标 筛选 分页 导出 项目",source:adminSource},
 {id:"analytics",label:"数据分析",icon:<BarChart3 className="size-4" />,Component:AnalyticsTemplate,keywords:"增长 访问 转化 图表 报表",source:analyticsSource},
 {id:"tasks",label:"任务协作",icon:<Kanban className="size-4" />,Component:TasksTemplate,keywords:"看板 任务 协作 日程 进度",source:tasksSource},
 {id:"files",label:"文件管理",icon:<FolderOpen className="size-4" />,Component:FilesTemplate,keywords:"文件 上传 导入 下载 预览 资产",source:filesSource},
 {id:"notifications",label:"通知中心",icon:<Bell className="size-4" />,Component:NotificationsTemplate,keywords:"消息 通知 未读 提醒",source:notificationsSource},
 {id:"content",label:"内容中心",icon:<Files className="size-4" />,Component:ContentTemplate,keywords:"文章 图片 内容 卡片 素材",source:contentSource},
 {id:"assistant",label:"AI 对话",icon:<MessageCircle className="size-4" />,Component:AssistantTemplate,keywords:"聊天 人工智能 消息 输入 等待 停止",source:assistantSource},
 {id:"settings",label:"偏好设置",icon:<Settings className="size-4" />,Component:SettingsTemplate,keywords:"表单 设置 标签 开关 通知",source:settingsSource},
 {id:"components",label:"组件与状态",icon:<Shapes className="size-4" />,Component:ComponentGallery,keywords:"加载 骨架 空白 错误 告警 进度 弹窗 按钮 组件",source:gallerySource},
 {id:"companion",label:"折光 · 动态形象",icon:<Sparkles className="size-4" />,Component:CompanionLab,keywords:"grokbot 形象 角色 动态 表情 思考 动画",source:companionLabSource},
];
const sources:Record<string,string>={...Object.fromEntries(pages.map(p=>[p.id,p.source])),"工作空间布局":shellSource,"数据表格":tableSource,"数据卡片":metricSource,"文章与图片卡片":cardSource,"告警与等待":feedbackSource,"AI 对话组件":chatSource,"动态形象组件":companionSource,"动态形象样式":companionCss,"材质光影实验":materialSource,"对比柱图":barSource,"场景标题":headingSource,"刻度进度环":ringSource,"完整主题":themeSource};
function Library(){
 const [active,setActive]=useState(location.hash.slice(1)||"components"),[dark,setDark]=useState(false),[search,setSearch]=useState(false),[query,setQuery]=useState(""),[source,setSource]=useState(false),[sourceKey,setSourceKey]=useState("admin"),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState("");
 useEffect(()=>{const change=()=>setActive(location.hash.slice(1)||"components");addEventListener("hashchange",change);return()=>removeEventListener("hashchange",change);},[]);
 const page=pages.find(p=>p.id===active)||pages[0];const Component=page.Component;
 const results=pages.filter(p=>(p.label+p.keywords).toLowerCase().includes(query.toLowerCase()));
 function navigate(id:string){location.hash=id;setSearch(false);setQuery("");window.scrollTo({top:0,behavior:"instant"});}
 return <TooltipProvider><WorkspaceShell nav={pages} active={page.id} onNavigate={navigate} actions={<><Button variant="ghost" size="icon" aria-label="搜索组件与模板" onClick={()=>setSearch(true)}><Search /></Button><Button variant="outline" size="icon" aria-label="查看可复制源码" onClick={()=>{setSourceKey(page.id);setSource(true);setCopied(false);setCopyError("");}}><Code2 /></Button><Button variant="outline" size="icon" aria-label={dark?"切换浅色模式":"切换深色模式"} onClick={()=>{document.documentElement.classList.toggle("dark",!dark);setDark(!dark);}}>{dark?<Sun />:<Moon />}</Button></>}><Component key={page.id} /></WorkspaceShell>
 <Dialog open={search} onOpenChange={setSearch}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>查找设计资产</DialogTitle><DialogDescription>搜索表格、卡片、告警、AI 对话或动态形象。</DialogDescription></DialogHeader><Input aria-label="查找组件" value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入名称或用途…" className="h-11" /><div className="space-y-1">{results.map(p=><button key={p.id} onClick={()=>navigate(p.id)} className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left hover:bg-accent hover:text-accent-foreground">{p.icon}{p.label}</button>)}{!results.length&&<p className="py-6 text-center text-sm text-muted-foreground">没有找到匹配资产，请换个关键词。</p>}</div></DialogContent></Dialog>
 <Dialog open={source} onOpenChange={setSource}><DialogContent className="max-h-[90dvh] min-w-0 overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle>复制到你的项目</DialogTitle><DialogDescription>先加载 crease.css，再复制所需组件及其依赖。完整步骤见仓库 design/ASSETS.md。</DialogDescription></DialogHeader><div className="flex flex-wrap items-center gap-3"><Select value={sourceKey} onValueChange={v=>{setSourceKey(v);setCopied(false);setCopyError("");}}><SelectTrigger className="min-h-11 w-full sm:w-60" aria-label="选择源码"><SelectValue /></SelectTrigger><SelectContent>{Object.keys(sources).map(key=><SelectItem value={key} key={key}>{pages.find(p=>p.id===key)?.label||key}</SelectItem>)}</SelectContent></Select><Button onClick={async()=>{try{await navigator.clipboard.writeText(sources[sourceKey]);setCopied(true);setCopyError("");}catch{setCopyError("当前环境无法访问剪贴板，请在下方选择代码复制，或从 GitHub 获取源码。");}}}>{copied?<Check />:<Copy />}{copied?"已复制":"复制源码"}</Button></div>{copyError&&<p role="alert" className="text-sm text-destructive">{copyError}</p>}<pre className="max-h-[55dvh] overflow-auto rounded-xl bg-secondary p-4 text-xs leading-6" tabIndex={0}><code>{sources[sourceKey]}</code></pre></DialogContent></Dialog>
 </TooltipProvider>;
}
createRoot(document.getElementById("root")!).render(<Library />);
