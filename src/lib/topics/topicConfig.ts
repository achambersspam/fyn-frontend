export type TopicOption = {
  label: string;
  description: string;
  icon: string;
};

export const TOPIC_OPTIONS: TopicOption[] = [
  {
    label: "Stock Market",
    description: "Follow your favorite stocks or the whole market with real-time insights",
    icon: "TrendingUp",
  },
  {
    label: "Tech & AI",
    description: "Major breakthroughs, startups, and innovations in technology and AI",
    icon: "Cpu",
  },
  {
    label: "World News",
    description: "Updates on global events and political news",
    icon: "Globe",
  },
  {
    label: "Health & Wellness",
    description: "Fitness, nutrition, and research-backed health insights",
    icon: "Heart",
  },
  {
    label: "Sports",
    description: "Updates on your favorite college or professional teams, players, and leagues",
    icon: "Trophy",
  },
  {
    label: "Entertainment",
    description: "Movies & TV releases, and other major entertainment news",
    icon: "Sparkles",
  },
  {
    label: "Crypto News",
    description: "Cryptocurrency markets, blockchain developments, and major crypto updates",
    icon: "Bitcoin",
  },
  {
    label: "Weather Forecasts",
    description: "Accurate daily and upcoming weather forecasts for your location",
    icon: "Sun",
  },
  {
    label: "Personal Finance",
    description: "Actionable financial tips, savings strategies, and money trends",
    icon: "Landmark",
  },
  {
    label: "Motivational Quotes/Stories",
    description: "Daily motivation through quotes and short impactful stories",
    icon: "Zap",
  },
  {
    label: "Fun Facts",
    description: "Interesting and verified facts across science, history, and more",
    icon: "Target",
  },
  {
    label: "Brain Teaser & Riddles",
    description: "Engaging puzzles, riddles, and mental challenges",
    icon: "Brain",
  },
];

export const TOPIC_DETAIL_PLACEHOLDERS: Record<string, string> = {
  "Stock Market": "Type Your Details Here: Focus on AAPL, TSLA, earnings, and major movers",
  "Tech & AI": "Type Your Details Here: Focus on AI breakthroughs, OpenAI, and big tech updates",
  "World News":
    "Type Your Details Here: Focus on Europe, global economy, major events, or positive global stories",
  "Health & Wellness":
    "Type Your Details Here: Focus on workouts, nutrition, mental health, or fitness trends",
  Sports: "Type Your Details Here: Focus on college basketball, NFL, your teams, or specific players",
  Entertainment: "Type Your Details Here: Focus on new movies, TV releases, and trending shows",
  "Crypto News": "Type Your Details Here: Focus on Bitcoin, Ethereum, industry regulation, and major crypto moves",
  "Weather Forecasts": "Type Your Details Here: Enter your city and state\nExample: Atlanta, Georgia",
  "Personal Finance":
    "Type Your Details Here: Saving money, investing basics, credit cards, or budgeting tips",
  "Motivational Quotes/Stories":
    "Choose quote, story, or mindset styles on Step 2",
  "Fun Facts": "Type Your Details Here: History, science, space, or random interesting facts",
  "Brain Teaser & Riddles":
    "Type Your Details Here: Easy, medium, or hard riddles, logic puzzles, or brain teasers",
};

export const DEFAULT_TOPIC_DETAIL_PLACEHOLDER =
  "Type Your Details Here: Share specific details you want covered";

export const TOPIC_GENERIC_FALLBACK_DETAILS: Record<string, string> = {
  "Stock Market":
    "Show the S&P 500, Nasdaq, AAPL, TSLA, and AMZN. Then give updates on major market movers around the world and notable stock market news.",
  "Tech & AI":
    "Give updates on any new major tech innovations as well as any new AI developments, especially from Anthropic, OpenAI, Gemini, or any brand-new AI tool.",
  "World News":
    "Give updates on major global events as well as big political news from only the most trusted sources. Make sure to give unbiased updates.",
  "Health & Wellness":
    "Give practical and research-backed updates on fitness, nutrition, recovery, sleep, and healthy habits that people can actually apply in daily life.",
  Sports:
    "Give major U.S.-only sports news, whether that is major NCAA teams and sports or major U.S. professional sports leagues like the NFL, NBA, MLB, NHL, and golf news. Focus mainly on men's sports only.",
  Entertainment:
    "Give updates on any new movies coming out or how people are liking new movies and TV shows. Make sure to only give new things within the past month or two.",
  "Crypto News":
    "Cover major cryptocurrency price movements, especially BTC and Ethereum, crypto regulation, and ecosystem news.",
  "Personal Finance":
    "Give quick tips, ideas, and good practices for practical personal finance on saving, budgeting, and investing.",
  "Motivational Quotes/Stories":
    "Provide motivational quotes, short phrases, famous wisdom, and short story-based inspiration depending on selected options.",
  "Fun Facts": "Provide interesting and verified facts across science, history, and culture.",
  "Brain Teaser & Riddles":
    "Give 3 brain teasers or riddles that are fun and easy to medium difficulty.",
};

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
