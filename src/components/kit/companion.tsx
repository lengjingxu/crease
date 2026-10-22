import { useId } from "react";
import { cn } from "@/lib/utils";
import "./companion.css";

export const companionStates = { idle: "待命", listening: "倾听", thinking: "思考", speaking: "回应", success: "完成", error: "需要帮助", sleeping: "休息" } as const;
export type CompanionState = keyof typeof companionStates;

/** Original CREASE character. Animated only when explicitly enabled. */
export function Companion({ state = "idle", animated = false, className, label }: { state?: CompanionState; animated?: boolean; className?: string; label?: string }) {
  const id = useId().replace(/:/g, "");
  return <svg viewBox="0 0 240 240" role="img" aria-label={label || "折光 · " + companionStates[state]} className={cn("crease-companion h-auto w-40 max-w-full", className)} data-state={state} data-animated={animated}>
    <defs>
      <linearGradient id={id+"shell"} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" /><stop offset=".5" stopColor="#eef8ff" /><stop offset="1" stopColor="#bdd5e2" /></linearGradient>
      <linearGradient id={id+"face"} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#242b31" /><stop offset=".55" stopColor="#090b0d" /><stop offset="1" stopColor="#020304" /></linearGradient>
      <linearGradient id={id+"glass"} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#9ddcff" stopOpacity=".15" /></linearGradient>
      <radialGradient id={id+"shadow"}><stop stopColor="#182b39" stopOpacity=".22" /><stop offset="1" stopColor="#182b39" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse className="companion-shadow" cx="120" cy="207" rx="65" ry="16" fill={"url(#"+id+"shadow)"} />
    <g className="companion-float">
      <path d="M58 88 47 151 68 174 177 174 195 147 181 76 157 54 85 54Z" fill={"url(#"+id+"glass)"} stroke="#ffffff" strokeOpacity=".9" />
      <path d="M73 75 Q77 56 98 56 H145 Q165 56 170 76 L184 151 Q187 174 165 181 L126 191 Q119 193 111 190 L72 179 Q52 173 56 151Z" fill={"url(#"+id+"shell)"} stroke="#d3e2eb" strokeWidth="1.2" />
      <path d="M73 77 88 64 H148 L165 80" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M76 92 Q79 80 92 80 H148 Q162 80 165 94 L173 139 Q175 155 159 160 L130 167 Q120 170 110 167 L80 159 Q65 155 67 140Z" fill={"url(#"+id+"face)"} stroke="#ffffff" strokeOpacity=".35" />
      <path d="M78 95 Q79 88 92 87 H143" stroke="#fff" strokeOpacity=".12" strokeWidth="2" fill="none" />
      <g className="companion-eyes" fill="#f5fbff">
        {state === "success" ? <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"><path d="M86 120 Q94 109 102 120" /><path d="M137 120 Q145 109 153 120" /></g> : state === "error" ? <g fill="none" stroke="#ff777d" strokeWidth="4" strokeLinecap="round"><path d="m87 111 14 14m0-14-14 14m51-14 14 14m0-14-14 14" /></g> : state === "sleeping" ? <g stroke="#a6bdca" strokeWidth="4" strokeLinecap="round"><path d="M86 121h17m34 0h17" /></g> : <><rect x="87" y="107" width="14" height="22" rx="7" /><rect x="138" y="107" width="14" height="22" rx="7" /></>}
      </g>
      <g className="companion-wave" stroke="#ff777d" strokeWidth="3" strokeLinecap="round">{[0,1,2,3,4].map(i=><path key={i} d={"M"+(108+i*6)+" 141v"+([4,8,12,8,4][i])} style={{animationDelay:(i*90)+"ms"}} />)}</g>
      <path d="M113 147q7 4 14 0" fill="none" stroke="#c7e4f5" strokeWidth="2" strokeLinecap="round" className="companion-mouth" />
      <path d="M107 178h26" stroke="#d31218" strokeWidth="3" strokeLinecap="round" />
      <path d="m171 68 10-12" stroke="#d31218" strokeWidth="3" strokeLinecap="round" /><circle className="companion-signal" cx="184" cy="52" r="5" fill="#d31218" />
      <path d="M57 130 47 145 53 162m130-32 10 15-6 17" fill="none" stroke="#d8ebf6" strokeWidth="8" strokeLinecap="round" />
    </g>
    {state === "thinking" && <g className="companion-orbit" fill="#d31218"><circle cx="44" cy="80" r="3" /><circle cx="199" cy="167" r="2" /></g>}
    {state === "success" && <g className="companion-spark" fill="none" stroke="#d31218" strokeWidth="2" strokeLinecap="round"><path d="M33 100h10m-5-5v10m158-15h10m-5-5v10m-26-48h8m-4-4v8" /></g>}
  </svg>;
}
