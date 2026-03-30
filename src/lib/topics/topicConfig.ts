export type TopicOption = {
  label: string;
  description: string;
};

export const TOPIC_OPTIONS: TopicOption[] = [
  {
    label: "Stock Market",
    description: "Follow your favorite stocks or the whole market with real-time insights",
  },
  {
    label: "Tech & AI",
    description: "Major breakthroughs, startups, and innovations in technology and AI",
  },
  {
    label: "World News",
    description: "Stay updated on the most important global events shaping the world each day",
  },
  {
    label: "Health & Wellness",
    description: "Fitness, nutrition, and research-backed health insights",
  },
  {
    label: "Sports",
    description: "Updates on your favorite teams, players, and leagues only",
  },
  {
    label: "Entertainment",
    description: "Movies, TV releases, and major entertainment news",
  },
  {
    label: "Crypto News",
    description: "Cryptocurrency markets, blockchain developments, and major updates",
  },
  {
    label: "Weather Forecasts",
    description: "Accurate daily and upcoming weather forecasts for your location",
  },
  {
    label: "Personal Finance",
    description: "Actionable financial tips, savings strategies, and money trends",
  },
  {
    label: "Motivational Quotes/Stories",
    description: "Daily motivation through quotes and short impactful stories",
  },
  {
    label: "Fun Facts",
    description: "Interesting and verified facts across science, history, and more",
  },
  {
    label: "Brain Teaser & Riddles",
    description: "Engaging puzzles, riddles, and mental challenges",
  },
];

export const TOPIC_DETAIL_PLACEHOLDERS: Record<string, string> = {
  "Stock Market": "e.g. Focus on AAPL, TSLA, earnings, and major movers",
  "Tech & AI": "e.g. Focus on AI breakthroughs, OpenAI, and big tech updates",
  "World News":
    "e.g. Focus on Europe, global economy, major events, or positive global stories",
  "Health & Wellness":
    "e.g. Focus on workouts, nutrition, mental health, or fitness trends",
  Sports: "e.g. Focus on college basketball, NFL, your teams, or specific players",
  Entertainment: "e.g. Focus on new movies, TV releases, and trending shows",
  "Crypto News": "e.g. Focus on Bitcoin, Ethereum, regulation, and major crypto moves",
  "Weather Forecasts": "e.g. Enter your city and state (e.g. Charlotte, NC)",
  "Personal Finance":
    "e.g. Saving money, investing basics, credit cards, or budgeting tips",
  "Motivational Quotes/Stories":
    "e.g. Daily motivation, success stories, and mindset tips",
  "Fun Facts": "e.g. History, science, space, or random interesting facts",
  "Brain Teaser & Riddles":
    "e.g. Easy, medium, or hard riddles, logic puzzles, or brain teasers",
};

export const DEFAULT_TOPIC_DETAIL_PLACEHOLDER =
  "e.g. Share specific details you want covered";

export const TOPIC_CONFIG: Record<string, { type: string }> = {
  "Stock Market": { type: "data-heavy" },
  "Tech & AI": { type: "event-driven" },
  "World News": { type: "event-driven" },
  "Health & Wellness": { type: "advice-driven" },
  Sports: { type: "event-driven" },
  Entertainment: { type: "content-driven" },
  "Crypto News": { type: "data-heavy" },
  "Weather Forecasts": { type: "location-driven" },
  "Personal Finance": { type: "advice-driven" },
  "Motivational Quotes/Stories": { type: "inspiration-driven" },
  "Fun Facts": { type: "fact-driven" },
  "Brain Teaser & Riddles": { type: "interactive" },
};
