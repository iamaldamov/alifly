import { useEffect, useState, type CSSProperties } from "react";

const REVEAL_TARGETS = [
  ".hero-content > .eyebrow", ".hero-content > h1", ".hero-content > p",
  ".hero-content > .primary-button", ".hero-note", ".hero-art", ".daily-quest-card",
  ".reading-heading", ".reading-card", ".progress-section > div", ".progress-card",
  ".section-heading", ".stage-card", ".study-phrase-card", ".word-game-card", ".footer > *",
].join(",");

export default function MotionEnhancements() {
  const [touchHint, setTouchHint] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_TARGETS));
    targets.forEach((target, index) => {
      target.classList.add("alifly-reveal");
      target.style.setProperty("--alifly-reveal-delay", (index % 4) * 55 + "ms");
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -28px 0px" });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0);
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
    let hideTimer: number | undefined;
    const handlePointerUp = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const message = event.target.closest<HTMLElement>("[data-touch-hint]")?.dataset.touchHint?.trim();
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
    <>
      <div className="alifly-pattern-scene" aria-hidden="true" style={{ "--alifly-scroll-progress": scrollProgress } as CSSProperties}>
        <svg className="alifly-pattern-art" viewBox="0 0 300 300" fill="none">
          <g className="alifly-pattern-lines" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
            <path d="M150 18 183 117 282 150 183 183 150 282 117 183 18 150 117 117 150 18Z" />
            <path d="M150 54 174 126 246 150 174 174 150 246 126 174 54 150 126 126 150 54Z" />
            <path d="M150 18 150 282M18 150 282 150M56.5 56.5 243.5 243.5M243.5 56.5 56.5 243.5" />
            <path d="M150 84 166 134 216 150 166 166 150 216 134 166 84 150 134 134 150 84Z" />
          </g>
          <circle cx="150" cy="150" r="4" fill="currentColor" />
        </svg>
      </div>
      <style>{[
        ".alifly-pattern-scene{position:fixed;z-index:0;top:10svh;right:-5vw;width:min(38vw,440px);aspect-ratio:1;pointer-events:none;overflow:hidden;color:#B79B63;opacity:calc(.045 + var(--alifly-scroll-progress,0)*.075);transform:translate3d(0,calc(var(--alifly-scroll-progress,0)*-2vh),0);transition:opacity .5s ease;contain:layout paint}",
        ".alifly-pattern-art{width:100%;height:100%;overflow:visible;transform:rotate(calc(var(--alifly-scroll-progress,0)*10deg)) scale(calc(.94 + var(--alifly-scroll-progress,0)*.06));transform-origin:center}",
        ".alifly-pattern-lines{stroke-dasharray:780;stroke-dashoffset:calc(780 - var(--alifly-scroll-progress,0)*150);transition:stroke-dashoffset .35s ease}",
        ":root[data-theme=light] .alifly-pattern-scene{opacity:calc(.035 + var(--alifly-scroll-progress,0)*.045)}",
        "@media(max-width:700px){.alifly-pattern-scene{top:12svh;right:-19vw;width:58vw;opacity:calc(.035 + var(--alifly-scroll-progress,0)*.055)}:root[data-theme=light] .alifly-pattern-scene{opacity:calc(.025 + var(--alifly-scroll-progress,0)*.035)}}",
        "@media(prefers-reduced-motion:reduce){.alifly-pattern-scene,.alifly-pattern-art,.alifly-pattern-lines{transition:none!important;transform:none!important}}"
      ].join("\n")}</style>
      <div className={"alifly-touch-hint " + (touchHint ? "is-visible" : "")} role="status" aria-live="polite">{touchHint}</div>
    </>
  );
}
