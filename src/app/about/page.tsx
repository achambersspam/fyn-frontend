"use client";

import { useEffect, useState } from "react";
import PublicSiteNav from "@/components/PublicSiteNav";
import PublicSiteFooter from "@/components/PublicSiteFooter";
import { getCurrentSession } from "@/lib/supabase";

export default function AboutPage() {
  const [settingsHref, setSettingsHref] = useState("/auth?mode=signin");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const session = await getCurrentSession();
      if (!cancelled && session?.access_token) {
        setSettingsHref("/settings");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicSiteNav settingsHref={settingsHref} />
      <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100">About For You Newsletter</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
            Our mission is simple: help people stay informed without drowning in noise. For You Newsletter
            lets each user choose exactly what they care about and receive a clean, focused update in one
            place.
          </p>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            We prioritize relevance, readability, and practical structure across every section from finance
            and weather to sports, entertainment, and beyond.
          </p>
        </div>

        {/* Trust strip — real product facts only; swap in reader testimonials
            once we have genuine ones post-launch. */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["10+", "news sources, every feed live-verified — dead feeds get replaced, not ignored"],
            ["1", "focused issue a day, built only from the topics and details you picked"],
            ["2", "places it lands: your inbox and your dashboard, always the same issue"],
          ].map(([stat, body]) => (
            <div
              key={stat}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-4xl font-black text-primary">{stat}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">How we keep it honest</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Every summary is grounded in named, verified reporting — real publications, real events, real
            numbers. When coverage on your topic is thin, your issue says so in one plain sentence instead
            of padding it out with filler. Closed-market stock prices are labeled as of last close, and
            sports sections only cover the exact teams you chose.
          </p>
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}

