"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentSession } from "@/lib/supabase";
import PublicSiteNav from "@/components/PublicSiteNav";
import PublicSiteFooter from "@/components/PublicSiteFooter";
import RotatingGlobe from "@/components/RotatingGlobe";
import ScrollScrubVideo from "@/components/ScrollScrubVideo";
import SourceLogoMarquee from "@/components/SourceLogoMarquee";
import SampleIssuePreview from "@/components/SampleIssuePreview";

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

  // Reveal-on-scroll: below-the-fold elements marked with data-reveal slide
  // in as they enter the viewport instead of animating on page load.
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
                src="/applogo-wave.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-label="The For You Newsletter animated logo"
                className="animate-fade-up delay-200 relative z-10 mx-auto h-auto w-full max-w-md rounded-3xl object-contain drop-shadow-[0_18px_40px_rgba(28,176,246,0.45)]"
              />
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
            className="absolute inset-x-0 bottom-0 h-24 w-full text-sky-50 dark:text-slate-950"
          >
            <path
              fill="currentColor"
              d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
            />
          </svg>
        </section>

        {/* ================= GLOBE SECTION — alternates: text left, globe right ================= */}
        <section className="relative overflow-hidden bg-sky-50 py-20 dark:bg-slate-950">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(28,176,246,0.14), transparent 60%)",
            }}
          />
          <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <h2 data-reveal className="text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl">
                News around the world,{" "}
                <span className="text-gradient-brand">for you.</span>
              </h2>
              <p data-reveal className="reveal-delay-100 mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-300 lg:mx-0">
                Your teams, your cities, your coins — wherever they are on the
                map. One personalized briefing, delivered daily, built from
                verified sources around the globe.
              </p>
              <Link
                data-reveal
                href="/auth"
                className="reveal-delay-200 mt-7 inline-flex rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-white dark:text-slate-900"
              >
                Get Started — it&apos;s free
              </Link>
            </div>
            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <RotatingGlobe maxSize={420} />
            </div>
          </div>
        </section>

        {/* ================= TRUSTED SOURCES MARQUEE ================= */}
        <section className="border-y border-slate-100 bg-white py-10 dark:border-slate-900 dark:bg-slate-950">
          <p data-reveal className="mb-5 text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Grounded in real reporting from
          </p>
          <SourceLogoMarquee />
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 data-reveal className="text-center text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
            How It Works
          </h2>
          <div data-reveal className="reveal-delay-100 mt-8 grid gap-5 md:grid-cols-3">
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

        {/* ================= SAMPLE ISSUE PREVIEW ================= */}
        <section id="preview" className="scroll-mt-20 border-y border-slate-100 bg-slate-50 py-16 dark:border-slate-900 dark:bg-slate-950/60">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="text-center lg:text-left">
              <h2 data-reveal className="text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
                See what lands in your inbox.
              </h2>
              <p data-reveal className="reveal-delay-100 mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-300 lg:mx-0">
                One clean issue with only your sections — your tickers with
                honest market notes, your team&apos;s actual score, your
                cities&apos; forecasts. Nothing you didn&apos;t ask for.
              </p>
              <Link
                data-reveal
                href="/auth"
                className="reveal-delay-200 btn-premium mt-7 inline-flex"
              >
                Get Started — it&apos;s free
              </Link>
            </div>
            <div data-reveal className="reveal-delay-100">
              <SampleIssuePreview />
            </div>
          </div>
        </section>

        {/* ================= SCROLL-SCRUBBED MAILBOX ANIMATION ================= */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950">
          <ScrollScrubVideo src="/mailbox-pigeon.mp4">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                Your pigeon is on the way.
              </h2>
            </div>
          </ScrollScrubVideo>
        </section>

        {/* ================= CLOSING CTA ================= */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div data-reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-14 text-center shadow-2xl shadow-primary/25">
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
