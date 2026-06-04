const collapseWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();
const DEFAULT_TOPIC_DETAIL_MAX_LENGTH = 200;
const SPORTS_TOPIC_DETAIL_MAX_LENGTH = 1200;

const canonicalizeSportsText = (value: string): string => {
  const lower = value.toLowerCase();
  if (/\bsec(?:\s+conference)?(?:\s+news)?\b/.test(lower)) {
    return "SEC and NCAA football and basketball news";
  }
  if (
    lower.includes("college and professional basketball") ||
    lower.includes("college and pro basketball") ||
    lower.includes("nba and ncaa basketball") ||
    lower.includes("ncaa and nba basketball")
  ) {
    return "NBA and NCAA basketball news";
  }
  return value;
};

const normalizeStructuredSports = (value: string): string => {
  const segments = value
    .split("|")
    .map((segment) => collapseWhitespace(segment))
    .filter(Boolean);
  const filtered = segments.filter((segment) => {
    const keyMatch = segment.match(/^([^:]+):\s*(.*)$/);
    if (!keyMatch) return true;
    const key = collapseWhitespace(keyMatch[1]).toLowerCase();
    if (key === "enabled") return false;
    const payloadMatch = keyMatch[2].match(/^\[(.*)\]$/);
    if (!payloadMatch) return true;
    const entries = payloadMatch[1]
      .split(",")
      .map((entry) => collapseWhitespace(entry))
      .filter(Boolean);
    return entries.length > 0;
  });
  return filtered.join(" | ");
};

const normalizeWeatherRows = (value: string): string | undefined => {
  const normalizeWeatherCity = (city: string): string => {
    const lower = city.toLowerCase();
    if (lower === 'scotsdale') return 'Scottsdale';
    return city;
  };
  const rows = value
    .split(/[;|\n]+/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const [city, ...rest] = segment.split(",");
      return {
        city: normalizeWeatherCity(collapseWhitespace(city || "")),
        state: collapseWhitespace(rest.join(",")),
      };
    })
    .filter((row) => row.city || row.state)
    .slice(0, 3);
  if (rows.length === 0) return undefined;
  return rows.map((row) => `${row.city},${row.state}`).join("; ");
};

export const normalizeTopicDetailsForSave = (
  topic: string,
  raw: string | undefined
): string | undefined => {
  const compact = collapseWhitespace(raw || "");
  if (!compact) return undefined;
  if (topic.toLowerCase() === "sports") {
    const canonical = canonicalizeSportsText(compact);
    const structured = normalizeStructuredSports(canonical);
    if (!structured) return undefined;
    return structured.slice(0, SPORTS_TOPIC_DETAIL_MAX_LENGTH);
  }
  if (topic.toLowerCase() === "weather forecasts") {
    return normalizeWeatherRows(compact);
  }
  return compact.slice(0, DEFAULT_TOPIC_DETAIL_MAX_LENGTH);
};
