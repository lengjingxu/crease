import { useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeading } from "@/components/kit/page-heading";
import { MetricCard } from "@/components/kit/metric-card";
import { BarChart } from "@/components/kit/bar-chart";
import { ProgressRing } from "@/components/kit/progress-ring";
import { Notice } from "@/components/kit/feedback";

const periods = {
 week: {label:"近 7 天", dates:["周一","周二","周三","周四","周五","周六","周日"], visits:[1820,2400,1960,3120,2880,3640,4260], previous:[1600,2100,1700,2300,2600,3100,3400], registrations:2048, payments:[42,59,48,79,75,95,114], paid:512, previousPaid:430},
 month: {label:"近 30 天", dates:["第 1 周","第 2 周","第 3 周","第 4 周"], visits:[11000,15400,18200,20800], previous:[10200,13100,14900,16200], registrations:7848, payments:[300,405,520,655], paid:1880, previousPaid:1620},
};
export function AnalyticsTemplate() {
 const [period,setPeriod]=useState<keyof typeof periods>("week"),[exported,setExported]=useState(false);
 const data=periods[period], total=data.visits.reduce((a,b)=>a+b,0), previous=data.previous.reduce((a,b)=>a+b,0);
 const funnel=[{label:"访问页面",value:total},{label:"创建账户",value:data.registrations},{label:"完成付费",value:data.paid}];
 function download(){const blob=new Blob(["\uFEFF周期,访问量,上期访问量\n"+data.dates.map((d,i)=>[d,data.visits[i],data.previous[i]].join(",")).join("\n")],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="访问分析.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setExported(true);}
 return <div className="space-y-7"><PageHeading eyebrow="增长工作台 / 数据分析" title="从变化里，找到下一步" description="观察访问与转化，理解每一段增长。当前展示固定样例数据。" actions={<Button variant="outline" onClick={download}><Download />导出报表</Button>} />
 <Tabs value={period} onValueChange={value=>{setPeriod(value as keyof typeof periods);setExported(false);}}><TabsList className="h-auto"><TabsTrigger className="min-h-11 px-5" value="week">近 7 天</TabsTrigger><TabsTrigger className="min-h-11 px-5" value="month">近 30 天</TabsTrigger></TabsList></Tabs>
 {exported&&<Notice tone="success" title="当前周期的报表已导出" />}
 <div className="grid gap-4 md:grid-cols-3"><MetricCard label="页面访问" value={total.toLocaleString()} unit="次" change={Number(((total/previous-1)*100).toFixed(1))} detail="相比上一周期" trend={data.visits} emphasis /><MetricCard label="付费转化率" value={(data.paid/total*100).toFixed(2)} unit="%" change={Number(((data.paid/total/(data.previousPaid/previous)-1)*100).toFixed(1))} detail="相比上一周期" trend={data.payments.map((v,i)=>v/data.visits[i]*100)} /><section className="crease-glass crease-optical flex flex-wrap items-center justify-around gap-3 rounded-2xl p-5"><ProgressRing value={data.paid/data.registrations*100} label="注册后付费" /><div><p className="text-sm text-muted-foreground">完成付费</p><p className="mt-3 text-3xl tabular-nums">{data.paid.toLocaleString()}</p><p className="mt-2 text-xs text-muted-foreground">从体验，到价值确认</p></div></section></div>
 <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(260px,1fr)]"><section className="crease-glass min-w-0 rounded-2xl p-5 sm:p-7"><div className="mb-6 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-xl font-medium">访问趋势</h2><span className="text-xs text-muted-foreground">{data.label} / 对比上一周期</span></div><BarChart key={period} label="访问量对比" data={data.dates.map((label,i)=>({label,value:data.visits[i],comparison:data.previous[i]}))} /></section><section className="crease-glass rounded-2xl p-6"><h2 className="text-xl font-medium">转化路径</h2><p className="mt-2 text-sm text-muted-foreground">从首次访问到价值确认</p><ol className="mt-7 space-y-7">{funnel.map((step,i)=><li key={step.label}><div className="mb-3 flex justify-between gap-3 text-sm"><span><span className="mr-3 text-muted-foreground">0{i+1}</span>{step.label}</span><span className="tabular-nums">{step.value.toLocaleString()}</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className={i===0?"h-full bg-foreground":"h-full bg-primary"} style={{width:(step.value/total*100)+"%"}} /></div><p className="mt-2 text-xs text-muted-foreground">占访问量 {(step.value/total*100).toFixed(1)}%</p></li>)}</ol></section></div>
 <section className="border-t pt-6"><div className="flex items-center gap-2 text-sm font-medium"><ArrowUpRight className="size-4 text-primary" />本期观察</div><p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">本期访问量比上期增加 {(total-previous).toLocaleString()} 次。注册到付费的转化率为 {(data.paid/data.registrations*100).toFixed(1)}%，下一步可以检查新用户的首次使用流程。</p></section>
 </div>;
}
