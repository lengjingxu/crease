export type CatMood = "idle" | "look" | "happy" | "curious" | "sleepy";

export function Cat({
  mood = "idle",
  className = "size-16",
}: {
  mood?: CatMood;
  className?: string;
}) {
  return (
    <svg className={`cat cat-${mood} ${className}`} viewBox="0 0 80 80" aria-hidden="true">
      <g className="cat-body">
        <path className="cat-ear" d="M24 28c1-7 6-8 8-2" />
        <path className="cat-ear" d="M56 28c-1-7-6-8-8-2" />
        <circle cx="40" cy="42" r="24" />
        <g className="cat-open">
          <g className="cat-eye">
            <rect x="28" y="34" width="7" height="16" rx="3.5" fill="#ffffff" transform="rotate(-8 31.5 42)" />
          </g>
          <g className="cat-eye">
            <rect x="45" y="34" width="7" height="16" rx="3.5" fill="#ffffff" transform="rotate(8 48.5 42)" />
          </g>
        </g>
        <g className="cat-glad">
          <path d="M27 44c2.4-5 7-5 9.2 0" />
          <path d="M44 44c2.4-5 7-5 9.2 0" />
        </g>
      </g>
    </svg>
  );
}