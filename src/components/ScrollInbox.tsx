"use client";

import { useEffect, useRef, useState } from "react";
import { SampleIssueBody } from "@/components/SampleIssuePreview";

/*
 * Scroll-driven "your inbox opens" scene. No video: the section is tall, the stage inside is
 * sticky, and scroll progress (0..1) is written to a CSS variable so every move is a plain CSS
 * transform (smooth, no re-render per frame):
 *   0.00-0.25  an inbox appears with a new email from For You Newsletter
 *   0.25-0.50  the email is picked out and opens
 *   0.50-1.00  the open issue scrolls through the real newsletter
 * Reduced motion shows the finished state.
 */
const BEATS = [
  { at: 0, text: "A fresh issue just arrived…" },
  { at: 0.28, text: "Open it." },
  { at: 0.55, text: "Only what you picked. Nothing you didn't." },
];

const ROWS = [
  { from: "For You Newsletter", subject: "Your personalized briefing — Thu, Oct 15", preview: "Your stocks, today's forecast, your teams…", hero: true },
  { from: "Your bank", subject: "Statement ready", preview: "Your October statement is available." },
  { from: "A store you forgot", subject: "20% off ends tonight!!", preview: "Don't miss out on these deals…" },
  { from: "Group chat", subject: "47 new messages", preview: "Jordan: did anyone see the game?" },
];

export default function ScrollInbox() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let lastBeat = 0;

    const update = () => {
      raf = 0;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const p = reduced ? 1 : scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));
      wrapper.style.setProperty("--p", p.toFixed(4));
      // Scroll the newsletter inside its window during the last half.
      const inner = innerRef.current;
      const win = windowRef.current;
      if (inner && win) {
        const travel = Math.max(0, inner.scrollHeight - win.clientHeight);
        const q = Math.min(1, Math.max(0, (p - 0.5) / 0.5));
        inner.style.transform = `translateY(${(-travel * q).toFixed(1)}px)`;
      }
      let b = 0;
      BEATS.forEach((item, i) => {
        if (p >= item.at) b = i;
      });
      if (b !== lastBeat) {
        lastBeat = b;
        setBeat(b);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Progress helpers as CSS calc() so the browser animates them.
  const ramp = (from: number, to: number) => `clamp(0, calc((var(--p) - ${from}) / ${to - from}), 1)`;

  return (
    <div ref={wrapperRef} className="relative h-[320vh]" style={{ ["--p" as string]: 0 }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-5 overflow-hidden px-4">
        <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
          Your pigeon is on the way.
        </h2>

        <div className="relative w-full max-w-xl" style={{ height: "min(62vh, 560px)" }}>
          {/* INBOX LIST */}
          <div
            className="absolute inset-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-primary/15 dark:border-slate-700"
            style={{
              opacity: `calc(1 - ${ramp(0.3, 0.45)})`,
              transform: `scale(calc(1 - 0.04 * ${ramp(0.3, 0.45)}))`,
              pointerEvents: "none",
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <span className="text-sm font-black text-slate-900">Inbox</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary-dark">4 new</span>
            </div>
            {ROWS.map((row, i) => (
              <div
                key={row.subject}
                className={`flex items-center gap-3 border-b border-slate-100 px-5 py-4 ${row.hero ? "bg-sky-50" : ""}`}
                style={{
                  opacity: row.hero ? 1 : `calc(1 - 0.55 * ${ramp(0.2, 0.32)})`,
                  transform: `translateY(calc((1 - ${ramp(0.0 + i * 0.05, 0.12 + i * 0.05)}) * 28px))`,
                }}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${row.hero ? "bg-primary" : "bg-slate-200"}`}>
                  {row.hero ? (
                    <img src="/pigeon-filled.svg" alt="" className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-bold text-slate-500">{row.from[0]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${row.hero ? "font-black text-slate-900" : "font-semibold text-slate-600"}`}>{row.from}</p>
                  <p className={`truncate text-sm ${row.hero ? "font-bold text-slate-800" : "text-slate-500"}`}>{row.subject}</p>
                  <p className="truncate text-xs text-slate-400">{row.preview}</p>
                </div>
                {row.hero ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" /> : null}
              </div>
            ))}
          </div>

          {/* OPEN EMAIL */}
          <div
            ref={windowRef}
            className="absolute inset-0 overflow-hidden rounded-3xl border border-slate-200 bg-[#eef2f8] shadow-2xl shadow-primary/20 dark:border-slate-700"
            style={{
              opacity: ramp(0.28, 0.4),
              transform: `translateY(calc((1 - ${ramp(0.28, 0.5)}) * 60px)) scale(calc(0.9 + 0.1 * ${ramp(0.28, 0.5)}))`,
            }}
          >
            <div ref={innerRef} className="will-change-transform">
              <SampleIssueBody />
            </div>
          </div>
        </div>

        <p aria-live="polite" className="h-5 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          {BEATS[beat].text}
        </p>
      </div>
    </div>
  );
}
