import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-5"><div className="min-w-0"><p className="mb-3 crease-eyebrow">{eyebrow}</p><h1 className="crease-title">{title}<span className="text-primary">。</span></h1><p className="mt-3 max-w-2xl crease-body text-muted-foreground">{description}</p></div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</header>;
}
