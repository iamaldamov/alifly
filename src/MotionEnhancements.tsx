import { useEffect, useState } from "react";

const REVEAL_TARGETS = [
  ".hero-content > .eyebrow",
  ".hero-content > h1",
  ".hero-content > p",
  ".hero-content > .primary-button",
  ".hero-note",
  ".hero-art",
  ".daily-quest-card",
  ".reading-heading",
  ".reading-card",
  ".progress-section > div",
  ".progress-card",
  ".section-heading",
  ".stage-card",
  ".study-phrase-card",
  ".word-game-card",
  ".footer > *",
].join(",");

/**
 * Small, dependency-free motion layer:
 * - reveals learning sections and key cards as they enter the viewport;
 * - shows brief, contextual help after a touch on controls that need explanation.
 *
 * Content remains visible without JavaScript and when reduced motion is preferred.
 */
export default function MotionEnhancements() {
  const [touchHint, setTouchHint] = useState("");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_TARGETS));

    targets.forEach((target, index) => {
      target.classList.add("alifly-reveal");
      target.style.setProperty("--alifly-reveal-delay", `${(index % 4) * 65}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -28px 0px",
      },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const supportsTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (!supportsTouch) return;

    let hideTimer: number | undefined;

    const handlePointerUp = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;

      const control = event.target.closest<HTMLElement>("[data-touch-hint]");
      const message = control?.dataset.touchHint?.trim();
      if (!message) return;

      setTouchHint(message);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setTouchHint(""), 1900);
    };

    document.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className={`alifly-touch-hint ${touchHint ? "is-visible" : ""}`} role="status" aria-live="polite">
      {touchHint}
    </div>
  );
}
