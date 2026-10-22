import { useLayoutEffect, type RefObject } from "react";

/** Native scrolling; only decorative layers move. No React renders during scroll. */
export function useScrollDepth(root: RefObject<HTMLElement | null>, route: string) {
  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const backgrounds = [...scope.querySelectorAll<HTMLElement>("[data-background-depth]")];
    const scene = scope.querySelector<HTMLElement>(".crease-material-scene");
    const objects = scene ? [...scene.querySelectorAll<HTMLElement>("[data-object-depth]")] : [];
    let frame = 0;
    function reset() {
      cancelAnimationFrame(frame); frame = 0;
      [...backgrounds, ...objects].forEach(node => node.style.removeProperty("translate"));
    }
    function paint() {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const rect = scene?.getBoundingClientRect();
      const distance = rect ? innerHeight / 2 - rect.top - rect.height / 2 : 0;
      backgrounds.forEach(node => { node.style.translate = "0 " + y * Number(node.dataset.backgroundDepth) + "px"; });
      objects.forEach(node => { node.style.translate = "0 " + Math.max(-36, Math.min(36, distance * Number(node.dataset.objectDepth))) + "px"; });
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
    function configure() {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reset();
      if (motion.matches) return;
      paint();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
    }
    configure();
    motion.addEventListener("change", configure);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", configure);
      reset();
    };
  }, [root, route]);
}
