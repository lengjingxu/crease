import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-5"><div className="min-w-0"><p className="mb-3 text-xs tracking-widest text-muted-foreground">{eyebrow}</p><h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{title}<span className="text-primary">。</span></h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p></div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</header>;
}
