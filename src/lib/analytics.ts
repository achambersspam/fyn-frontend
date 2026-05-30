import posthog from "posthog-js";
import { api } from "@/lib/api";

const SENSITIVE_KEY_PATTERN =
  /password|token|secret|authorization|cookie|html|body|specific_details|details|raw/i;

const sanitizeProperties = (properties: Record<string, unknown>) => {
  const sanitized: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(properties || {})) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue;
    if (typeof value === "string") {
      sanitized[key] = value.slice(0, 180);
      continue;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
      continue;
    }
    if (value === null) {
      sanitized[key] = null;
      continue;
    }
  }
  return sanitized;
};

export const trackEvent = (
  eventName: string,
  properties: Record<string, unknown> = {}
) => {
  const safeProperties = sanitizeProperties(properties);
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
      posthog.capture(eventName, safeProperties);
    } catch {
      // analytics should never block user flow
    }
  }

  // Fire and forget. Never block user interaction on analytics transport.
  void api
    .post(
      "/api/analytics/event",
      {
        event_name: eventName,
        event_version: 1,
        source: "web",
        properties: safeProperties,
      },
      { requireAuth: false }
    )
    .catch(() => {
      // analytics should never block user flow
    });
};

export const identifyUser = (
  userId: string,
  properties: Record<string, unknown> = {}
) => {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !userId) return;
  const safeProperties = sanitizeProperties(properties);
  posthog.identify(userId, safeProperties);
};

export const resetAnalyticsIdentity = () => {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.reset();
};
