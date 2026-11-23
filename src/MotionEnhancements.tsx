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
      <div className="alifly-crescent-scene" aria-hidden="true" style={{ "--alifly-scroll-progress": scrollProgress } as CSSProperties}>
        <div className="alifly-crescent-halo" />
        <svg className="alifly-crescent-art" viewBox="0 0 260 300" fill="none">
          <defs>
            <linearGradient id="alifly-crescent-gradient" x1="54" y1="42" x2="210" y2="250" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E8D6A8" />
              <stop offset=".52" stopColor="#B99A62" />
              <stop offset="1" stopColor="#80643D" />
            </linearGradient>
            <filter id="alifly-crescent-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <path className="alifly-crescent-glow" d="M198 20C116 30 55 91 55 160s61 130 143 140C150 272 116 222 116 160S150 48 198 20Z" stroke="url(#alifly-crescent-gradient)" strokeWidth="3" strokeLinejoin="miter" />
          <path className="alifly-crescent-outline" d="M198 20C116 30 55 91 55 160s61 130 143 140C150 272 116 222 116 160S150 48 198 20Z" stroke="url(#alifly-crescent-gradient)" strokeWidth="1.65" strokeLinejoin="miter" />
          <path d="M190 28C123 46 76 101 76 160s47 114 114 132" stroke="url(#alifly-crescent-gradient)" strokeWidth=".7" strokeLinecap="round" opacity=".5" />
        </svg>
      </div>
      <style>{[
        ".alifly-crescent-scene{position:fixed;z-index:0;top:8svh;right:-1vw;width:min(34vw,390px);aspect-ratio:260/300;pointer-events:none;overflow:visible;color:#B99A62;opacity:calc(.12 + var(--alifly-scroll-progress,0)*.12);transform:translate3d(0,calc(var(--alifly-scroll-progress,0)*-2.5vh),0);transition:opacity .7s ease;contain:layout paint}",
        ".alifly-crescent-halo{position:absolute;inset:13%;border-radius:50%;background:radial-gradient(ellipse at 56% 48%,rgba(185,154,98,.15),rgba(185,154,98,.045) 42%,transparent 72%);filter:blur(15px);animation:alifly-crescent-breathe 7s ease-in-out infinite}",
        ".alifly-crescent-art{position:relative;width:100%;height:100%;overflow:visible;transform:rotate(calc(var(--alifly-scroll-progress,0)*-5deg)) scale(calc(.97 + var(--alifly-scroll-progress,0)*.035));transform-origin:58% 48%;animation:alifly-crescent-float 9s ease-in-out infinite}",
        ".alifly-crescent-glow{opacity:.42;filter:url(#alifly-crescent-glow)}",
        ".alifly-crescent-outline{stroke-dasharray:650;stroke-dashoffset:calc(650 - var(--alifly-scroll-progress,0)*34);}",
        "@keyframes alifly-crescent-float{0%,100%{translate:0 0}50%{translate:0 -7px}}",
        "@keyframes alifly-crescent-breathe{0%,100%{opacity:.55;scale:.96}50%{opacity:1;scale:1.04}}",
        ":root[data-theme=light] .alifly-crescent-scene{opacity:calc(.075 + var(--alifly-scroll-progress,0)*.07)}",
        "@media(max-width:700px){.alifly-crescent-scene{top:11svh;right:-13vw;width:53vw;opacity:calc(.085 + var(--alifly-scroll-progress,0)*.08)}:root[data-theme=light] .alifly-crescent-scene{opacity:calc(.055 + var(--alifly-scroll-progress,0)*.05)}.alifly-crescent-halo{filter:blur(10px)}}",
        "@media(prefers-reduced-motion:reduce){.alifly-crescent-scene,.alifly-crescent-art,.alifly-crescent-halo{transition:none!important;animation:none!important;transform:none!important;translate:none!important}}"
      ].join("\n")}</style>
      <div className={"alifly-touch-hint " + (touchHint ? "is-visible" : "")} role="status" aria-live="polite">{touchHint}</div>
    </>
  );
}
