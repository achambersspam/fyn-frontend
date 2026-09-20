"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_EVENT,
  isAnalyticsAllowed,
} from "@/lib/cookieConsent";

let sentryInitialized = false;
let posthogInitialized = false;

export default function ObservabilityBootstrap() {
  useEffect(() => {
    const startSentry = async () => {
      if (sentryInitialized || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;
      sentryInitialized = true;
      try {
        const Sentry = await import("@sentry/nextjs");
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0.2),
          environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
        });
      } catch (error) {
        sentryInitialized = false;
        console.warn("SENTRY_BOOTSTRAP_SKIPPED", error);
      }
    };

    const startPosthog = async () => {
      if (posthogInitialized || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
      if (!isAnalyticsAllowed()) return;
      posthogInitialized = true;
      try {
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
      } catch (error) {
        posthogInitialized = false;
        console.warn("POSTHOG_BOOTSTRAP_SKIPPED", error);
      }
    };

    void startSentry();
    void startPosthog();

    const onConsent = () => {
      void startPosthog();
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
    };
  }, []);

  return null;
}
