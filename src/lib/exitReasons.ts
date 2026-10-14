import { api } from "@/lib/api";

/*
 * "Why are you leaving?" reasons, shared by every exit flow (cancel
 * subscription, pause or delete a newsletter). The iOS app keeps an identical
 * copy in src/lib/exitReasons.ts; the backend contract test
 * (npm run validate:content-contracts) fails if the two ever drift.
 *
 * A reason with `followUp` reveals a text box under the options asking that
 * question; reasons without one are a single tap.
 */

export type ExitKind = "cancel_subscription" | "turn_off_newsletter";

export type ExitReason = {
  id: string;
  label: string;
  /** Shown above the text box once this reason is picked. */
  followUp?: string;
  placeholder?: string;
};

export const MAX_EXIT_DETAIL = 500;

export const EXIT_REASONS: Record<ExitKind, ExitReason[]> = {
  cancel_subscription: [
    {
      id: "too_expensive",
      label: "It's too expensive",
      followUp: "What would be a price point you would be comfortable with?",
      placeholder: "For example: $3 per month",
    },
    {
      id: "not_using_enough",
      label: "I'm not using it enough",
      followUp: "What would make it worth using more often?",
      placeholder: "Tell us what would help",
    },
    {
      id: "content_quality",
      label: "The newsletters aren't good enough",
      followUp: "What was missing or wrong? Which topics disappointed you?",
      placeholder: "Be as specific as you like",
    },
    {
      id: "missing_features",
      label: "It's missing something I need",
      followUp: "What feature or topic were you hoping for?",
      placeholder: "Tell us what's missing",
    },
    {
      id: "found_alternative",
      label: "I found an alternative",
      followUp: "Which alternative are you switching to, and what does it do better?",
      placeholder: "The name of the product or service",
    },
    {
      id: "technical_problems",
      label: "I had technical problems",
      followUp: "What went wrong?",
      placeholder: "Describe the problem",
    },
    { id: "taking_a_break", label: "I'm just taking a break" },
    {
      id: "other",
      label: "Something else",
      followUp: "Tell us more about why you're cancelling.",
      placeholder: "Your reason",
    },
  ],
  turn_off_newsletter: [
    {
      id: "too_many_emails",
      label: "I get too many emails",
      followUp: "How often would you like to hear from us?",
      placeholder: "For example: only on weekdays",
    },
    {
      id: "not_relevant",
      label: "It isn't relevant to me",
      followUp: "Which topics would you rather read about?",
      placeholder: "Topics you care about",
    },
    {
      id: "content_quality",
      label: "The content isn't good enough",
      followUp: "What could be better?",
      placeholder: "Be as specific as you like",
    },
    {
      id: "wrong_time",
      label: "It arrives at the wrong time",
      followUp: "When would you like to receive it?",
      placeholder: "For example: 7am on weekdays",
    },
    { id: "taking_a_break", label: "I'm just taking a break" },
    { id: "replacing", label: "I'm replacing it with a different newsletter" },
    {
      id: "other",
      label: "Something else",
      followUp: "Tell us more.",
      placeholder: "Your reason",
    },
  ],
};

export type ExitSelection = {
  reasonId: string | null;
  label: string | null;
  detail: string;
};

/** One line for places that only take a string (e.g. Stripe's cancellation comment). */
export const formatExitReason = (selection: ExitSelection): string => {
  if (!selection.label) return "";
  const detail = selection.detail.trim();
  return detail ? `${selection.label} - ${detail}` : selection.label;
};

/**
 * Stores the answer in OUR database only (analytics_events). Free text is
 * deliberately not sent through trackEvent, which also forwards to PostHog.
 * Never blocks or fails the user's action.
 */
export const submitExitFeedback = (
  kind: ExitKind,
  selection: ExitSelection,
  newsletterId?: string | null,
  /** false when the newsletter is being deleted (the row will not exist to link to). */
  linkNewsletter = true
): void => {
  if (!selection.reasonId) return;
  void api
    .post("/api/analytics/event", {
      event_name: "exit_feedback",
      event_version: 1,
      source: "web",
      newsletter_id: linkNewsletter ? newsletterId || undefined : undefined,
      properties: {
        kind,
        newsletter_ref: newsletterId || null,
        reason_id: selection.reasonId,
        reason_label: selection.label,
        reason_detail: selection.detail.trim().slice(0, MAX_EXIT_DETAIL),
      },
    })
    .catch(() => {
      // feedback must never block cancelling or turning something off
    });
};
