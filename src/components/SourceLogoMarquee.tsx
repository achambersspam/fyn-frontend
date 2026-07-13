"use client";

/* eslint-disable @next/next/no-img-element */

// The actual outlets our grounding pipeline pulls from (see
// the-final-fyn-backend/lib/sources/news.ts). Logos come from Google's
// public favicon service — Clearbit's logo CDN is defunct and served
// broken images. The `name` doubles as alt text and an inline wordmark
// beside each mark.
const SOURCES: Array<{ name: string; domain: string }> = [
  { name: "ESPN", domain: "espn.com" },
  { name: "BBC", domain: "bbc.com" },
  { name: "The Guardian", domain: "theguardian.com" },
  { name: "The New York Times", domain: "nytimes.com" },
  { name: "Ars Technica", domain: "arstechnica.com" },
  { name: "The Verge", domain: "theverge.com" },
  { name: "Yahoo Finance", domain: "finance.yahoo.com" },
  { name: "Yahoo Sports", domain: "sports.yahoo.com" },
  { name: "CoinDesk", domain: "coindesk.com" },
  { name: "Cointelegraph", domain: "cointelegraph.com" },
];

// Duplicated once so the track can loop seamlessly at -50%.
const TRACK = [...SOURCES, ...SOURCES];

export default function SourceLogoMarquee() {
  return (
    <div
      aria-label={`Real sources our newsletter draws from, including ${SOURCES.map((s) => s.name).join(", ")}`}
      className="relative overflow-hidden py-2"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="animate-marquee flex w-max items-center gap-6 hover:[animation-play-state:paused]">
        {TRACK.map((source, i) => (
          <span
            key={`${source.domain}-${i}`}
            aria-hidden={i >= SOURCES.length}
            className="flex h-16 shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none"
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=128`}
              alt={i >= SOURCES.length ? "" : `${source.name} logo`}
              loading="lazy"
              className="h-8 w-8 rounded-md object-contain"
              onError={(e) => {
                // Hide the broken image; the wordmark next to it carries on.
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="whitespace-nowrap text-sm font-black tracking-tight text-slate-700 dark:text-slate-200">
              {source.name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
