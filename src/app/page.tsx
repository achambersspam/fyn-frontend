"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentSession } from "@/lib/supabase";
import PublicSiteNav from "@/components/PublicSiteNav";
import PublicSiteFooter from "@/components/PublicSiteFooter";

export default function LandingPage() {
  const [settingsHref, setSettingsHref] = useState("/auth?mode=signin");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const session = await getCurrentSession();
      if (!cancelled && session?.access_token) {
        setSettingsHref("/settings");
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicSiteNav settingsHref={settingsHref} />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Ambient brand glow behind the hero */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/25"
          />
          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="space-y-6">
              <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark dark:text-sky-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Personalized AI Newsletter
              </p>
              <h1 className="animate-fade-up delay-100 text-5xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
                News that is{" "}
                <span className="text-gradient-brand">actually for you.</span>
              </h1>
              <p className="animate-fade-up delay-200 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                Pick the topics and the exact details you care about. Every day our
                pigeon delivers one clean, focused digest — to your inbox and your
                dashboard. No noise, no filler.
              </p>
              <div className="animate-fade-up delay-300 flex flex-wrap items-center gap-4 pt-1">
                <Link href="/auth" className="btn-premium">
                  Get Started — it&apos;s free
                </Link>
                <Link href="/auth?mode=signin" className="btn-ghost-premium">
                  Log In
                </Link>
              </div>
              <p className="animate-fade-up delay-500 text-xs font-medium text-slate-400 dark:text-slate-500">
                No credit card required · Cancel anytime
              </p>
            </div>

            {/* Pigeon mascot + floating newsletter preview */}
            <div className="animate-fade-up delay-200 relative mx-auto w-full max-w-md">
              <div
                aria-hidden
                className="animate-glow-pulse absolute inset-0 -z-10 rounded-full bg-primary/30 blur-3xl"
              />
              <div className="animate-float">
                <img
                  src="/pigeon-filled.svg"
                  alt="The For You Newsletter pigeon mascot"
                  className="mx-auto h-40 w-40 drop-shadow-[0_18px_40px_rgba(28,176,246,0.45)]"
                />
              </div>
              <div className="mt-2 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-2xl shadow-primary/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Your Daily Issue
                  </span>
                </div>
                <div className="mt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                  {[
                    ["📈", "Stock Market", "NVDA, TSLA + Japanese market focus", "delay-300"],
                    ["⛅", "Weather", "Charlotte · Atlanta · Scottsdale", "delay-400"],
                    ["🏈", "Sports", "Falcons, Hawks, Georgia Football", "delay-500"],
                  ].map(([icon, title, detail, delay]) => (
                    <div
                      key={title}
                      className={`animate-fade-up flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70 ${delay}`}
                    >
                      <span className="text-base leading-6">{icon}</span>
                      <span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {title}:
                        </span>{" "}
                        <span className="text-slate-600 dark:text-slate-300">{detail}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
            How It Works
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["1", "Choose your topics", "Select only the sections you want in your newsletter."],
              ["2", "Add details that make it yours", "Pick subtopics, symbols, teams, cities, and preference presets."],
              ["3", "Receive in app and email", "Read from your dashboard and get the same issue in your inbox."],
            ].map(([step, title, body]) => (
              <article
                key={step}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-black text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  {step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">About Us</h2>
            <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
              For You Newsletter exists to deliver personalized updates without noise. We focus on helping
              people follow exactly what matters to them in a format they can read quickly every day.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
            Feature Highlights
          </h2>
          <ul className="mt-8 grid gap-4 text-sm text-slate-700 dark:text-slate-300 md:grid-cols-2">
            {[
              "Personalized topic and detail selection",
              "In-app dashboard and email delivery",
              "Stock, weather, sports, crypto, and more",
              "Readable summaries with structure and context",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-all hover:border-primary/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing CTA band */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-14 text-center shadow-2xl shadow-primary/25">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <img
              src="/pigeon-filled.svg"
              alt=""
              aria-hidden
              className="mx-auto mb-5 h-16 w-16 drop-shadow-lg"
            />
            <h2 className="relative text-3xl font-black text-white sm:text-4xl">
              Your newsletter is waiting.
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-white/90">
              Set it up in under two minutes. The pigeon takes it from there.
            </p>
            <Link
              href="/auth"
              className="relative mt-7 inline-flex rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-primary-dark shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Get Started — it&apos;s free
            </Link>
          </div>
        </section>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
