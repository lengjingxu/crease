import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Two feedback channels, per design/INTERACTION.md (016):
 * - toast(): short status, top-centre, one at a time, 3–5s.
 * - notify(): titled cards, top-right stack, for anything worth keeping.
 * Actions belong to notify(); a toast never carries the only copy of a result.
 */
type ToastItem = { id: number; message: string; leaving?: boolean };
type NotifyItem = { id: number; title: string; body?: string; actionLabel?: string; onAction?: () => void; leaving?: boolean };

const ToastContext = createContext<{ toast: (message: string) => void; notify: (item: Omit<NotifyItem, "id" | "leaving">) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast 必须在 ToastProvider 内使用");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notes, setNotes] = useState<NotifyItem[]>([]);
  const seq = useRef(0);
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);

  const toast = useCallback((message: string) => {
    const id = ++seq.current;
    setToasts([{ id, message }]);
    later(() => setToasts(list => list.map(t => t.id === id ? { ...t, leaving: true } : t)), 4000);
    later(() => setToasts(list => list.filter(t => t.id !== id)), 4250);
  }, [later]);

  const dismissNote = useCallback((id: number) => {
    setNotes(list => list.map(n => n.id === id ? { ...n, leaving: true } : n));
    later(() => setNotes(list => list.filter(n => n.id !== id)), 240);
  }, [later]);

  const notify = useCallback((item: Omit<NotifyItem, "id" | "leaving">) => {
    const id = ++seq.current;
    setNotes(list => [{ id, ...item }, ...list].slice(0, 3));
    later(() => dismissNote(id), item.onAction ? 6000 : 5000);
  }, [later, dismissNote]);

  return <ToastContext.Provider value={{ toast, notify }}>
    {children}
    {createPortal(<>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map(t => <div key={t.id} data-leaving={t.leaving || undefined} className="crease-toast crease-ink pointer-events-auto flex h-10 items-center gap-2 rounded-2xl pr-4 pl-2 text-sm shadow-xl">
          <span className="grid size-6 place-items-center rounded-lg bg-white/15"><CheckCircle2 className="size-4" /></span>{t.message}
        </div>)}
      </div>
      <div className="pointer-events-none fixed top-4 right-4 z-[90] flex w-[min(344px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {notes.map(n => <article key={n.id} data-leaving={n.leaving || undefined} className="crease-notify-card crease-glass pointer-events-auto rounded-2xl p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-accent text-accent-foreground"><Info className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium">{n.title}</h3>
              {n.body && <p className="mt-1 text-sm leading-6 text-muted-foreground">{n.body}</p>}
              <div className="mt-2 flex gap-2">
                {n.actionLabel && <Button size="sm" variant="outline" onClick={() => { n.onAction?.(); dismissNote(n.id); }}>{n.actionLabel}</Button>}
                <Button size="sm" variant="ghost" onClick={() => dismissNote(n.id)}>关闭</Button>
              </div>
            </div>
          </div>
        </article>)}
      </div>
    </>, document.body)}
  </ToastContext.Provider>;
}
