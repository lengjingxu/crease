export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="14" y="5" width="14" height="12" rx="2" fill="white" opacity="0.85" />
      <rect x="4" y="14" width="16" height="12" rx="2" fill="var(--color-ink)" />
      <rect x="3" y="15" width="22" height="1.25" fill="var(--color-signal)" />
      <rect x="24" y="8" width="2.5" height="2.5" fill="var(--color-signal)" />
    </svg>
  );
}

export function StageArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative min-h-72 overflow-hidden rounded-lg ${className}`} aria-hidden="true">
      <div className="lamp absolute top-2 left-1/3 size-14" />
      <div className="absolute top-16 left-0 h-28 w-44 rounded-lg bg-paper-2" />
      <div className="ember absolute top-[6.5rem] right-2 left-6 h-px bg-signal" />
      <div className="ember absolute top-8 right-12 h-28 w-px bg-signal" />
      <div className="absolute top-7 right-11 size-1.5 bg-signal" />
      <div className="acrylic absolute top-8 left-3 h-40 w-44 sm:w-52" />
      <div className="acrylic-ink absolute top-16 right-2 h-32 w-40 sm:right-6 sm:w-48" />
      <div className="acrylic-ink absolute right-8 bottom-3 left-10 h-9" />
    </div>
  );
}