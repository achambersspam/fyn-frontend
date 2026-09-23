export type ErrorLike = {
  message?: string;
  status?: number;
  code?: string;
  details?: unknown;
};

const SESSION_EXPIRED = "Your session expired. Please sign in again.";
const RATE_LIMITED = "You're going a bit fast. Try again in a moment.";
const SERVER_ERROR = "Something went wrong on our end. We've been notified.";
const OFFLINE = "You appear to be offline. Check your connection.";
const GENERIC = "Something went wrong. Please try again.";
const QUOTA_EXHAUSTED = "You've used all of this month's instant generations.";
const UPGRADE_REQUIRED = "Instant generation is a paid feature. Upgrade to continue.";
const TIER_LIMIT = "You've reached your plan's limit. Upgrade for more.";

const LEAK_PATTERN =
  /PGRST|permission denied|violates|sk_live|sk_test|row-level|JWT|syntax error|relation "|column "|SELECT\s+.+\s+FROM\s+/i;

const looksLikeInternalLeak = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return LEAK_PATTERN.test(trimmed);
};

const asText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }
  return "";
};

export function errorMessage(err: unknown, fallback = GENERIC): string {
  const parsed: ErrorLike =
    err && typeof err === "object" ? (err as ErrorLike) : { message: asText(err) };
  const status = typeof parsed.status === "number" ? parsed.status : undefined;
  const code = typeof parsed.code === "string" ? parsed.code : "";
  const raw = asText(parsed.message);

  if (code === "OFFLINE") {
    return OFFLINE;
  }
  if (status === 0 && typeof navigator !== "undefined" && navigator.onLine === false) {
    return OFFLINE;
  }

  if (code === "SESSION_EXPIRED" || status === 401) {
    return SESSION_EXPIRED;
  }
  if (code === "QUOTA_EXHAUSTED") {
    return QUOTA_EXHAUSTED;
  }
  if (code === "UPGRADE_REQUIRED") {
    return UPGRADE_REQUIRED;
  }
  if (code === "TIER_LIMIT") {
    return TIER_LIMIT;
  }
  if (code === "NEWSLETTER_EDIT_LIMIT") {
    return (
      raw ||
      "You can edit this newsletter 4 times every 7 days. Try again when a save slot opens."
    );
  }
  if (code === "VALIDATION_ERROR") {
    const details = parsed.details;
    const lines = Array.isArray(details)
      ? details.filter((item): item is string => typeof item === "string" && !looksLikeInternalLeak(item))
      : [];
    if (lines.length > 0) return lines.join(" ");
  }
  if (status === 429 || code === "RATE_LIMIT") {
    return RATE_LIMITED;
  }
  if (typeof status === "number" && status >= 500) {
    return SERVER_ERROR;
  }
  if (code === "API_CONNECTION_FAILED") {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return OFFLINE;
    }
    return "We couldn't reach the server. Please try again.";
  }

  if (!raw || looksLikeInternalLeak(raw)) {
    return fallback || GENERIC;
  }

  return raw;
}
