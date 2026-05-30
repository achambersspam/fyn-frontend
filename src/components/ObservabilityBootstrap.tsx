"use client";

import { useEffect } from "react";

let initialized = false;

export default function ObservabilityBootstrap() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const bootstrap = async () => {
      try {
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
          const Sentry = await import("@sentry/nextjs");
          Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0.2),
            environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
          });
        }
      } catch (error) {
        console.warn("SENTRY_BOOTSTRAP_SKIPPED", error);
      }

      try {
        if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
          const { default: posthog } = await import("posthog-js");
          posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
            person_profiles: "identified_only",
            capture_pageview: true,
            capture_pageleave: true,
            disable_session_recording: false,
            autocapture: true,
          });
          window.addEventListener("error", () => {
            posthog.capture("app_error_seen", {
              source: "window.onerror",
            });
          });
        }
      } catch (error) {
        console.warn("POSTHOG_BOOTSTRAP_SKIPPED", error);
      }
    };

    void bootstrap();
  }, []);

  return null;
}
