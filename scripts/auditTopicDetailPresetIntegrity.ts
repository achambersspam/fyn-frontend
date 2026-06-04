import { TOPIC_DETAIL_PRESET_AUDIT_DATA } from "../src/components/topic-details/TopicDetailEditor";
import { normalizeTopicDetailsForSave } from "../src/lib/topics/normalizeTopicDetailsForSave";
import { validateTopicDetailsPreflight } from "../src/lib/topics/validateTopicDetails";

type AuditFailure = {
  topic: string;
  detail: string;
  reason: string;
};

const failures: AuditFailure[] = [];

const checkTopicDetail = (topic: string, detail: string) => {
  const normalized = normalizeTopicDetailsForSave(topic, detail);
  if (!normalized || !normalized.trim()) {
    failures.push({ topic, detail, reason: "normalizeTopicDetailsForSave returned empty" });
    return;
  }
  const preflight = validateTopicDetailsPreflight({ [topic]: normalized });
  if (preflight.length > 0) {
    failures.push({
      topic,
      detail,
      reason: `validateTopicDetailsPreflight failed: ${preflight[0].message}`,
    });
  }
};

const run = () => {
  const {
    TECH_AI_OPTIONS,
    WORLD_NEWS_OPTIONS,
    HEALTH_OPTIONS,
    ENTERTAINMENT_OPTIONS,
    PERSONAL_FINANCE_OPTIONS,
    MOTIVATIONAL_OPTIONS,
    FUN_FACTS_OPTIONS,
    STOCK_THEME_OPTIONS,
    CRYPTO_THEME_OPTIONS,
    PRO_SPORTS,
    GOLF_NEWS_OPTIONS,
    COLLEGE_FOOTBALL_CONFERENCES,
    COLLEGE_BASKETBALL_CONFERENCES,
    COLLEGE_FOOTBALL_TEAMS_BY_CONFERENCE,
    COLLEGE_BASKETBALL_TEAMS_BY_CONFERENCE,
    INDEPENDENT_TEAMS,
    getConferenceNewsLabel,
  } = TOPIC_DETAIL_PRESET_AUDIT_DATA;

  const nonSportsTopics: Array<{ topic: string; options: string[] }> = [
    { topic: "Tech & AI", options: TECH_AI_OPTIONS },
    { topic: "World News", options: WORLD_NEWS_OPTIONS },
    { topic: "Health & Wellness", options: HEALTH_OPTIONS },
    { topic: "Entertainment", options: ENTERTAINMENT_OPTIONS },
    { topic: "Personal Finance", options: PERSONAL_FINANCE_OPTIONS },
    { topic: "Motivational Quotes/Stories", options: MOTIVATIONAL_OPTIONS },
    { topic: "Fun Facts", options: FUN_FACTS_OPTIONS },
  ];

  for (const entry of nonSportsTopics) {
    for (const option of entry.options) {
      checkTopicDetail(entry.topic, option);
    }
  }

  for (const option of STOCK_THEME_OPTIONS) {
    checkTopicDetail("Stock Market", `Symbols: [AAPL] | Themes: [${option}]`);
  }
  for (const option of CRYPTO_THEME_OPTIONS) {
    checkTopicDetail("Crypto News", `Symbols: [BTC] | Themes: [${option}]`);
  }
  checkTopicDetail(
    "Stock Market",
    "Symbols: [NVDA, AMZN, TSLA, S&P 500, Apple stock] | Themes: [American Tech Stock News, Japanese Stock Market News, Oil and Gas News]"
  );

  checkTopicDetail(
    "Weather Forecasts",
    "Charlotte,North Carolina; Scottsdale,Arizona; San Francisco,California"
  );
  for (const count of [1, 2, 3, 4, 5]) {
    for (const difficulty of ["Easy", "Medium", "Hard", "Mixed"]) {
      checkTopicDetail("Brain Teaser & Riddles", `Count: ${count} | Difficulty: ${difficulty}`);
    }
  }

  // Sports audits (all visible preset families and selectors).
  for (const league of PRO_SPORTS) {
    for (const team of league.teams) {
      checkTopicDetail("Sports", `${league.key}: [${team}]`);
    }
  }
  for (const golfOption of GOLF_NEWS_OPTIONS) {
    checkTopicDetail("Sports", `Golf: [${golfOption}]`);
  }
  for (const conference of COLLEGE_FOOTBALL_CONFERENCES) {
    checkTopicDetail("Sports", `College Football Teams: [${getConferenceNewsLabel(conference)}]`);
    const teams = COLLEGE_FOOTBALL_TEAMS_BY_CONFERENCE[conference] || [];
    for (const team of teams) {
      checkTopicDetail("Sports", `College Football Teams: [${team}]`);
    }
  }
  for (const conference of COLLEGE_BASKETBALL_CONFERENCES) {
    checkTopicDetail("Sports", `College Basketball Teams: [${getConferenceNewsLabel(conference)}]`);
    const teams = COLLEGE_BASKETBALL_TEAMS_BY_CONFERENCE[conference] || [];
    for (const team of teams) {
      checkTopicDetail("Sports", `College Basketball Teams: [${team}]`);
    }
  }
  for (const independentTeam of INDEPENDENT_TEAMS) {
    checkTopicDetail("Sports", `College Football Teams: [${independentTeam}]`);
  }

  const totalChecks =
    nonSportsTopics.reduce((sum, item) => sum + item.options.length, 0) +
    STOCK_THEME_OPTIONS.length +
    CRYPTO_THEME_OPTIONS.length +
    PRO_SPORTS.reduce((sum, sport) => sum + sport.teams.length, 0) +
    GOLF_NEWS_OPTIONS.length +
    COLLEGE_FOOTBALL_CONFERENCES.length +
    COLLEGE_BASKETBALL_CONFERENCES.length +
    Object.values(COLLEGE_FOOTBALL_TEAMS_BY_CONFERENCE).reduce((sum, list) => sum + list.length, 0) +
    Object.values(COLLEGE_BASKETBALL_TEAMS_BY_CONFERENCE).reduce((sum, list) => sum + list.length, 0) +
    INDEPENDENT_TEAMS.length +
    22; // stock typed + weather typed multi-word + 20 brain count/difficulty checks

  if (failures.length > 0) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          totalChecks,
          failures: failures.length,
          failedCases: failures.slice(0, 50),
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        totalChecks,
        failures: 0,
      },
      null,
      2
    )
  );
};

run();
