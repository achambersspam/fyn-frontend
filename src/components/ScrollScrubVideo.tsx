"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Copy beats shown under the video, swapped as the scrub progresses so the
// pinned scroll distance is doing narrative work, not just holding a video.
const BEATS: Array<{ at: number; text: string }> = [
  { at: 0, text: "Keep scrolling — a fresh issue is arriving…" },
  { at: 0.35, text: "The mailbox opens…" },
  { at: 0.85, text: "Delivered. Every day, right on time." },
];

// Pins the video (and heading) to the viewport while its section scrolls
// past, mapping scroll progress to video time: closed mailbox at entry,
// fully open and smiling by 60% of the span, held to the end.
export default function ScrollScrubVideo({
  src,
  children,
  className,
  poster = "/pigeon-filled.svg",
}: {
  src: string;
  children?: ReactNode;
  className?: string;
  poster?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || shouldLoadVideo) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [shouldLoadVideo]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    const caption = captionRef.current;
    if (!wrapper || !video || !shouldLoadVideo) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Scrubbing drives playback; make sure the element never free-runs.
    video.pause();

    const setCaption = (progress: number) => {
      if (!caption) return;
      let text = BEATS[0].text;
      for (const beat of BEATS) {
        if (progress >= beat.at) text = beat.text;
      }
      if (caption.textContent !== text) caption.textContent = text;
    };

    const update = () => {
      // readyState >= 1 means duration/metadata is known. Checked here
      // rather than via a loadedmetadata flag so we can't lose the race
      // when metadata arrives before this effect runs.
      const hasDuration = video.readyState >= 1 && video.duration > 0;

      if (prefersReducedMotion) {
        if (hasDuration) video.currentTime = video.duration - 0.05;
        setCaption(1);
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Scroll progress across the pinned span: 0 when the section's top
      // just reaches the top of the viewport, 1 when its bottom does.
      const scrollable = rect.height - viewportH;
      const raw =
        scrollable <= 0
          ? 0
          : Math.min(1, Math.max(0, -rect.top / scrollable));
      // Finish the animation at 60% of the span so the pigeon is fully out
      // well before the section releases, then hold the final frame.
      const progress = Math.min(1, raw / 0.6);

      // Back off a hair from the exact end so the browser doesn't fire
      // "ended" and snap the frame.
      if (hasDuration) {
        video.currentTime = progress * Math.max(0, video.duration - 0.05);
      }
      setCaption(progress);
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    video.addEventListener("loadedmetadata", update);
    video.addEventListener("loadeddata", update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("loadeddata", update);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [shouldLoadVideo]);

  return (
    <div ref={wrapperRef} className={`relative h-[200vh] ${className ?? ""}`}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4">
        {children}
        <video
          ref={videoRef}
          src={shouldLoadVideo ? src : undefined}
          muted
          playsInline
          preload="none"
          poster={poster}
          aria-label="The For You Newsletter mailbox opening as the pigeon pops its head out and smiles"
          // The video has a white background baked in: in light mode it
          // blends into the white section invisibly; in dark mode frame it
          // as a deliberate card with a ring and glow.
          className="mx-auto aspect-video w-full max-w-xl rounded-3xl object-cover dark:ring-1 dark:ring-slate-700 dark:drop-shadow-[0_18px_40px_rgba(28,176,246,0.35)]"
        />
        <p
          ref={captionRef}
          aria-hidden
          className="text-sm font-semibold text-slate-500 dark:text-slate-400"
        >
          Keep scrolling — a fresh issue is arriving…
        </p>
      </div>
    </div>
  );
}
