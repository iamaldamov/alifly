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
      <div className="alifly-celestial-scene" aria-hidden="true" style={{ "--alifly-scroll-progress": scrollProgress } as CSSProperties}>
        <div className="alifly-celestial-glow" />
        <svg className="alifly-celestial-art" viewBox="0 0 240 280" fill="none">
          <defs>
            <radialGradient id="alifly-moon-halo">
              <stop offset="0" stopColor="#E8D5A5" stopOpacity=".22" />
              <stop offset="1" stopColor="#E8D5A5" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="alifly-moon-fill" x1="56" y1="42" x2="194" y2="226" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FFF1C9" />
              <stop offset="1" stopColor="#C9AD72" />
            </linearGradient>
          </defs>
          <circle cx="120" cy="132" r="116" fill="url(#alifly-moon-halo)" />
          <path
            d="M158 34C99 44 58 98 65 157C72 215 124 254 181 244C161 262 134 273 104 270C34 263 -9 197 5 130C19 63 82 20 149 31C152 32 155 33 158 34Z"
            transform="translate(28 -12)"
            fill="url(#alifly-moon-fill)"
          />
        </svg>
      </div>
      <style>{[
        ".alifly-celestial-scene{position:fixed;z-index:0;top:0;right:0;width:min(34vw,390px);height:72svh;overflow:hidden;pointer-events:none;opacity:calc(.10 + var(--alifly-scroll-progress,0)*.13);transform:translate3d(0,calc(var(--alifly-scroll-progress,0)*-2vh),0);transition:opacity .45s ease;contain:layout paint}",
        ".alifly-celestial-glow{position:absolute;width:82%;aspect-ratio:1;top:3%;right:-12%;border-radius:50%;background:radial-gradient(circle,rgba(218,190,126,.13),rgba(218,190,126,0) 68%);filter:blur(12px)}",
        ".alifly-celestial-art{position:absolute;width:88%;height:auto;max-height:430px;top:2%;right:-13%;overflow:visible;filter:drop-shadow(0 0 20px rgba(239,214,159,.10));transform:scale(calc(.92 + var(--alifly-scroll-progress,0)*.12));transform-origin:68% 42%}",
        ":root[data-theme=light] .alifly-celestial-scene{opacity:calc(.055 + var(--alifly-scroll-progress,0)*.07)}",
        "@media(max-width:700px){.alifly-celestial-scene{width:48vw;height:42svh;opacity:calc(.075 + var(--alifly-scroll-progress,0)*.09)}.alifly-celestial-art{width:100%;max-height:290px;right:-23%;top:1%}:root[data-theme=light] .alifly-celestial-scene{opacity:calc(.035 + var(--alifly-scroll-progress,0)*.05)}}",
        "@media(prefers-reduced-motion:reduce){.alifly-celestial-scene,.alifly-celestial-art{transition:none!important;transform:none!important}}"
      ].join("\n")}</style>
      <div className={"alifly-touch-hint " + (touchHint ? "is-visible" : "")} role="status" aria-live="polite">{touchHint}</div>
    </>
  );
}
