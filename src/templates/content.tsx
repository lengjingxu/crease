import { useState } from "react";
import { ArticleCard, ImageCard } from "@/components/kit/content-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatePanel } from "@/components/kit/feedback";
import courtyard from "@/assets/courtyard.svg";
import bridge from "@/assets/bridge.svg";
import fold from "@/assets/fold.svg";

const articles=[
  {category:"设计方法",title:"留白，不是空白",excerpt:"让信息之间有呼吸的距离，让重要的行动自然浮现。好的留白来自清楚的内容优先级。",author:"CREASE 编辑部",date:"2026.10.22",readTime:"4 分钟",body:"先写下这个页面最重要的一件事，再确定其他信息与它的关系。\n\n同一组内容靠近，独立任务之间拉开距离。不要用装饰填满每一处空间，也不要为了空旷牺牲有用的信息。\n\n最后在真实设备上检查：正文是否好读，主要动作是否明确，长文案是否仍有足够的空间。"},
  {category:"材质研究",title:"让光穿过界面",excerpt:"玻璃的层次来自底层环境、半透明表面与细微边缘，而不是把卡片涂成灰色。",author:"材质实验室",date:"2026.10.20",readTime:"6 分钟",body:"先建立白色场域与柔和冰蓝光，再放入透明的玻璃表面。\n\n卡片边缘的高光提供厚度，接触阴影说明层级，背景模糊把下层信息组织成安静的环境。\n\n正文始终位于清晰的表层。检查对比度，避免将透明效果叠加到文字本身。"},
  {category:"交互细节",title:"让等待变得有方向",excerpt:"告诉用户系统正在做什么，还需要多久，以及他们能否取消，比持续旋转的图标更重要。",author:"体验设计组",date:"2026.10.18",readTime:"3 分钟",body:"已知进度时显示真实百分比，未知进度时解释当前步骤。\n\n等待状态必须能结束：成功后给出结果，失败后说明下一步，耗时任务允许取消。\n\n角色动画只补充状态，不替代状态文字。减少动态效果时，用户仍应理解发生了什么。"},
];
const pictures=[{src:courtyard,title:"光的庭院",caption:"空间研究 / 01",alt:"白色庭院、冰蓝天空与红色阶梯"},{src:bridge,title:"连接的方向",caption:"建筑语言 / 02",alt:"两栋白色建筑之间的红色连桥"},{src:fold,title:"折面的秩序",caption:"材质实验 / 03",alt:"透明玻璃、深黑折面与红色路径的叠层"}];
export function ContentTemplate(){
 const [query,setQuery]=useState(""),[article,setArticle]=useState<typeof articles[number]|null>(null),[picture,setPicture]=useState<typeof pictures[number]|null>(null);
 const filtered=articles.filter(a=>(a.title+a.category+a.excerpt).includes(query));
 return <div className="space-y-8"><header className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs tracking-widest text-muted-foreground">内容中心 / 灵感与实践</p><h1 className="text-3xl font-medium sm:text-4xl">把灵感，整理成方法<span className="text-primary">。</span></h1><p className="mt-3 text-sm text-muted-foreground">文章、视觉素材与设计研究，在同一套语言里相遇。</p></div><label className="w-full sm:w-64"><span className="sr-only">搜索文章</span><Input value={query} onChange={e=>setQuery(e.target.value)} className="h-11" placeholder="搜索文章、分类…" /></label></header>
 <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]"><ImageCard {...pictures[0]} onOpen={()=>setPicture(pictures[0])} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">{pictures.slice(1).map(p=><ImageCard key={p.title} {...p} onOpen={()=>setPicture(p)} className="[&>div]:aspect-[2.4/1]" />)}</div></section>
 <div className="flex items-center justify-between"><h2 className="text-xl font-medium">值得读的几篇</h2><span className="text-xs text-muted-foreground">{filtered.length} 篇文章</span></div>{filtered.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(a=><ArticleCard key={a.title} {...a} onRead={()=>setArticle(a)} />)}</div> : <StatePanel state="empty" title="没有找到相关文章" description="换个关键词，或查看全部内容。" actionLabel="查看全部" onAction={()=>setQuery("")} />}
 <Dialog open={!!article} onOpenChange={open=>!open&&setArticle(null)}><DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{article?.title}</DialogTitle><DialogDescription>{article?.author} · {article?.date} · {article?.readTime}</DialogDescription></DialogHeader><div className="space-y-5 py-3 text-base leading-8">{article?.body.split("\n\n").map(p=><p key={p}>{p}</p>)}</div></DialogContent></Dialog>
 <Dialog open={!!picture} onOpenChange={open=>!open&&setPicture(null)}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{picture?.title}</DialogTitle><DialogDescription>CREASE 原创矢量视觉资产 · 可随项目复用</DialogDescription></DialogHeader>{picture&&<img src={picture.src} alt={picture.alt} className="w-full rounded-xl" />}</DialogContent></Dialog>
 </div>;
}
