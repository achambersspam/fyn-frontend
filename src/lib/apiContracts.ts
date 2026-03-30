export type Tier = "basic" | "minimum" | "premium";

export type Profile = {
  id: string;
  email: string;
  name?: string;
  tier: Tier;
  onboarding_complete: boolean;
  subscription_status?: string;
  timezone?: string;
  created_at?: string;
};

export type NewsletterTopic = {
  id?: string;
  topic: string;
  specific_details?: string;
  allocated_seconds: number;
};

export type Newsletter = {
  id: string;
  user_id?: string;
  title?: string;
  email: string;
  topics: NewsletterTopic[];
  primary_goal?: string;
  frequency: string;
  delivery_time: string;
  timezone: string;
  read_time_minutes: number;
  paused: boolean;
  next_send_at_utc?: string;
  created_at?: string;
  updated_at?: string;
};

export type NewsletterCreatePayload = {
  email: string;
  topics: { topic: string; specific_details?: string; allocated_seconds: number }[];
  primary_goal?: string;
  frequency: string;
  delivery_time: string;
  timezone: string;
  read_time_minutes: number;
};

export type NewsletterUpdatePayload = Partial<NewsletterCreatePayload>;

export type NewsletterIssue = {
  id: string;
  newsletter_id: string;
  subject?: string;
  body_html?: string;
  body_text?: string;
  delivered_at?: string;
  generation_status?: "queued" | "generated" | "sent" | "failed";
  scheduled_for_utc?: string;
  is_first_issue?: boolean;
};

export type LatestNewsletter = NewsletterIssue;

export type IssueSource = {
  id: string;
  issue_id: string;
  topic_key: string;
  source_name: string;
  title: string;
  url: string;
  published_at?: string;
};

export type Achievement = {
  current_streak: number;
  longest_streak: number;
  total_reads: number;
  last_7_days: boolean[];
};

export type SubscriptionInfo = {
  tier: Tier;
  status: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
};

export type CheckoutResponse = {
  url: string;
};

export type StripePortalPayload = {
  action: "manage" | "cancel";
  reason?: string;
};

export type TrendingTopic = {
  title: string;
  description: string;
  tag: string;
  category: string;
};

export type ExploreTopic = {
  title: string;
  description: string;
};

export const TIER_LIMITS: Record<
  Tier,
  {
    maxNewsletters: number;
    maxTopics: number;
    maxReadTimeMin: number;
    minReadTimeMin: number;
    deliveryWindowStart: number;
    deliveryWindowEnd: number;
    incrementMinutes: number;
  }
> = {
  basic: {
    maxNewsletters: 1,
    maxTopics: 6,
    maxReadTimeMin: 10,
    minReadTimeMin: 1,
    deliveryWindowStart: 7,
    deliveryWindowEnd: 18,
    incrementMinutes: 60,
  },
  minimum: {
    maxNewsletters: 2,
    maxTopics: 6,
    maxReadTimeMin: 12,
    minReadTimeMin: 1,
    deliveryWindowStart: 6,
    deliveryWindowEnd: 21,
    incrementMinutes: 30,
  },
  premium: {
    maxNewsletters: Infinity,
    maxTopics: Infinity,
    maxReadTimeMin: 25,
    minReadTimeMin: 1,
    deliveryWindowStart: 5,
    deliveryWindowEnd: 22,
    incrementMinutes: 15,
  },
};
