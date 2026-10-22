import { useRef, useState } from "react";
import { ChatPanel, type ChatReply } from "@/components/kit/chat-panel";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/kit/feedback";

export function AssistantTemplate(){
 const failNext=useRef(false);const [armed,setArmed]=useState(false);
 const reply: ChatReply=(text,signal)=>new Promise((resolve,reject)=>{
   const fail=failNext.current;failNext.current=false;setArmed(false);
   const timer=setTimeout(()=>{signal.removeEventListener("abort",abort);if(fail){reject(new Error("演示连接中断。点击重试可恢复，不会重复发送你的消息。"));return;}
     resolve(text.includes("计划") ? "可以先把这周的工作整理成三个层次：\n\n1. 必须完成：确定最重要的一项交付，写清楚完成标准。\n2. 需要推进：为协作项目安排一次短评审，提前整理问题。\n3. 可以留白：预留一段不被打断的时间，处理突发事项。\n\n建议先从第一个目标开始，再安排其他任务。\n\n这是本地演示回复，接入你的 AI 服务后可生成真实建议。" : text.includes("分析") ? "从项目列表里，可以先关注三类信息：\n\n• 进度：哪些项目正在进行，下一次交付是什么。\n• 资源：负责人是否清楚，预算是否匹配当前阶段。\n• 风险：是否存在等待输入或需要决策的阻塞。\n\n这里展示的是回答的排版方式，未读取外部项目数据。" : "围绕「"+text+"」，可以先明确目标、受众与下一步行动。\n\n把信息分成少量清晰的段落，用具体表达替代抽象描述，并给读者一个可以立即执行的动作。\n\n这是本地示例内容，不是真实模型生成结果。");},1400);
   function abort(){clearTimeout(timer);reject(new DOMException("Aborted","AbortError"));}signal.addEventListener("abort",abort,{once:true});if(signal.aborted)abort();
 });
 return <div className="space-y-7"><header><p className="mb-3 crease-eyebrow">智能工作台 / 对话模板</p><h1 className="crease-title">想法有了，一个好的开始<span className="text-primary">。</span></h1><p className="mt-3 text-sm text-muted-foreground">支持消息、建议问题、等待、取消、错误与重试。</p></header><div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_250px]"><ChatPanel onReply={reply} demo /><aside className="space-y-5"><div className="crease-glass rounded-2xl p-5"><h2 className="text-base font-medium">对话状态演示</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">让下一条回复模拟失败，查看错误提示和重试流程。</p><Button variant="outline" className="mt-4 w-full" disabled={armed} onClick={()=>{failNext.current=true;setArmed(true);}}>{armed?"下一条将模拟失败":"模拟一次连接失败"}</Button></div><Notice title="可接入自己的 AI 服务">ChatPanel 接收 onReply 与 AbortSignal。请求、认证和模型选择由你的项目负责。</Notice></aside></div></div>;
}
