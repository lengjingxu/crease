import { CheckCircle2, Info, TriangleAlert, CircleX, Inbox, LoaderCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import type { ReactNode } from "react";

export function Notice({ tone = "info", title, children }: { tone?: "info" | "success" | "warning" | "error"; title: string; children?: ReactNode }) {
  const Icon = { info: Info, success: CheckCircle2, warning: TriangleAlert, error: CircleX }[tone];
  return <Alert variant={tone === "error" ? "destructive" : "default"} role={tone === "error" || tone === "warning" ? "alert" : "status"} className="rounded-xl p-4"><Icon /><AlertTitle>{title}</AlertTitle>{children && <AlertDescription className="mt-1 leading-6">{children}</AlertDescription>}</Alert>;
}

export function StatePanel({ state, title, description, actionLabel = "重试", onAction }: { state: "loading" | "empty" | "error"; title?: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  if (state === "loading") return <div className="space-y-5 p-6" role="status" aria-busy="true"><span className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{title || "正在加载内容"}</span><Skeleton className="h-7 w-2/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-24 w-full rounded-xl" /></div>;
  const Icon = state === "error" ? TriangleAlert : Inbox;
  return <div className="flex flex-col items-center gap-3 px-6 py-12 text-center" role={state === "error" ? "alert" : "status"}><span className="grid size-12 place-items-center rounded-2xl bg-secondary"><Icon className="size-6" /></span><h3 className="text-lg font-medium">{title || (state === "error" ? "暂时无法加载" : "这里还没有内容")}</h3><p className="max-w-sm text-sm leading-6 text-muted-foreground">{description || (state === "error" ? "请检查连接后重试。" : "创建第一条记录，开始新的工作。")}</p>{onAction && <Button variant="outline" onClick={onAction} className="mt-2">{actionLabel}</Button>}</div>;
}

export function TaskProgress({ value, label, onCancel }: { value: number; label: string; onCancel?: () => void }) {
  const progress = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return <div className="space-y-3"><div className="flex items-center justify-between gap-4 text-sm"><span>{label}</span><span className="tabular-nums text-muted-foreground">{progress}%</span></div><Progress value={progress} aria-label={label} />{onCancel && progress < 100 && <Button variant="ghost" onClick={onCancel}>取消任务</Button>}</div>;
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, confirmLabel = "确认删除" }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; onConfirm: () => void; confirmLabel?: string }) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{confirmLabel}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
