import { memo, useId } from "react";
import { cn } from "@/lib/utils";
import "./companion.css";

export const companionStates = { idle: "待命", listening: "倾听", thinking: "思考", speaking: "回应", success: "完成", error: "告警", sleeping: "休息" } as const;
export type CompanionState = keyof typeof companionStates;
const contours: Record<CompanionState, string> = {
 idle: "M120 53 C162 48 190 82 187 124 C185 162 157 184 119 184 C78 187 49 165 51 124 C49 85 78 57 120 53Z",
 listening: "M120 40 C151 39 175 81 177 121 C181 162 155 189 120 190 C85 190 59 164 63 122 C66 82 86 43 120 40Z",
 thinking: "M120 57 C157 29 196 70 180 116 C166 149 178 181 127 185 C87 193 39 163 56 124 C71 93 76 65 120 57Z",
 speaking: "M120 61 C153 43 192 73 184 117 C206 155 162 182 120 177 C81 195 40 162 57 123 C38 84 82 46 120 61Z",
 success: "M120 47 C158 47 181 81 180 119 C180 158 154 180 120 182 C84 181 58 157 60 120 C58 80 84 47 120 47Z",
 error: "M120 67 C151 48 189 85 178 120 C195 150 156 173 120 170 C85 181 47 149 61 120 C47 88 84 49 120 67Z",
 sleeping: "M120 113 C155 111 188 130 190 151 C192 173 155 186 120 185 C85 187 47 174 50 152 C52 131 85 112 120 113Z",
};

/** Original soft body with two minimal eye marks. Pausing freezes the current deformation. */
export const Companion = memo(function Companion({ state = "idle", animated = false, className, label }: { state?: CompanionState; animated?: boolean; className?: string; label?: string }) {
 const id=useId().replace(/:/g, "");
 return <svg viewBox="0 0 240 240" role="img" aria-label={label || "折光 · " + companionStates[state]} className={cn("crease-companion h-auto w-40 max-w-full",className)} data-state={state} data-animated={animated}>
  <defs>
   <radialGradient id={id+"body"} cx=".3" cy=".18" r=".95"><stop offset="0" stopColor="#faffff" /><stop offset=".3" stopColor="#f0faff" /><stop offset=".65" stopColor="#dcecf2" /><stop offset=".88" stopColor="#90b3c5" /><stop offset="1" stopColor="#324651" /></radialGradient>
   <radialGradient id={id+"alert"} cx=".3" cy=".18" r=".95"><stop stopColor="#fff1ef" /><stop offset=".35" stopColor="#f3b0b1" /><stop offset=".72" stopColor="#db343c" /><stop offset="1" stopColor="#61070d" /></radialGradient>
   <radialGradient id={id+"shadow"}><stop stopColor="#102c40" stopOpacity=".25" /><stop offset="1" stopColor="#102c40" stopOpacity="0" /></radialGradient>
   <linearGradient id={id+"edge"} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff" /><stop offset=".5" stopColor="#d5efff" stopOpacity=".7" /><stop offset="1" stopColor="#4a748b" stopOpacity=".35" /></linearGradient>
  </defs>
  <ellipse className="slime-shadow" cx="120" cy="205" rx="64" ry="12" fill={"url(#"+id+"shadow)"} />
  <g key={state} className="slime-body">
   <path className="slime-contour" d={contours[state]} fill={"url(#"+id+(state==="error"?"alert":"body")+")"} stroke={"url(#"+id+"edge)"} strokeWidth="1.2" />
   <g className="slime-gaze" fill="none" stroke="#16252e" strokeWidth="5" strokeLinecap="round" aria-hidden="true">
    <g className="slime-eyes">
     {state === "sleeping" ? <path d="M103 153h8m19 0h8" /> : state === "success" ? <path d="M102 123q5-7 10 0m18 0q5-7 10 0" /> : state === "error" ? <path d="m104 119 5 4m23 0 5-4" /> : <path d={state === "thinking" ? "M107 118v3m28-1v5" : "M107 118v5m28-5v5"} />}
    </g>
   </g>
  </g>
 </svg>;
});
