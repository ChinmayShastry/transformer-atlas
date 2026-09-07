"use client";

import { useEffect, useRef, useState } from "react";

// Reports 0→1 as a tall element travels through the viewport, for animations
// scrubbed by scroll position rather than by a timer.
//
// Measures directly in the scroll handler: no queued flag waiting on a frame.
// requestAnimationFrame is not delivered on a hidden tab, and a latch would
// stay stuck on and freeze the animation permanently. One getBoundingClientRect
// per scroll event is cheap, and scroll events are already frame-aligned.
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    // Someone who has asked for less motion gets the finished state, not a
    // half-morphed one they can never resolve.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }

    function measure() {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      if (travel <= 0) {
        setProgress(r.top <= 0 ? 1 : 0);
        return;
      }
      const p = Math.min(1, Math.max(0, -r.top / travel));
      setProgress(p);
    }

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { ref, progress };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Maps progress to 0→1 across a sub-range, so separate elements can fade in
// and out at different points of the same scroll.
export function phase(p: number, start: number, end: number) {
  return clamp01((p - start) / (end - start));
}
