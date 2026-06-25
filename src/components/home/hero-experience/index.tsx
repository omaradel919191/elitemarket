"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Overlay } from "./overlay";
import { HeroStatic } from "./hero-static";
import { HERO_SCROLL_VH, heroState } from "./progress-store";

const ExperienceCanvas = dynamic(() => import("./experience-canvas"), {
  ssr: false,
});

function particleCount(w: number) {
  return w < 1280 ? 7000 : 10000;
}

export function HeroExperience() {
  const [mode, setMode] = useState<"static" | "full">("static");
  const [count, setCount] = useState(12000);
  const pinRef = useRef<HTMLDivElement>(null);

  // True only when the device can comfortably run the WebGL experience.
  // The throwaway probe gives false negatives on hidden tabs, so only reject
  // when we can positively confirm "no WebGL" on a visible page; otherwise be
  // optimistic and let the context-loss handler fall back if it truly fails.
  const canRunFull = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return false;
    if (window.innerWidth < 768) return false;
    if (document.visibilityState === "visible") {
      try {
        const test = document.createElement("canvas");
        const ok =
          !!test.getContext("webgl2") || !!test.getContext("webgl");
        if (!ok) return false;
      } catch {
        return false;
      }
    }
    return true;
  }, []);

  // Decide capability on the client (SSR renders the static hero for SEO/LCP).
  // Retry once the tab becomes visible — WebGL can be unavailable while hidden.
  useEffect(() => {
    const upgrade = () => {
      if (canRunFull()) {
        setCount(particleCount(window.innerWidth));
        setMode("full");
        return true;
      }
      return false;
    };
    if (upgrade()) return;
    const onVis = () => {
      if (document.visibilityState === "visible" && upgrade()) {
        document.removeEventListener("visibilitychange", onVis);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [canRunFull]);

  // Drive scroll progress with a pinned ScrollTrigger.
  useEffect(() => {
    if (mode !== "full") return;
    let trigger: { kill: () => void } | undefined;
    let killed = false;

    // Dev-only: pin progress via #p=0.42 for deterministic screenshots.
    if (process.env.NODE_ENV !== "production") {
      const m = window.location.hash.match(/p=([0-9.]+)/);
      if (m) {
        heroState.progress = Math.min(1, Math.max(0, parseFloat(m[1])));
        heroState.ready = true;
        (window as unknown as { __hero?: typeof heroState }).__hero = heroState;
        return;
      }
    }

    (async () => {
      const [{ ScrollTrigger }, { gsap }] = await Promise.all([
        import("gsap/ScrollTrigger"),
        import("gsap"),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      if (killed || !pinRef.current) return;
      trigger = ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          heroState.progress = self.progress;
        },
      });
      heroState.ready = true;
      ScrollTrigger.refresh();
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __hero?: typeof heroState }).__hero = heroState;
      }
    })();

    return () => {
      killed = true;
      trigger?.kill();
      heroState.progress = 0;
      heroState.ready = false;
    };
  }, [mode]);

  if (mode === "static") return <HeroStatic />;

  return (
    <section
      ref={pinRef}
      style={{ height: `${HERO_SCROLL_VH}vh` }}
      className="relative"
      aria-label="Elite Market cinematic experience"
    >
      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-ink">
        <ExperienceCanvas
          count={count}
          onContextLost={() => setMode("static")}
        />
        <div className="spotlight pointer-events-none absolute inset-0 z-10" />
        <Overlay />
      </div>
    </section>
  );
}
