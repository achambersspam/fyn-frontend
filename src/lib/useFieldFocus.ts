"use client";

import { useCallback, useRef } from "react";

export function useFieldFocus() {
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const register = useCallback((name: string) => {
    return (el: HTMLElement | null) => {
      refs.current[name] = el;
    };
  }, []);

  const focusFirstInvalid = useCallback((names: string[]) => {
    if (typeof window === "undefined") return null;
    for (const name of names) {
      const el = refs.current[name];
      if (!el) continue;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      if (typeof el.focus === "function") {
        el.focus();
      }
      return name;
    }
    return null;
  }, []);

  return { register, focusFirstInvalid };
}
