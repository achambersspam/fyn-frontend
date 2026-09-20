"use client";

/* eslint-disable @next/next/no-img-element */

// The actual outlets our grounding pipeline pulls from (see
// the-final-fyn-backend/lib/sources/news.ts). Favicons are checked into
// public/source-logos so the landing page does not fan out to external logo
// services on every visit. The `name` doubles as alt text and wordmark.
const SOURCES: Array<{ name: string; domain: string; logo: string }> = [
  { name: "ESPN", domain: "espn.com", logo: "/source-logos/espn.png" },
  { name: "BBC", domain: "bbc.com", logo: "/source-logos/bbc.png" },
  { name: "The Guardian", domain: "theguardian.com", logo: "/source-logos/theguardian.png" },
  { name: "The New York Times", domain: "nytimes.com", logo: "/source-logos/nytimes.png" },
  { name: "Ars Technica", domain: "arstechnica.com", logo: "/source-logos/arstechnica.png" },
  { name: "The Verge", domain: "theverge.com", logo: "/source-logos/theverge.png" },
  { name: "Yahoo Finance", domain: "finance.yahoo.com", logo: "/source-logos/finance-yahoo.png" },
  { name: "Yahoo Sports", domain: "sports.yahoo.com", logo: "/source-logos/sports-yahoo.png" },
  { name: "CoinDesk", domain: "coindesk.com", logo: "/source-logos/coindesk.png" },
  { name: "Cointelegraph", domain: "cointelegraph.com", logo: "/source-logos/cointelegraph.png" },
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
              src={source.logo}
              alt={i >= SOURCES.length ? "" : `${source.name} logo`}
              loading="lazy"
              className="h-8 w-8 rounded-md object-contain"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.dataset.fallbackAttempted) {
                  // Hide the broken image; the wordmark next to it carries on.
                  img.style.display = "none";
                  return;
                }
                img.dataset.fallbackAttempted = "true";
                img.src = `https://www.google.com/s2/favicons?domain=${source.domain}&sz=128`;
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
