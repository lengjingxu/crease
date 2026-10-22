import { useEffect, useId, useRef, useState } from "react";
import { ArrowUp, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Companion } from "./companion";
import { Notice } from "./feedback";

export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
export type ChatReply = (text: string, signal: AbortSignal, history: ChatMessage[]) => Promise<string>;

/** Network-agnostic. Supply your own authenticated API adapter; cancellation uses AbortSignal. */
export function ChatPanel({ onReply, demo = false }: { onReply: ChatReply; demo?: boolean }) {
  const inputId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const controller = useRef<AbortController | null>(null);
  const lastRequest = useRef("");
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { bottom.current?.scrollIntoView({block:"nearest",behavior:"instant"}); }, [messages, busy]);
  async function send(text: string, retry = false) {
    if (!text.trim() || controller.current) return;
    const request = new AbortController(); controller.current = request;
    const history = retry ? messages : [...messages, {id: crypto.randomUUID(),role:"user" as const,text:text.trim()}];
    lastRequest.current = text.trim(); setMessages(history);setDraft("");setBusy(true);setError("");setNotice("");
    try {
      const answer = await onReply(text.trim(), request.signal, history);
      if (!request.signal.aborted) setMessages([...history,{id:crypto.randomUUID(),role:"assistant",text:answer}]);
    } catch (e) {
      if (!request.signal.aborted) setError(e instanceof Error ? e.message : "暂时无法生成回复，请重试。");
    } finally { if(controller.current === request){controller.current=null;setBusy(false);} }
  }
  function stop() { controller.current?.abort();controller.current=null;setBusy(false);setNotice("已停止生成，可继续发送新消息。"); }
  return <section className="crease-glass flex min-h-[650px] min-w-0 flex-col overflow-hidden rounded-2xl" aria-label="AI 对话"><header className="flex items-center justify-between gap-4 border-b px-6 py-4"><div className="flex items-center gap-2"><Companion className="w-12" state={busy ? "thinking" : error ? "error" : "idle"} animated={busy} /><div><h2 className="font-medium">折光助手</h2><p className="text-xs text-muted-foreground">{demo ? "本地演示 · 未连接 AI 服务" : "你的工作伙伴"}</p></div></div><Button variant="ghost" size="icon" aria-label="清空对话" disabled={busy || !messages.length} onClick={()=>{setMessages([]);setError("");setNotice("对话已清空。");}}><RotateCcw /></Button></header>
    <div className="max-h-[550px] flex-1 space-y-6 overflow-y-auto p-5 sm:p-8" aria-label="对话记录">
      {!messages.length && <div className="flex flex-col items-center py-6 text-center"><Companion className="w-36" /><h3 className="mt-3 text-2xl font-medium">一起，把想法变清晰。</h3><p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">整理计划、分析信息，或开始一次新的创作。</p><div className="mt-7 flex flex-wrap justify-center gap-2">{["整理本周工作计划","分析项目进展","写一段产品介绍"].map(text=><Button variant="outline" key={text} onClick={()=>void send(text)}>{text}</Button>)}</div></div>}
      {messages.map(message=><article key={message.id} className={message.role === "user" ? "ml-auto max-w-[90%] rounded-2xl bg-secondary px-5 py-4 sm:max-w-[75%]" : "max-w-full"}><p className="mb-2 text-xs font-medium text-muted-foreground">{message.role === "user" ? "你" : "折光"}</p><p className="whitespace-pre-wrap break-words text-base leading-8">{message.text}</p></article>)}
      {busy && <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status"><span className="inline-block size-2 animate-pulse rounded-full bg-primary" />正在整理思路…</div>}
      {error && <div className="space-y-3"><Notice tone="error" title="回复未完成">{error}</Notice><Button variant="outline" onClick={()=>void send(lastRequest.current,true)}>重试回复</Button></div>}
      <div ref={bottom} />
    </div>
    <form className="mt-auto border-t p-4 sm:p-6" onSubmit={event=>{event.preventDefault();void send(draft);}}><label htmlFor={inputId} className="sr-only">发送消息</label><div className="rounded-xl border border-input bg-background p-2"><Textarea id={inputId} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();if(!busy)void send(draft);}}} placeholder="说说你的想法…" maxLength={4000} className="min-h-20 resize-none border-0 shadow-none focus-visible:ring-0" /><div className="flex items-center justify-between gap-3 px-2 pb-1"><span className="text-xs text-muted-foreground">Shift + Enter 换行</span>{busy ? <Button type="button" variant="outline" onClick={stop}><Square className="size-3" />停止生成</Button> : <Button type="submit" size="icon" aria-label="发送消息" disabled={!draft.trim()}><ArrowUp /></Button>}</div></div><p className="mt-2 min-h-5 text-xs text-muted-foreground" role="status">{notice || (demo ? "回复由本地示例逻辑生成，不代表真实 AI 推理。" : "重要信息请核对来源。")}</p></form>
  </section>;
}
