import { useEffect, useState } from "react";

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
      target.style.setProperty("--alifly-reveal-delay", (index % 4) * 65 + "ms");
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
      <div className="alifly-celestial-scene" aria-hidden="true" style={{ "--alifly-scroll-progress": scrollProgress } as React.CSSProperties}>
        <div className="alifly-celestial-glow" />
        <svg className="alifly-celestial-art" viewBox="0 0 360 520" fill="none">
          <defs>
            <radialGradient id="alifly-moon-light"><stop offset="0" stopColor="#F7E8B5" stopOpacity=".42" /><stop offset="1" stopColor="#F7E8B5" stopOpacity="0" /></radialGradient>
            <linearGradient id="alifly-moon-fill" x1="90" y1="40" x2="245" y2="220"><stop offset="0" stopColor="#FFF4D0" /><stop offset="1" stopColor="#D8C18B" /></linearGradient>
          </defs>
          <circle cx="190" cy="155" r="145" fill="url(#alifly-moon-light)" />
          <path d="M224 48c-67 10-111 73-101 140 10 66 72 112 139 102-23 23-57 37-94 37-74 0-134-60-134-134S94 59 168 59c20 0 39 4 56 12Z" fill="url(#alifly-moon-fill)" />
          <g className="alifly-celestial-stars" fill="#F8EBC9">
            <circle cx="63" cy="94" r="2.2" /><circle cx="282" cy="92" r="1.7" /><circle cx="302" cy="202" r="2.1" /><circle cx="76" cy="250" r="1.5" /><circle cx="245" cy="330" r="1.8" /><circle cx="124" cy="360" r="1.4" />
            <path d="M294 278v12m-6-6h12M84 166v9m-4.5-4.5h9" stroke="#F8EBC9" strokeWidth="1.4" strokeLinecap="round" />
          </g>
          <path d="M30 486V350c0-55 44-99 99-99h102c55 0 99 44 99 99v136M65 486V362c0-36 29-65 65-65h100c36 0 65 29 65 65v124" stroke="#D8C18B" strokeOpacity=".14" strokeWidth="2" />
        </svg>
      </div>
      <style>{[
        ".alifly-celestial-scene{position:fixed;z-index:0;top:0;right:0;width:min(48vw,560px);height:100svh;overflow:hidden;pointer-events:none;opacity:calc(.14 + var(--alifly-scroll-progress,0)*.28);transform:translate3d(0,calc(var(--alifly-scroll-progress,0)*-3vh),0);transition:opacity .35s ease;contain:layout paint}",
        ".alifly-celestial-glow{position:absolute;width:75%;aspect-ratio:1;top:4%;right:-8%;border-radius:50%;background:radial-gradient(circle,rgba(218,190,126,.16),rgba(218,190,126,0) 68%);filter:blur(10px)}",
        ".alifly-celestial-art{position:absolute;width:100%;height:min(86vh,700px);top:3%;right:-16%;overflow:visible;filter:drop-shadow(0 0 26px rgba(239,214,159,.13));transform:scale(calc(.88 + var(--alifly-scroll-progress,0)*.18));transform-origin:70% 28%}",
        ".alifly-celestial-stars{animation:alifly-star-glimmer 7s ease-in-out infinite alternate}",
        "@keyframes alifly-star-glimmer{from{opacity:.45}to{opacity:1}}",
        ":root[data-theme=light] .alifly-celestial-scene{opacity:calc(.06 + var(--alifly-scroll-progress,0)*.1)}",
        "@media(max-width:700px){.alifly-celestial-scene{width:76vw;height:66svh;opacity:calc(.1 + var(--alifly-scroll-progress,0)*.2)}.alifly-celestial-art{width:112%;height:62svh;right:-29%;top:0}:root[data-theme=light] .alifly-celestial-scene{opacity:calc(.04 + var(--alifly-scroll-progress,0)*.08)}}",
        "@media(prefers-reduced-motion:reduce){.alifly-celestial-scene,.alifly-celestial-stars{animation:none!important;transition:none!important;transform:none!important}}"
      ].join("\n")}</style>
      <div className={"alifly-touch-hint " + (touchHint ? "is-visible" : "")} role="status" aria-live="polite">{touchHint}</div>
    </>
  );
}
