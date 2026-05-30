export type Tier = "basic" | "minimum" | "premium";

export type Profile = {
  id: string;
  email: string;
  name?: string;
  tier: Tier;
  onboarding_complete: boolean;
  subscription_status?: string;
  cancel_at_period_end?: boolean;
  subscription_current_period_end?: string;
  ads_enabled?: boolean;
  timezone?: string;
  referral_source?: string;
  referral_other?: string;
  is_unsubscribed?: boolean;
  unsubscribed_at?: string;
  resubscribed_at?: string;
  created_at?: string;
};

export type NewsletterTopic = {
  id?: string;
  topic: string;
  specific_details?: string;
  allocated_seconds: number;
  canonical_entity?: string;
  display_name?: string;
  sport?: string;
  league?: string;
  provider?: string;
  provider_team_code?: string;
  provider_team_id?: number;
  resolution_type?: string;
  resolution_confidence?: number;
  resolution_status?: string;
  is_ambiguous?: boolean;
  is_locked?: boolean;
  entity_type?: string;
  resolution_version?: number;
  resolved_at?: string;
  user_input?: string;
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
  schedule_weekday?: number;
  monthly_day_of_month?: number;
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
  schedule_weekday?: number;
  monthly_day_of_month?: number;
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
  unlocked_badges?: string[];
  badges?: Array<{
    id: string;
    threshold_days: number;
    label: string;
    unlocked: boolean;
    asset_url?: string | null;
    locked_asset_url?: string | null;
  }>;
};

export type FeedbackPost = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  author_label?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
  votes: { up: number; down: number };
  user_vote: number;
  approved_comment_count: number;
  is_owner: boolean;
};

export type FeedbackComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  is_owner: boolean;
};

export type SubscriptionInfo = {
  tier: Tier;
  plan?: "free" | "plus" | "premium";
  status: string;
  stripe_subscription_status?: string | null;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  trial_end?: string;
  ads_enabled?: boolean;
  limits?: {
    max_newsletters: number;
    max_topics: number;
    weekend_delivery_allowed: boolean;
  };
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
    maxReadTimeMin: 5,
    minReadTimeMin: 1,
    deliveryWindowStart: 9,
    deliveryWindowEnd: 17,
    incrementMinutes: 60,
  },
  minimum: {
    maxNewsletters: 2,
    maxTopics: 6,
    maxReadTimeMin: 10,
    minReadTimeMin: 1,
    deliveryWindowStart: 6,
    deliveryWindowEnd: 21,
    incrementMinutes: 30,
  },
  premium: {
    maxNewsletters: 5,
    maxTopics: 6,
    maxReadTimeMin: 15,
    minReadTimeMin: 1,
    deliveryWindowStart: 0,
    deliveryWindowEnd: 23,
    incrementMinutes: 15,
  },
};
