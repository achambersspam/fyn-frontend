export type AuthResponse = {
  token: string;
};

export type Profile = {
  name?: string;
  email?: string;
};

export type Subscription = {
  planName?: string;
  description?: string;
  statusLabel?: string;
  renewalDate?: string;
};

export type NewsletterInput = {
  title: string;
  email: string;
  topics: string[];
  primaryGoal?: string;
  customTopic?: string;
  frequency?: string;
  time?: string;
  readTime?: number;
};

export type Newsletter = {
  id: string;
  createdAt: string;
  title: string;
  topics: string[];
  email?: string;
  primaryGoal?: string;
  customTopic?: string;
  frequency?: string;
  time?: string;
  readTime?: number;
};

export type LatestNewsletter = {
  title: string;
  deliveredAt?: string;
  summary?: string;
  body?: string;
};

export type DashboardData = {
  userName?: string;
  subtitle?: string;
  newsletterTitle?: string;
  newsletterUpdates?: string;
  newsletterReadTime?: string;
  marketTitle?: string;
  marketSummary?: string;
  marketTimestamp?: string;
};

export type TrendingTopic = {
  iconKey?: "Zap" | "TrendingUp" | "Globe" | "BookOpen" | "Heart";
  title: string;
  description: string;
  tag: string;
  category: string;
};

export type ExploreTopic = {
  iconKey?: "Zap" | "TrendingUp" | "Globe" | "BookOpen" | "Heart";
  title: string;
  description: string;
};
