/**
 * Topic set used across the E2E suite.
 *
 * Rules for topic choices here:
 *   - No typed-entry topics (Stock Market, Crypto News) — avoids needing real ticker validation.
 *   - No Weather — avoids needing a real location.
 *   - No Sports — avoids team-selection complexity and offseason variance.
 *   - All three use the preset-chip UI (just click a button, no free text).
 *   - Expected data-testid values match renderSectionByTopic's slug formula:
 *     topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')
 */
export const TEST_TOPICS = [
  {
    label: 'Tech & AI',
    testId: 'section-tech-ai',
    preset: 'AI Breakthroughs',
  },
  {
    label: 'World News',
    testId: 'section-world-news',
    preset: 'U.S. Politics',
  },
  {
    label: 'Health & Wellness',
    testId: 'section-health-wellness',
    preset: 'Sleep and Energy',
  },
] as const;
