// Shape of GET /api/admin/overview and GET /api/admin/events (founder dashboard).

export type CountByDay = { date: string; count: number };
export type EventCounts = Record<string, number>;

export type AdminOverview = {
  generatedAt: string;
  users: {
    total: number;
    new24h: number;
    new7d: number;
    new30d: number;
    unsubscribed: number;
    withNewsletter: number;
    activationRate: number;
    avgNewslettersPerUser: number;
    signupsByDay: CountByDay[];
  };
  paying: {
    total: number;
    trialing: number;
    pastDue: number;
    byTier: Array<{ tier: string; label: string; count: number }>;
    tierCounts: Record<string, number>;
    estMonthlyRevenueUsd: number;
    conversionRate: number;
  };
  cancellations: {
    pendingAtPeriodEnd: number;
    canceledTotal: number;
    canceled30d: number;
    reasons: Array<{ reason: string; count: number }>;
    recent: Array<{ at: string; email: string; reason: string; detail: string }>;
    newsletterOffReasons: Array<{ reason: string; count: number }>;
    newsletterOffRecent: Array<{ at: string; email: string; reason: string; detail: string }>;
  };
  topics: {
    usersPerTopic: Array<{ topic: string; users: number; newsletters: number }>;
    topEntities: Array<{ name: string; users: number }>;
    topTickers: Array<{ symbol: string; users: number }>;
  };
  issues: {
    last30d: number;
    sent: number;
    failed: number;
    failureRate: number;
    firstIssueSuccessRate: number | null;
    perDay: Array<{ date: string; generated: number; sent: number; failed: number }>;
    topFailureReasons: Array<{ reason: string; count: number }>;
  };
  engagement: {
    opens30d: number;
    openRate: number | null;
    clicks30d: number;
    inAppReads30d: number;
    active1d: number;
    active7d: number;
    active30d: number;
  };
  referrals: {
    answered: number;
    answeredRate: number;
    bySource: Array<{ source: string; count: number }>;
    otherAnswers: Array<{ at: string; email: string; text: string }>;
  };
  health: { last24h: EventCounts; last7d: EventCounts; last30d: EventCounts };
  other: {
    pausedNewsletters: number;
    planDisabledNewsletters: number;
    frequency: Array<{ frequency: string; count: number }>;
    marketingOptIn: number;
    feedbackPending: number;
    feedbackTotal: number;
  };
};

export type AdminEvent = {
  id: string;
  at: string;
  type: string;
  severity: string;
  topic: string | null;
  source: string | null;
  message: string | null;
  detail: Record<string, unknown>;
  newsletter_id: string | null;
  user_id: string | null;
  user_email: string | null;
};

export type AdminEventsResponse = { type: string; days: number; events: AdminEvent[] };

/** Human names for every error/fallback type the dashboard can show. */
export const EVENT_TYPE_INFO: Record<string, { label: string; help: string }> = {
  rss_fallback: {
    label: "RSS fallbacks",
    help: "GNews had too little to use, so this topic was built from RSS instead.",
  },
  gnews_blocked: { label: "GNews blocked", help: "GNews rate-limited us or the daily request quota ran out." },
  story_layer_error: { label: "Source errors", help: "An unexpected error while fetching news." },
  no_coverage: { label: "No-coverage notes", help: 'The reader saw "unable to get any coverage" for a topic.' },
  topic_error: { label: "Topic errors", help: "A topic failed while generating." },
  issue_failed: { label: "Failed newsletters", help: "A whole newsletter issue failed to generate." },
};

export const EVENT_TYPE_ORDER = [
  "issue_failed",
  "topic_error",
  "story_layer_error",
  "gnews_blocked",
  "rss_fallback",
  "no_coverage",
];
