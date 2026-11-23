import { useEffect, type RefObject } from "react";

/**
 * Scroll reveal for [data-reveal] descendants of the container.
 * Elements rise once when they enter the viewport; elements revealed in the
 * same batch get a capped stagger via --reveal-delay (45ms steps, max 8).
 * Reduced motion (or no IntersectionObserver) reveals everything at once.
 * Re-runs when `key` changes, e.g. when the shell switches templates.
 */
export function useReveal(container: RefObject<HTMLElement | null>, key?: string) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"));
    if (!items.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-revealed"));
      return;
    }
    let batch = 0;
    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      visible.forEach((entry, index) => {
        const el = entry.target as HTMLElement;
        el.style.setProperty("--reveal-delay", `${Math.min(batch + index, 8) * 45}ms`);
        el.classList.add("is-revealed");
        io.unobserve(el);
      });
      batch = visible.length ? batch + visible.length : batch;
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(item => io.observe(item));
    return () => io.disconnect();
  }, [container, key]);
}
