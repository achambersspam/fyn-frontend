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
      </main>
      <PublicSiteFooter />
    </div>
  );
}

