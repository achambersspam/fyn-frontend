"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentSession } from "@/lib/supabase";
import PublicSiteNav from "@/components/PublicSiteNav";
import PublicSiteFooter from "@/components/PublicSiteFooter";
import RotatingGlobe from "@/components/RotatingGlobe";

// Floating brand imagery around the hero — real logo-library assets, not
// generic topic icons. Varied float/wiggle timing so the cluster reads as
// lively rather than synchronized, the same trick Duolingo's animated hero
// illustrations use. These are placeholders for the Higgsfield-animated
// versions of the same logos, coming next.
const HERO_FLOATERS: Array<{
  src: string;
  alt: string;
  className: string;
  anim: string;
}> = [
  { src: "/pigeon-outline.svg", alt: "", className: "left-[8%] top-[10%] bg-sky-100 dark:bg-sky-900/40", anim: "animate-float-a" },
  { src: "/logo-envelope.png", alt: "", className: "right-[8%] top-[10%] bg-white dark:bg-slate-800", anim: "animate-float-b delay-200" },
  { src: "/pigeon-filled.svg", alt: "", className: "left-[4%] bottom-[16%] bg-amber-50 dark:bg-slate-800", anim: "animate-wiggle delay-100" },
];

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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicSiteNav settingsHref={settingsHref} />
      <main>
        {/* ================= HERO — video left, text right (Duolingo split) ================= */}
        <section className="relative overflow-hidden pb-24 pt-16 sm:pb-32">
          <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            {/* Video: first in DOM so it shows on top on mobile, left column on desktop */}
            <div className="order-1 relative mx-auto w-full max-w-xl lg:mx-0">
              <div
                aria-hidden
                className="animate-glow-pulse absolute inset-0 mx-auto h-56 w-56 rounded-full bg-primary/25 blur-3xl sm:h-72 sm:w-72"
              />
              <video
                src="/pigeon-wave.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-label="The For You Newsletter pigeon mascot waving hello"
                className="animate-fade-up delay-200 relative z-10 mx-auto aspect-video w-full rounded-3xl object-cover drop-shadow-[0_18px_40px_rgba(28,176,246,0.45)]"
              />
              {HERO_FLOATERS.map((floater) => (
                <span
                  key={floater.src}
                  aria-hidden
                  className={`absolute flex h-14 w-14 items-center justify-center rounded-2xl p-2 shadow-lg ${floater.anim} ${floater.className}`}
                >
                  <img src={floater.src} alt={floater.alt} className="h-full w-full object-contain" />
                </span>
              ))}
            </div>

            {/* Text: second in DOM so it shows below on mobile, right column on desktop */}
            <div className="order-2 text-center lg:text-left">
              <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark dark:text-sky-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Personalized AI Newsletter
              </p>
              <h1 className="animate-fade-up delay-100 mt-5 text-5xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
                News that&apos;s{" "}
                <span className="text-gradient-brand">actually for you.</span>
              </h1>
              <p className="animate-fade-up delay-200 mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 lg:mx-0">
                Pick the topics and the exact details you care about. Every day our
                pigeon delivers one clean, focused digest — to your inbox and your
                dashboard. No noise, no filler.
              </p>
              <div className="animate-fade-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link href="/auth" className="btn-premium">
                  Get Started — it&apos;s free
                </Link>
                <Link href="/auth?mode=signin" className="btn-ghost-premium">
                  Log In
                </Link>
              </div>
              <p className="animate-fade-up delay-500 mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>

          {/* Curved color transition into the next section, Duolingo-hill style */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-primary/10 dark:to-primary/15"
          />
          <svg
            aria-hidden
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-24 w-full text-slate-950"
          >
            <path
              fill="currentColor"
              d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
            />
          </svg>
        </section>

        {/* ================= GLOBE SECTION — alternates: text left, globe right ================= */}
        <section className="relative overflow-hidden bg-slate-950 py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(28,176,246,0.22), transparent 60%)",
            }}
          />
          <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <h2 className="animate-fade-up text-4xl font-black leading-tight text-white sm:text-5xl">
                News around the world,{" "}
                <span className="text-gradient-brand">for you.</span>
              </h2>
              <p className="animate-fade-up delay-100 mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-300 lg:mx-0">
                Your teams, your cities, your coins — wherever they are on the
                map. One personalized briefing, delivered daily, built from
                verified sources around the globe.
              </p>
              <Link
                href="/auth"
                className="animate-fade-up delay-200 mt-7 inline-flex rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Get Started — it&apos;s free
              </Link>
            </div>
            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <RotatingGlobe maxSize={420} />
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
            How It Works
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["1", "Choose your topics", "Select only the sections you want in your newsletter.", null],
              [
                "2",
                "Add details that make it yours",
                "Pick subtopics, symbols, teams, cities, and preference presets.",
                "/logo-pigeon-instructions-details.svg",
              ],
              ["3", "Receive in app and email", "Read from your dashboard and get the same issue in your inbox.", null],
            ].map(([step, title, body, image]) => (
              <article
                key={step}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-black text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  {step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
                {image && (
                  <img
                    src={image}
                    alt=""
                    aria-hidden
                    className="animate-float-a mt-4 h-24 w-24 object-contain"
                  />
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ================= ALTERNATING FEATURE: grounded output ================= */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="relative mx-auto flex w-full max-w-sm justify-center">
              <div
                aria-hidden
                className="animate-glow-pulse absolute inset-0 mx-auto h-48 w-48 rounded-full bg-primary/20 blur-3xl"
              />
              <div className="relative w-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-primary/10 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tech &amp; AI
                  </span>
                </div>
                <div className="mt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <p className="leading-relaxed">
                    Meta launched new AI coding tools to rival Anthropic and
                    OpenAI, while the Commerce Department extended export
                    controls on advanced models.
                  </p>
                  <div className="animate-bounce-soft inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Grounded in named sources
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
                Real sources. No filler.
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-300 lg:mx-0 mx-auto">
                Every summary is grounded in verified reporting — named
                publications, real events, real numbers. When the news is
                thin, we say so honestly instead of padding it out.
              </p>
            </div>
          </div>
        </section>

        {/* ================= ALTERNATING FEATURE: daily delivery ================= */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
                Delivered your way, every day.
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-300 lg:mx-0 mx-auto">
                Set your delivery time and your pigeon takes it from there —
                the same issue waiting in your dashboard and your inbox, ready
                the moment you want it.
              </p>
            </div>
            <div className="order-1 relative mx-auto flex w-full max-w-sm justify-center lg:order-2">
              <div
                aria-hidden
                className="animate-glow-pulse absolute inset-0 mx-auto h-48 w-48 rounded-full bg-primary/20 blur-3xl"
              />
              <img
                src="/logo-envelope.png"
                alt="The For You Newsletter pigeon delivering your daily issue by email"
                className="animate-float-b relative h-48 w-48 object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* ================= FEATURE HIGHLIGHT TILES ================= */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
            Everything, exactly the way you want it
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["🎯", "Personalized topic and detail selection", "bg-sky-100 dark:bg-sky-900/40"],
              ["📬", "In-app dashboard and email delivery", "bg-emerald-100 dark:bg-emerald-900/40"],
              ["📊", "Stock, weather, sports, crypto, and more", "bg-amber-100 dark:bg-amber-900/40"],
              ["🧠", "Readable summaries with structure and context", "bg-violet-100 dark:bg-violet-900/40"],
            ].map(([icon, feature, bg]) => (
              <div
                key={feature}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${bg}`}>
                  {icon}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CLOSING CTA ================= */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-14 text-center shadow-2xl shadow-primary/25">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <img
              src="/pigeon-outline.svg"
              alt=""
              aria-hidden
              className="animate-float-a absolute left-[10%] top-6 h-10 w-10 opacity-80"
            />
            <video
              src="/pigeon-wave.mp4"
              autoPlay
              loop
              muted
              playsInline
              aria-hidden
              className="relative z-10 mx-auto mb-5 h-20 w-20 rounded-2xl object-cover drop-shadow-lg"
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
