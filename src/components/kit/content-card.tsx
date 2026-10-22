import { useState } from "react";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ImageCard({ src, alt, title, caption, onOpen, className }: { src: string; alt: string; title: string; caption: string; onOpen?: () => void; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return <figure className={cn("crease-glass crease-lift overflow-hidden rounded-2xl", className)}><div className="crease-image-frame relative aspect-[4/3] overflow-hidden bg-secondary">{failedSrc === src ? <div className="grid h-full place-content-center gap-2 text-center text-sm text-muted-foreground"><ImageOff className="mx-auto size-8" />图片加载失败</div> : <img key={src} src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" onError={() => setFailedSrc(src)} />}</div><figcaption className="flex items-center justify-between gap-4 p-5"><div className="min-w-0"><h3 className="text-base font-medium">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{caption}</p></div>{onOpen && <Button variant="outline" size="icon" onClick={onOpen} aria-label={"查看" + title}><ArrowUpRight /></Button>}</figcaption></figure>;
}
export function ArticleCard({ category, title, excerpt, author, date, readTime, onRead }: { category: string; title: string; excerpt: string; author: string; date: string; readTime: string; onRead: () => void }) {
  return <article className="crease-glass crease-lift crease-article flex h-full flex-col rounded-2xl p-6"><div className="mb-6 flex items-center justify-between gap-3"><Badge variant="outline">{category}</Badge><span className="text-xs text-muted-foreground">{readTime}</span></div><h3 className="crease-heading">{title}</h3><p className="mt-3 flex-1 crease-body text-muted-foreground">{excerpt}</p><div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-xs text-muted-foreground">{author} · {date}</p><Button variant="link" aria-label={"阅读" + title} onClick={onRead}>阅读全文<ArrowUpRight /></Button></div></article>;
}
