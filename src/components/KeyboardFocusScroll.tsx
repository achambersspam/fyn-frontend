"use client";

import { useEffect } from "react";

// Mobile virtual-keyboard helper: keeps the focused field visible and hides the fixed
// bottom nav while the keyboard is open (it would otherwise ride above the keyboard on
// Android and eat input space). Sets data-kb-open on <html>.
export default function KeyboardFocusScroll() {
  useEffect(() => {
    const isField = (el: Element | null): el is HTMLElement =>
      !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !["checkbox", "radio", "button", "submit"].includes((el as HTMLInputElement).type);
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (!coarse) return;

    let timer: number | undefined;
    const reveal = () => {
      window.clearTimeout(timer);
      // Wait for the keyboard animation / viewport resize to settle.
      timer = window.setTimeout(() => {
        const el = document.activeElement;
        if (isField(el)) el.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    };
    const onFocusIn = (e: FocusEvent) => {
      if (isField(e.target as Element)) {
        document.documentElement.dataset.kbOpen = "";
        reveal();
      }
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        if (!isField(document.activeElement)) delete document.documentElement.dataset.kbOpen;
      }, 100);
    };
    const vv = window.visualViewport;
    const onViewport = () => {
      if (isField(document.activeElement)) reveal();
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    vv?.addEventListener("resize", onViewport);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      vv?.removeEventListener("resize", onViewport);
      delete document.documentElement.dataset.kbOpen;
    };
  }, []);
  return null;
}
