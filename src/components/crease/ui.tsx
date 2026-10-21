import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "line" | "quiet";

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={cn("btn", `btn-${variant}`, className)} {...props} />;
}

export function Field({
  label,
  hint,
  invalid,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  invalid?: boolean;
}) {
  const fieldId = id ?? props.name ?? label;
  return (
    <label className="block text-sm font-medium" htmlFor={fieldId}>
      {label}
      <input
        id={fieldId}
        className={cn("field mt-2", invalid && "field-invalid", className)}
        {...props}
      />
      {hint && <span className="type-note mt-2 block">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  id,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  const fieldId = id ?? props.name ?? label;
  return (
    <label className="block text-sm font-medium" htmlFor={fieldId}>
      {label}
      <textarea
        id={fieldId}
        className={cn("field mt-2 h-auto resize-none py-2", className)}
        {...props}
      />
      {hint && <span className="type-note mt-2 block">{hint}</span>}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <article className={cn("card", className)}>{children}</article>;
}

export function Empty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="card border-dashed px-4 py-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {body && <p className="type-note mt-1">{body}</p>}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  body,
  actions,
}: {
  kicker: string;
  title: string;
  body?: string;
  actions?: ReactNode;
}) {
  return (
    <header>
      <p className="type-kicker">{kicker}</p>
      <h1 className="title-cut mt-3 font-display text-5xl leading-tight">{title}</h1>
      {body && <p className="type-note mt-4 max-w-xl">{body}</p>}
      {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="card">
      <p className="type-kicker">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none">{value}</p>
      {hint && <p className="type-note mt-2">{hint}</p>}
    </article>
  );
}

export function DataRow({
  title,
  meta,
  aside,
  active,
  onClick,
}: {
  title: string;
  meta?: string;
  aside?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const className = active
    ? "flex w-full items-center gap-3 border-l border-signal px-4 py-3 text-left"
    : "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-2";
  const inner = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        {meta && <span className="type-note block truncate">{meta}</span>}
      </span>
      {aside && <span className="shrink-0 text-sm">{aside}</span>}
    </>
  );
  if (!onClick) return <div className={className}>{inner}</div>;
  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  );
}

export function FigurePlate({ kind }: { kind: "field" | "mass" | "cut" }) {
  return (
    <div className="relative h-full w-full bg-paper" aria-hidden="true">
      <div className="absolute top-5 left-4 h-16 w-20 rounded-md bg-paper-2" />
      {kind !== "cut" && <div className="acrylic absolute top-8 left-8 h-20 w-24" />}
      {kind === "mass" && <div className="acrylic-ink absolute top-12 right-4 h-16 w-20" />}
      {kind === "cut" && <div className="acrylic-ink absolute top-6 right-3 bottom-10 left-10" />}
      <div className="ember absolute top-1/2 right-4 left-6 h-px bg-signal" />
    </div>
  );
}

export function FigureCard({
  tone = "plain",
  kicker,
  title,
  body,
  plate = "field",
}: {
  tone?: "plain" | "acrylic" | "ink";
  kicker?: string;
  title: string;
  body?: string;
  plate?: "field" | "mass" | "cut";
}) {
  const plateNode = <FigurePlate kind={plate} />;
  if (tone === "acrylic") {
    return (
      <article className="acrylic figure p-2">
        <div className="figure-media overflow-hidden rounded-md">{plateNode}</div>
        <div className="figure-cap px-2">
          {kicker && <p className="type-kicker">{kicker}</p>}
          <h3 className="text-base font-medium">{title}</h3>
          {body && <p className="type-note">{body}</p>}
        </div>
      </article>
    );
  }
  if (tone === "ink") {
    return (
      <article className="card figure">
        <div className="figure-media">
          {plateNode}
          <div className="acrylic-ink absolute inset-x-3 bottom-3 px-3 py-3">
            {kicker && <p className="text-xs tracking-kicker text-paper/60 uppercase">{kicker}</p>}
            <h3 className="mt-1 text-base font-medium">{title}</h3>
          </div>
        </div>
      </article>
    );
  }
  return (
    <article className="card figure">
      <div className="figure-media">{plateNode}</div>
      <div className="figure-cap">
        {kicker && <p className="type-kicker">{kicker}</p>}
        <h3 className="text-base font-medium">{title}</h3>
        {body && <p className="type-note">{body}</p>}
      </div>
    </article>
  );
}
