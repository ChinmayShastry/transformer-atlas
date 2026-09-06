"use client";

import { useEffect, useRef, useState } from "react";

// Eases a number toward its target so dragging a slider makes the readouts
// count rather than snap. Interrupting mid-flight resumes from wherever the
// number currently sits, so fast dragging stays smooth.
//
// The animation is presentation only: the displayed value must always end up
// equal to the target, even when no animation frames are delivered. A hidden
// tab suspends requestAnimationFrame entirely, and a readout frozen on a stale
// number is showing the wrong answer, so there is a failsafe below.
export function useAnimatedNumber(target: number, duration = 380): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const from = fromRef.current;

    if (reduced || from === target || document.hidden) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const start = performance.now();
    let raf = 0;

    const settle = () => {
      fromRef.current = target;
      setDisplay(target);
    };

    // Fires if frames stop arriving part-way through.
    const failsafe = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      settle();
    }, duration + 150);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      if (t >= 1) {
        window.clearTimeout(failsafe);
        settle();
        return;
      }
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      fromRef.current = value;
      setDisplay(value);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [target, duration]);

  return display;
}
