import { useState } from "react";
import { Plus, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DataTable, type DataColumn } from "@/components/kit/data-table";
import { MetricCard } from "@/components/kit/metric-card";
import { ConfirmDialog, Notice } from "@/components/kit/feedback";
import { ProgressRing } from "@/components/kit/progress-ring";

export type Project = { id: string; name: string; owner: string; status: "进行中" | "已完成" | "待启动"; budget: number };
const initial: Project[] = [
  {id:"CR-001",name:"城市空间研究",owner:"林晓",status:"进行中",budget:28000},
  {id:"CR-002",name:"品牌官网改版",owner:"陈然",status:"进行中",budget:42000},
  {id:"CR-003",name:"移动产品设计",owner:"周予",status:"待启动",budget:36000},
  {id:"CR-004",name:"设计系统升级",owner:"许知",status:"已完成",budget:18500},
  {id:"CR-005",name:"内容工作台",owner:"林晓",status:"进行中",budget:24000},
  {id:"CR-006",name:"年度品牌手册",owner:"陈然",status:"已完成",budget:16000},
  {id:"CR-007",name:"数据看板研究",owner:"周予",status:"待启动",budget:12000},
];
export function AdminTemplate() {
  const [rows,setRows]=useState(initial),[filter,setFilter]=useState("全部状态"),[create,setCreate]=useState(false),[detail,setDetail]=useState<Project|null>(null),[deleting,setDeleting]=useState<string[]>([]),[notice,setNotice]=useState("");
  const columns: DataColumn<Project>[]=[
    {key:"name",title:"项目名称",sortValue:r=>r.name,render:r=><div className="min-w-40"><span className="font-medium">{r.name}</span><p className="mt-1 text-xs text-muted-foreground">{r.id}</p></div>},
    {key:"owner",title:"负责人",sortValue:r=>r.owner,render:r=>r.owner},
    {key:"status",title:"状态",render:r=><Badge variant={r.status==="进行中"?"default":"outline"}>{r.status}</Badge>},
    {key:"budget",title:"预算",align:"right",sortValue:r=>r.budget,render:r=><span className="tabular-nums">¥ {r.budget.toLocaleString()}</span>},
    {key:"action",title:"详情",render:r=><Button variant="ghost" size="icon" aria-label={"查看"+r.name} onClick={()=>setDetail(r)}><ArrowUpRight /></Button>},
  ];
  const visible=rows.filter(r=>filter==="全部状态"||r.status===filter);
  function exportCsv(){
    const csv="\uFEFF项目,负责人,状态,预算\n"+visible.map(r=>[r.name,r.owner,r.status,r.budget].map(value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(",")).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="crease-projects.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice("当前筛选结果已导出为 CSV。");
  }
  return <div className="space-y-7"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 crease-eyebrow">工作空间 / 项目管理</p><h1 className="crease-title">每一份进展，都清晰可见<span className="text-primary">。</span></h1><p className="mt-3 text-sm leading-7 text-muted-foreground">管理团队的项目、预算与交付。以下均为本地演示数据。</p></div><div className="flex gap-2"><Button variant="outline" onClick={exportCsv}><Download />导出</Button><Button onClick={()=>setCreate(true)}><Plus />新建项目</Button></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="项目总数" value={String(rows.length)} unit="个" change={12.8} detail="相比上月 · 演示趋势" trend={[12,16,14,18,17,23,21,28]} emphasis /><MetricCard label="项目预算" value={(rows.reduce((n,r)=>n+r.budget,0)/10000).toFixed(1)} unit="万元" change={8.2} detail="相比上月 · 演示趋势" trend={[5,6,5,8,7,9,8,11]} /><MetricCard label="进行中的项目" value={String(rows.filter(r=>r.status==="进行中").length)} unit="个" change={4.6} detail="相比上月 · 演示趋势" trend={[3,5,4,7,5,6,8,9]} /><MetricCard label="已完成项目" value={String(rows.filter(r=>r.status==="已完成").length)} unit="个" change={0} detail="相比上月 · 演示趋势" trend={[2,3,4,4,5,4,4,4]} /></div>
    {notice && <Notice tone="success" title={notice} />}
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_250px]"><div className="min-w-0 space-y-4"><div className="flex justify-end"><Select value={filter} onValueChange={setFilter}><SelectTrigger className="min-h-11 w-40" aria-label="按状态筛选"><SelectValue /></SelectTrigger><SelectContent>{["全部状态","进行中","已完成","待启动"].map(s=><SelectItem value={s} key={s}>{s}</SelectItem>)}</SelectContent></Select></div><DataTable rows={visible} columns={columns} searchText={r=>r.name+r.owner+r.status} label="项目列表" onDelete={setDeleting} /></div><aside className="crease-glass crease-optical rounded-2xl p-6"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>交付仪表</span><span className="font-mono">01 / 示例</span></div><div className="my-5 flex justify-center"><ProgressRing value={rows.length?rows.filter(r=>r.status==="已完成").length/rows.length*100:0} label="项目完成率" size={168} /></div><p className="mt-3 text-lg font-medium">把精力留给重要的事。</p><p className="mt-3 text-sm leading-7 text-muted-foreground">优先查看进行中的项目，确认负责人和下一次交付时间。</p><div className="mt-6 border-t pt-5"><span className="text-xs text-muted-foreground">下一次里程碑</span><div className="crease-ticks mt-3" /><p className="mt-2 text-sm">10 月 28 日 · 设计评审</p></div></aside></div>
    <Dialog open={create} onOpenChange={setCreate}><DialogContent><DialogHeader><DialogTitle>新建项目</DialogTitle><DialogDescription>创建本地演示记录，不会写入外部系统。</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);const name=String(data.get("name")||"").trim(),owner=String(data.get("owner")||"").trim();if(!name||!owner)return;setRows([...rows,{id:"CR-"+crypto.randomUUID().slice(0,6),name,owner,status:"待启动",budget:Number(data.get("budget"))}]);setNotice("已创建项目："+name);setCreate(false);}}><label className="block space-y-2 text-sm"><span>项目名称</span><Input name="name" required maxLength={40} placeholder="例如：品牌官网改版" className="h-11" /></label><label className="block space-y-2 text-sm"><span>负责人</span><Input name="owner" required maxLength={20} placeholder="输入负责人姓名" className="h-11" /></label><label className="block space-y-2 text-sm"><span>预算（元）</span><Input name="budget" type="number" min={0} max={100000000} defaultValue={10000} required className="h-11" /></label><Button className="w-full" type="submit">创建项目</Button></form></DialogContent></Dialog>
    <Dialog open={!!detail} onOpenChange={open=>!open&&setDetail(null)}><DialogContent><DialogHeader><DialogTitle>{detail?.name}</DialogTitle><DialogDescription>{detail?.id} · 项目详情</DialogDescription></DialogHeader><dl className="grid grid-cols-2 gap-4 text-sm"><dt className="text-muted-foreground">负责人</dt><dd>{detail?.owner}</dd><dt className="text-muted-foreground">当前状态</dt><dd>{detail?.status}</dd><dt className="text-muted-foreground">项目预算</dt><dd>¥ {detail?.budget.toLocaleString()}</dd></dl></DialogContent></Dialog>
    <ConfirmDialog open={!!deleting.length} onOpenChange={open=>!open&&setDeleting([])} title={"删除 "+deleting.length+" 个项目？"} description="只删除当前页面中的演示记录。刷新页面会恢复初始数据。" onConfirm={()=>{setRows(rows.filter(r=>!deleting.includes(r.id)));setNotice("已删除 "+deleting.length+" 个项目。");setDeleting([]);}} />
  </div>;
}
