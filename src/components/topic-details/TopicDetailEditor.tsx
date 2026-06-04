"use client";

import { useEffect, useRef, useState } from "react";
import type { Tier } from "@/lib/apiContracts";

type TopicDetailEditorProps = {
  topic: string;
  value: string;
  tier: Tier;
  onChange: (value: string) => void;
};

const PRESET_MAX = 4;
const STOCK_THEME_MAX = 3;
const WEATHER_MAX_LOCATIONS = 3;
const PER_SPORT_TEAM_LIMIT = 3;
const GOLF_SELECTION_LIMIT = 2;
const TOPIC_SUBTEXT: Record<string, string> = {
  "Tech & AI": "Get news on articles about these topics below",
  "World News": "Get news on articles about these topics below",
  "Health & Wellness": "Get news on articles about these topics below",
  Entertainment: "Get news on articles about these topics below",
  "Personal Finance": "Get news on articles about these topics below",
  "Motivational Quotes/Stories": "Get quotes/stories about:",
  "Fun Facts": "Get fun facts about:",
};

const TECH_AI_OPTIONS = [
  "AI Breakthroughs",
  "Big Tech Product Launches",
  "Startups and Venture Funding",
  "Cybersecurity and Data Privacy",
  "Robotics and Automation",
  "Developer Tools and Software",
  "Semiconductors and Chips",
  "Consumer Tech Devices",
];
const WORLD_NEWS_OPTIONS = [
  "U.S. Politics",
  "European Politics",
  "World Economy News",
  "Global Conflict and Security Updates",
  "International Diplomacy",
  "Positive News Around the World",
  "Global Innovation and Progress Stories",
  "Climate and Environment Around the World",
];
const HEALTH_OPTIONS = [
  "Athletic Performance and Training",
  "Recovery and Injury Prevention",
  "Sleep and Energy",
  "Nutrition and Healthy Eating",
  "Mental Health and Stress Management",
  "Healthy Aging and Longevity",
  "Women's Health",
  "Everyday Wellness Habits",
];
const ENTERTAINMENT_OPTIONS = [
  "Celebrity News",
  "New Movie Releases",
  "New TV Show Releases",
  "TV and Movie Recommendations",
  "Streaming Platform Highlights",
  "Box Office and Ratings Trends",
  "Award Season and Industry News",
  "Music and Pop Culture",
];
const PERSONAL_FINANCE_OPTIONS = [
  "Budgeting and Saving Basics",
  "Debt Payoff and Credit Score",
  "Investing for Beginners",
  "Career and Income Growth",
  "Family Financial Planning",
  "Tax and Retirement Planning",
  "Retirement Income Strategies",
  "Student and Early-Career Money Tips",
];
const MOTIVATIONAL_OPTIONS = [
  "Motivational Quotes",
  "Short Motivational Phrases",
  "Famous Wisdom / Excerpts",
  "Discipline & Consistency",
  "Sports Mindset",
  "Business / Founder Mindset",
  "Short Motivational Stories",
  "Comeback Stories",
];
const FUN_FACTS_OPTIONS = [
  "Science Facts",
  "History Facts",
  "Space Facts",
  "Technology Facts",
  "Nature and Animal Facts",
  "Sports Facts",
  "Culture Facts",
];
const STOCK_THEME_OPTIONS = [
  "American Tech Stock News",
  "Europe Stock Market News",
  "Japanese Stock Market News",
  "Oil and Gas News",
  "Fintech News",
  "Crypto News",
  "Politics Affecting the Stock Market",
];
const CRYPTO_THEME_OPTIONS = [
  "Bitcoin and Ethereum Market Moves",
  "Altcoin Momentum",
  "Crypto Regulation and Policy",
  "DeFi and On-Chain Trends",
  "Crypto ETFs and Institutional Flows",
  "Stablecoins and Payments",
  "Security, Hacks, and Risk Alerts",
];

const PRO_SPORTS: Array<{
  key: string;
  label: string;
  teams: string[];
}> = [
  {
    key: "NFL",
    label: "NFL",
    teams: [
      "Arizona Cardinals","Atlanta Falcons","Baltimore Ravens","Buffalo Bills","Carolina Panthers","Chicago Bears","Cincinnati Bengals","Cleveland Browns","Dallas Cowboys","Denver Broncos","Detroit Lions","Green Bay Packers","Houston Texans","Indianapolis Colts","Jacksonville Jaguars","Kansas City Chiefs","Las Vegas Raiders","Los Angeles Chargers","Los Angeles Rams","Miami Dolphins","Minnesota Vikings","New England Patriots","New Orleans Saints","New York Giants","New York Jets","Philadelphia Eagles","Pittsburgh Steelers","San Francisco 49ers","Seattle Seahawks","Tampa Bay Buccaneers","Tennessee Titans","Washington Commanders",
    ],
  },
  {
    key: "MLB",
    label: "MLB",
    teams: [
      "Arizona Diamondbacks","Atlanta Braves","Baltimore Orioles","Boston Red Sox","Chicago Cubs","Chicago White Sox","Cincinnati Reds","Cleveland Guardians","Colorado Rockies","Detroit Tigers","Houston Astros","Kansas City Royals","Los Angeles Angels","Los Angeles Dodgers","Miami Marlins","Milwaukee Brewers","Minnesota Twins","New York Mets","New York Yankees","Oakland Athletics","Philadelphia Phillies","Pittsburgh Pirates","San Diego Padres","San Francisco Giants","Seattle Mariners","St. Louis Cardinals","Tampa Bay Rays","Texas Rangers","Toronto Blue Jays","Washington Nationals",
    ],
  },
  {
    key: "NBA",
    label: "NBA",
    teams: [
      "Atlanta Hawks","Boston Celtics","Brooklyn Nets","Charlotte Hornets","Chicago Bulls","Cleveland Cavaliers","Dallas Mavericks","Denver Nuggets","Detroit Pistons","Golden State Warriors","Houston Rockets","Indiana Pacers","LA Clippers","Los Angeles Lakers","Memphis Grizzlies","Miami Heat","Milwaukee Bucks","Minnesota Timberwolves","New Orleans Pelicans","New York Knicks","Oklahoma City Thunder","Orlando Magic","Philadelphia 76ers","Phoenix Suns","Portland Trail Blazers","Sacramento Kings","San Antonio Spurs","Toronto Raptors","Utah Jazz","Washington Wizards",
    ],
  },
  {
    key: "NHL",
    label: "NHL",
    teams: [
      "Anaheim Ducks","Arizona Coyotes","Boston Bruins","Buffalo Sabres","Calgary Flames","Carolina Hurricanes","Chicago Blackhawks","Colorado Avalanche","Columbus Blue Jackets","Dallas Stars","Detroit Red Wings","Edmonton Oilers","Florida Panthers","Los Angeles Kings","Minnesota Wild","Montreal Canadiens","Nashville Predators","New Jersey Devils","New York Islanders","New York Rangers","Ottawa Senators","Philadelphia Flyers","Pittsburgh Penguins","San Jose Sharks","Seattle Kraken","St. Louis Blues","Tampa Bay Lightning","Toronto Maple Leafs","Vancouver Canucks","Vegas Golden Knights","Washington Capitals","Winnipeg Jets",
    ],
  },
  {
    key: "MLS",
    label: "MLS",
    teams: [
      "Atlanta United","Austin FC","Charlotte FC","Chicago Fire","FC Cincinnati","Colorado Rapids","Columbus Crew","D.C. United","FC Dallas","Houston Dynamo","Inter Miami","LA Galaxy","LAFC","Minnesota United","CF Montréal","Nashville SC","New England Revolution","New York City FC","New York Red Bulls","Orlando City","Philadelphia Union","Portland Timbers","Real Salt Lake","San Diego FC","San Jose Earthquakes","Seattle Sounders","Sporting Kansas City","St. Louis City","Toronto FC","Vancouver Whitecaps",
    ],
  },
];

const COLLEGE_FOOTBALL_CONFERENCES = [
  "American Conference",
  "ACC",
  "Big 12",
  "Big 10",
  "Conference USA",
  "Independent teams",
  "Mid American",
  "Mountain West",
  "PAC 12",
  "SEC",
  "Sunbelt",
];
const COLLEGE_BASKETBALL_CONFERENCES = [
  "America East",
  "American Conference",
  "Atlantic 10",
  "ACC",
  "Atlantic Sun",
  "Big 12",
  "Big East",
  "Big 10",
  "Big W",
  "Coastal Athletic",
  "Conference USA",
  "Ivy League",
  "Metro Atlantic Athletic",
  "Mid American",
  "Mountain West",
  "PAC 12",
  "Patriot League",
  "SEC",
  "SoCon",
  "Sunbelt",
];
const INDEPENDENT_TEAMS = ["Notre Dame", "UCONN"];
const GOLF_NEWS_OPTIONS = ["Men's Golf News", "Women's Golf News"];
const PAC12_FOOTBALL_2026_27 = [
  "Oregon State",
  "Washington State",
  "Boise State",
  "Fresno State",
  "San Diego State",
  "Colorado State",
  "Utah State",
  "Texas State",
];
const COLLEGE_FOOTBALL_TEAMS_BY_CONFERENCE: Record<string, string[]> = {
  "American Conference": [
    "Army",
    "UNCC (CLT)",
    "East Carolina",
    "FAU",
    "Memphis",
    "Navy",
    "North Texas",
    "Rice",
    "South Florida",
    "Temple",
    "Tulane",
    "Tulsa",
    "UAB",
    "UTSA",
  ],
  ACC: [
    "Boston College",
    "California",
    "Clemson",
    "Duke",
    "Florida State",
    "Georgia Tech",
    "Louisville",
    "Miami (FL)",
    "NC State",
    "North Carolina",
    "Pittsburgh",
    "SMU",
    "Stanford",
    "Syracuse",
    "Virginia",
    "Virginia Tech",
    "Wake Forest",
  ],
  "Big 12": [
    "Arizona",
    "Arizona State",
    "Baylor",
    "BYU",
    "Cincinnati",
    "Colorado",
    "Houston",
    "Iowa State",
    "Kansas",
    "Kansas State",
    "Oklahoma State",
    "TCU",
    "Texas Tech",
    "UCF",
    "Utah",
    "West Virginia",
  ],
  "Big 10": [
    "Illinois",
    "Indiana",
    "Iowa",
    "Maryland",
    "Michigan",
    "Michigan State",
    "Minnesota",
    "Nebraska",
    "Northwestern",
    "Ohio State",
    "Oregon",
    "Penn State",
    "Purdue",
    "Rutgers",
    "UCLA",
    "USC",
    "Washington",
    "Wisconsin",
  ],
  "Conference USA": [
    "FIU",
    "Jacksonville State",
    "Kennesaw State",
    "Liberty",
    "Louisiana Tech",
    "Middle Tennessee",
    "New Mexico State",
    "Sam Houston",
    "UTEP",
    "Western Kentucky",
  ],
  "Independent teams": INDEPENDENT_TEAMS,
  "Mid American": [
    "Akron",
    "Ball State",
    "Bowling Green",
    "Buffalo",
    "Central Michigan",
    "Eastern Michigan",
    "Kent State",
    "Miami (OH)",
    "Northern Illinois",
    "Ohio",
    "Toledo",
    "Western Michigan",
  ],
  "Mountain West": [
    "Air Force",
    "Boise State",
    "Colorado State",
    "Fresno State",
    "Hawaii",
    "Nevada",
    "New Mexico",
    "San Diego State",
    "San Jose State",
    "UNLV",
    "Utah State",
    "Wyoming",
  ],
  "PAC 12": [...PAC12_FOOTBALL_2026_27],
  SEC: [
    "Alabama",
    "Arkansas",
    "Auburn",
    "Florida",
    "Georgia",
    "Kentucky",
    "LSU",
    "Mississippi State",
    "Missouri",
    "Oklahoma",
    "Ole Miss",
    "South Carolina",
    "Tennessee",
    "Texas",
    "Texas A&M",
    "Vanderbilt",
  ],
  Sunbelt: [
    "Appalachian State",
    "Arkansas State",
    "Coastal Carolina",
    "Georgia Southern",
    "Georgia State",
    "James Madison",
    "Louisiana",
    "Louisiana Monroe",
    "Marshall",
    "Old Dominion",
    "South Alabama",
    "Southern Miss",
    "Texas State",
    "Troy",
  ],
};
const COLLEGE_BASKETBALL_TEAMS_BY_CONFERENCE: Record<string, string[]> = {
  "America East": ["Albany", "Binghamton", "Bryant", "Maine", "NJIT", "UMBC", "UMass Lowell", "New Hampshire", "Vermont"],
  "American Conference": ["UNCC (CLT)", "East Carolina", "FAU", "Memphis", "North Texas", "Rice", "South Florida", "Temple", "Tulane", "Tulsa", "UAB", "UTSA", "Wichita State"],
  "Atlantic 10": ["Dayton", "Duquesne", "Fordham", "George Mason", "George Washington", "La Salle", "Loyola Chicago", "Richmond", "Saint Joseph's", "Saint Louis", "St. Bonaventure", "UMass", "Rhode Island", "VCU"],
  ACC: ["Boston College", "Clemson", "Duke", "Florida State", "Georgia Tech", "Louisville", "Miami (FL)", "NC State", "North Carolina", "Notre Dame", "Pittsburgh", "SMU", "Stanford", "Syracuse", "Virginia", "Virginia Tech", "Wake Forest", "California"],
  "Atlantic Sun": [
    "Queens (CLT)",
    "Austin Peay",
    "Bellarmine",
    "Central Arkansas",
    "Eastern Kentucky",
    "Florida Gulf Coast",
    "Jacksonville",
    "Lipscomb",
    "North Alabama",
    "North Florida",
  ],
  "Big 12": ["Arizona", "Arizona State", "Baylor", "BYU", "Cincinnati", "Colorado", "Houston", "Iowa State", "Kansas", "Kansas State", "Oklahoma State", "TCU", "Texas Tech", "UCF", "Utah", "West Virginia"],
  "Big East": ["Butler", "Creighton", "DePaul", "Georgetown", "Marquette", "Providence", "Seton Hall", "St. John's", "UConn", "Villanova", "Xavier"],
  "Big 10": ["Illinois", "Indiana", "Iowa", "Maryland", "Michigan", "Michigan State", "Minnesota", "Nebraska", "Northwestern", "Ohio State", "Oregon", "Penn State", "Purdue", "Rutgers", "UCLA", "USC", "Washington", "Wisconsin"],
  "Big W": ["Cal Poly", "CSU Bakersfield", "UC Davis", "UC Irvine", "UC Riverside", "UC San Diego", "UC Santa Barbara", "Cal State Fullerton", "Long Beach State", "Hawaii"],
  "Coastal Athletic": ["Campbell", "Charleston", "Delaware", "Drexel", "Elon", "Hampton", "Hofstra", "Monmouth", "Northeastern", "Stony Brook", "Towson", "UNC Wilmington"],
  "Conference USA": ["FIU", "Jacksonville State", "Kennesaw State", "Liberty", "Louisiana Tech", "Middle Tennessee", "New Mexico State", "Sam Houston", "UTEP", "Western Kentucky"],
  "Ivy League": ["Brown", "Columbia", "Cornell", "Dartmouth", "Harvard", "Penn", "Princeton", "Yale"],
  "Metro Atlantic Athletic": ["Canisius", "Fairfield", "Iona", "Manhattan", "Marist", "Mount St. Mary's", "Niagara", "Quinnipiac", "Rider", "Sacred Heart", "Saint Peter's", "Siena"],
  "Mid American": ["Akron", "Ball State", "Bowling Green", "Buffalo", "Central Michigan", "Eastern Michigan", "Kent State", "Miami (OH)", "Northern Illinois", "Ohio", "Toledo", "Western Michigan"],
  "Mountain West": ["Air Force", "Boise State", "Colorado State", "Fresno State", "Nevada", "New Mexico", "San Diego State", "San Jose State", "UNLV", "Utah State", "Wyoming"],
  "PAC 12": [...PAC12_FOOTBALL_2026_27, "Gonzaga"],
  "Patriot League": ["American", "Army", "Boston University", "Bucknell", "Colgate", "Holy Cross", "Lafayette", "Lehigh", "Loyola Maryland", "Navy"],
  SEC: ["Alabama", "Arkansas", "Auburn", "Florida", "Georgia", "Kentucky", "LSU", "Mississippi State", "Missouri", "Oklahoma", "Ole Miss", "South Carolina", "Tennessee", "Texas", "Texas A&M", "Vanderbilt"],
  SoCon: ["Chattanooga", "Citadel", "East Tennessee State", "Furman", "Mercer", "Samford", "UNC Greensboro", "VMI", "Western Carolina", "Wofford"],
  Sunbelt: ["Appalachian State", "Arkansas State", "Coastal Carolina", "Georgia Southern", "Georgia State", "James Madison", "Louisiana", "Louisiana Monroe", "Marshall", "Old Dominion", "South Alabama", "Southern Miss", "Texas State", "Troy"],
};

type SportsState = {
  enabledSports: string[];
  proTeams: Record<string, string[]>;
  golfPlayers: string[];
  collegeFootballTeamsByConference: Record<string, string[]>;
  collegeBasketballTeamsByConference: Record<string, string[]>;
};

const emptySportsState = (): SportsState => ({
  enabledSports: [],
  proTeams: {},
  golfPlayers: [],
  collegeFootballTeamsByConference: {},
  collegeBasketballTeamsByConference: {},
});

const getSportsTotalCap = (tier: Tier): number => {
  if (tier === "premium") return 15;
  if (tier === "minimum") return 10;
  return 7;
};

const chipClass = (selected: boolean) =>
  `rounded-xl border px-3 py-2 text-sm font-bold transition-all ${
    selected
      ? "border-primary bg-primary/10 text-primary"
      : "border-gray-200 bg-white text-gray-700 hover:border-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
  }`;

const toggleItem = (items: string[], item: string, max: number): string[] => {
  if (items.includes(item)) {
    return items.filter((v) => v !== item);
  }
  if (items.length >= max) return items;
  return [...items, item];
};

const normalizeSegmentParts = (value: string) =>
  (value || "")
    .split(/[;|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);

const normalizeCommaParts = (value: string) =>
  (value || "")
    .split(/[,\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);

const parseBracketPayload = (segment: string): string[] => {
  const match = segment.match(/\[(.*)\]/);
  if (!match?.[1]) return [];
  return match[1]
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const serializePresetList = (items: string[]) => items.join("; ");

const parsePresetList = (value: string, options: string[]) => {
  const parts = normalizeSegmentParts(value);
  const lower = parts.map((item) => item.toLowerCase());
  return options.filter((option) => lower.includes(option.toLowerCase())).slice(0, PRESET_MAX);
};

const serializeWeather = (rows: Array<{ city: string; state: string }>) =>
  rows
    .map((row) => ({
      city: (row.city || "").trim(),
      state: (row.state || "").trim(),
    }))
    .filter((row) => row.city.length > 0 || row.state.length > 0)
    .slice(0, WEATHER_MAX_LOCATIONS)
    .map((row) => `${row.city.slice(0, 60)}, ${row.state.slice(0, 60)}`.trim())
    .join("; ");

const parseWeather = (value: string) => {
  const parsed = normalizeSegmentParts(value)
    .map((entry) => {
      const cleanedEntry = entry.replace(/^location\s*:\s*/i, "").trim();
      const [city, ...rest] = cleanedEntry.split(",");
      return {
        city: (city || "").trim(),
        state: rest.join(", ").trim(),
      };
    })
    .filter((row) => row.city.length > 0 || row.state.length > 0)
    .slice(0, WEATHER_MAX_LOCATIONS);
  return parsed.length ? parsed : [{ city: "", state: "" }];
};

const serializeStockLike = (symbols: string[], themes: string[]) => {
  const compactSymbols = symbols
    .map((v) => (typeof v === "string" ? v.slice(0, 24) : ""))
    .filter((v) => v.trim().length > 0)
    .slice(0, 5);
  const compactThemes = themes.map((v) => v.trim()).filter(Boolean);
  return [
    compactSymbols.length ? `Symbols: ${compactSymbols.join(", ")}` : "",
    compactThemes.length ? `Themes: ${compactThemes.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
};

const parseStockLike = (value: string, themeOptions: string[]) => {
  const symbolsMatch = value.match(/symbols:\s*([^|]+)/i);
  const themesMatch = value.match(/themes:\s*(.+)$/i);
  const symbols = (symbolsMatch?.[1] || "")
    .split(",")
    .map((entry) => entry.slice(0, 24))
    .filter((entry) => entry.trim().length > 0)
    .slice(0, 5);
  const themeParts = normalizeSegmentParts((themesMatch?.[1] || "").replace(/\s+\|\s+/g, ";"));
  const themes = themeOptions.filter((option) =>
    themeParts.map((t) => t.toLowerCase()).includes(option.toLowerCase())
  );
  return { symbols, themes };
};

const serializeBrain = (count: number | null, difficulty: string | null) => {
  const parts: string[] = [];
  if (count) parts.push(`Count: ${count}`);
  if (difficulty) parts.push(`Difficulty: ${difficulty}`);
  return parts.join(" | ");
};

const parseBrain = (value: string) => {
  const countMatch = value.match(/count:\s*([1-6])/i);
  const difficultyMatch = value.match(/difficulty:\s*(easy|medium|hard)/i);
  return {
    count: countMatch ? Number(countMatch[1]) : null,
    difficulty: difficultyMatch ? capitalizeWord(difficultyMatch[1]) : null,
  };
};

const capitalizeWord = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : value;

const parseSports = (value: string): SportsState => {
  const state = emptySportsState();
  const segments = value
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const [keyRaw] = segment.split(":");
    const key = (keyRaw || "").trim();
    const payload = parseBracketPayload(segment);
    if (key === "Enabled") {
      state.enabledSports = Array.from(new Set([...state.enabledSports, ...payload]));
      continue;
    }
    if (!payload.length) continue;
    if (key === "Golfers" || key === "Golf") {
      state.enabledSports = Array.from(new Set([...state.enabledSports, "Golf"]));
      state.golfPlayers = payload.slice(0, GOLF_SELECTION_LIMIT);
      continue;
    }
    if (key === "College Football Conferences") {
      state.enabledSports = Array.from(new Set([...state.enabledSports, "College Football"]));
      state.collegeFootballTeamsByConference = payload.reduce<Record<string, string[]>>(
        (acc, entry) => {
          if (COLLEGE_FOOTBALL_CONFERENCES.includes(entry)) {
            acc[entry] = acc[entry] || [];
            return acc;
          }
          for (const conference of COLLEGE_FOOTBALL_CONFERENCES) {
            if ((COLLEGE_FOOTBALL_TEAMS_BY_CONFERENCE[conference] || []).includes(entry)) {
              acc[conference] = Array.from(new Set([...(acc[conference] || []), entry]));
            }
          }
          return acc;
        },
        {}
      );
      continue;
    }
    if (key === "College Basketball Conferences") {
      state.enabledSports = Array.from(new Set([...state.enabledSports, "College Basketball"]));
      state.collegeBasketballTeamsByConference = payload.reduce<Record<string, string[]>>(
        (acc, entry) => {
          if (COLLEGE_BASKETBALL_CONFERENCES.includes(entry)) {
            acc[entry] = acc[entry] || [];
            return acc;
          }
          for (const conference of COLLEGE_BASKETBALL_CONFERENCES) {
            if ((COLLEGE_BASKETBALL_TEAMS_BY_CONFERENCE[conference] || []).includes(entry)) {
              acc[conference] = Array.from(new Set([...(acc[conference] || []), entry]));
            }
          }
          return acc;
        },
        {}
      );
      continue;
    }
    if (key === "College Football Teams") {
      state.enabledSports = Array.from(new Set([...state.enabledSports, "College Football"]));
      state.collegeFootballTeamsByConference = payload.reduce<Record<string, string[]>>(
        (acc, entry) => {
          for (const conference of COLLEGE_FOOTBALL_CONFERENCES) {
            if ((COLLEGE_FOOTBALL_TEAMS_BY_CONFERENCE[conference] || []).includes(entry)) {
              acc[conference] = Array.from(new Set([...(acc[conference] || []), entry]));
            }
          }
          return acc;
        },
        {}
      );
      continue;
    }
    if (key === "College Basketball Teams") {
      state.enabledSports = Array.from(new Set([...state.enabledSports, "College Basketball"]));
      state.collegeBasketballTeamsByConference = payload.reduce<Record<string, string[]>>(
        (acc, entry) => {
          for (const conference of COLLEGE_BASKETBALL_CONFERENCES) {
            if ((COLLEGE_BASKETBALL_TEAMS_BY_CONFERENCE[conference] || []).includes(entry)) {
              acc[conference] = Array.from(new Set([...(acc[conference] || []), entry]));
            }
          }
          return acc;
        },
        {}
      );
      continue;
    }
    if (PRO_SPORTS.some((sport) => sport.key === key)) {
      state.enabledSports = Array.from(new Set([...state.enabledSports, key]));
      state.proTeams[key] = payload.slice(0, PER_SPORT_TEAM_LIMIT);
    }
  }

  if (state.enabledSports.length === 0 && value.trim()) {
    // Legacy free-text sports details: keep one pseudo-player to avoid clearing old values
    state.enabledSports = ["Golf"];
    state.golfPlayers = normalizeCommaParts(value).slice(0, 3);
  }
  return state;
};

const serializeSports = (sports: SportsState) => {
  const segments: string[] = [];
  if (sports.enabledSports.length > 0) {
    segments.push(`Enabled: [${sports.enabledSports.join(", ")}]`);
  }
  for (const league of PRO_SPORTS) {
    const selectedTeams = sports.proTeams[league.key] || [];
    if (selectedTeams.length > 0) {
      segments.push(`${league.key}: [${selectedTeams.join(", ")}]`);
    }
  }
  if (sports.golfPlayers.length > 0) {
    segments.push(`Golf: [${sports.golfPlayers.join(", ")}]`);
  }
  const collegeFootballTeams = Object.values(sports.collegeFootballTeamsByConference).flat();
  if (collegeFootballTeams.length > 0) {
    segments.push(`College Football Teams: [${Array.from(new Set(collegeFootballTeams)).join(", ")}]`);
  }
  const collegeBasketballTeams = Object.values(sports.collegeBasketballTeamsByConference).flat();
  if (collegeBasketballTeams.length > 0) {
    segments.push(
      `College Basketball Teams: [${Array.from(new Set(collegeBasketballTeams)).join(", ")}]`
    );
  }
  return segments.join(" | ");
};

const getConferenceNewsLabel = (conference: string) => `${conference} News`;

export const TOPIC_DETAIL_PRESET_AUDIT_DATA = {
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
};

export default function TopicDetailEditor({
  topic,
  value,
  tier,
  onChange,
}: TopicDetailEditorProps) {
  const [weatherDraftRows, setWeatherDraftRows] = useState<Array<{ city: string; state: string }>>([
    { city: "", state: "" },
  ]);
  const weatherSerializedRef = useRef<string>("");
  const [stockDraft, setStockDraft] = useState<{ slots: string[]; themes: string[] }>({
    slots: Array.from({ length: 5 }, () => ""),
    themes: [],
  });
  const stockSerializedRef = useRef<string>("");
  const [sportsNotice, setSportsNotice] = useState<string>("");
  const [activeCollegeFootballConference, setActiveCollegeFootballConference] =
    useState<string | null>(null);
  const [activeCollegeBasketballConference, setActiveCollegeBasketballConference] =
    useState<string | null>(null);
  const collegeFootballListScrollRef = useRef<HTMLDivElement>(null);
  const collegeBasketballListScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    collegeFootballListScrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, [activeCollegeFootballConference]);

  useEffect(() => {
    collegeBasketballListScrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, [activeCollegeBasketballConference]);

  useEffect(() => {
    weatherSerializedRef.current = "";
    stockSerializedRef.current = "";
  }, [topic]);

  useEffect(() => {
    if (topic !== "Weather Forecasts") return;
    if (value === weatherSerializedRef.current) return;
    const parsed = parseWeather(value);
    setWeatherDraftRows(parsed.length ? parsed : [{ city: "", state: "" }]);
  }, [topic, value]);

  useEffect(() => {
    if (topic !== "Stock Market" && topic !== "Crypto News") return;
    if (value === stockSerializedRef.current) return;
    const themeOptions = topic === "Stock Market" ? STOCK_THEME_OPTIONS : CRYPTO_THEME_OPTIONS;
    const parsed = parseStockLike(value, themeOptions);
    const slots = Array.from({ length: 5 }, (_, idx) => parsed.symbols[idx] || "");
    setStockDraft({ slots, themes: parsed.themes });
  }, [topic, value]);

  const sportsCap = getSportsTotalCap(tier);
  const topicSubtext = TOPIC_SUBTEXT[topic];

  if (topic === "Weather Forecasts") {
    const rows = weatherDraftRows.length ? weatherDraftRows : [{ city: "", state: "" }];
    return (
      <div className="space-y-3">
        {topicSubtext ? (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{topicSubtext}</p>
        ) : null}
        {rows.map((row, index) => (
          <div key={`weather-${index}`} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">City</label>
              <input
                value={row.city}
                onChange={(event) => {
                  const next = rows.map((entry, idx) =>
                    idx === index ? { ...entry, city: event.target.value.slice(0, 60) } : entry
                  );
                  setWeatherDraftRows(next);
                  const serialized = serializeWeather(next);
                  weatherSerializedRef.current = serialized;
                  onChange(serialized);
                }}
                placeholder="Type Here: Charlotte"
                className="input-field"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">State</label>
              <input
                value={row.state}
                onChange={(event) => {
                  const next = rows.map((entry, idx) =>
                    idx === index ? { ...entry, state: event.target.value.slice(0, 60) } : entry
                  );
                  setWeatherDraftRows(next);
                  const serialized = serializeWeather(next);
                  weatherSerializedRef.current = serialized;
                  onChange(serialized);
                }}
                placeholder="Type Here: North Carolina"
                className="input-field"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            if (rows.length >= WEATHER_MAX_LOCATIONS) return;
            const nextRows = [...rows, { city: "", state: "" }];
            setWeatherDraftRows(nextRows);
            const serialized = serializeWeather(nextRows);
            weatherSerializedRef.current = serialized;
            onChange(serialized);
          }}
          disabled={rows.length >= WEATHER_MAX_LOCATIONS}
          className="w-full rounded-xl border border-primary bg-transparent px-4 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add another location
        </button>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {rows.length}/{WEATHER_MAX_LOCATIONS} locations selected
        </p>
      </div>
    );
  }

  if (topic === "Stock Market" || topic === "Crypto News") {
    const themeOptions = topic === "Stock Market" ? STOCK_THEME_OPTIONS : CRYPTO_THEME_OPTIONS;
    const leftLabel =
      topic === "Stock Market"
        ? "Type either a ticker symbol or type the name of a company"
        : "Type either a crypto symbol or type the name of a crypto asset";
    const stockPlaceholders = [
      "Type Here: NVDA",
      "Type Here: AMZN",
      "Type Here: TSLA",
      "Type Here: S&P 500",
      "Type Here: Apple stock",
    ];
    const cryptoPlaceholders = [
      "Type Here: BTC",
      "Type Here: ETH",
      "Type Here: SOL",
      "Type Here: Bitcoin",
      "Type Here: Ethereum",
    ];
    const slots = stockDraft.slots.length
      ? stockDraft.slots
      : Array.from({ length: 5 }, () => "");
    const themes = stockDraft.themes;
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {topicSubtext ? (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 lg:col-span-2">
            {topicSubtext}
          </p>
        ) : null}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">{leftLabel}</label>
          <div className="space-y-2">
            {slots.map((slot, index) => (
              <input
                key={`slot-${index}`}
                value={slot}
                onChange={(event) => {
                  const next = [...slots];
                  next[index] = event.target.value.slice(0, 24);
                  const nextDraft = { slots: next, themes };
                  setStockDraft(nextDraft);
                  const serialized = serializeStockLike(next, themes);
                  stockSerializedRef.current = serialized;
                  onChange(serialized);
                }}
                placeholder={
                  topic === "Stock Market" ? stockPlaceholders[index] : cryptoPlaceholders[index]
                }
                className="input-field"
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {topic === "Stock Market" ? "Broad market focus (optional)" : "Crypto focus (optional)"}
          </label>
          <div className="flex flex-col gap-2">
            {themeOptions.map((option) => {
              const selected = themes.includes(option);
              const atLimit = !selected && themes.length >= STOCK_THEME_MAX;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const next = toggleItem(themes, option, STOCK_THEME_MAX);
                    setStockDraft({ slots, themes: next });
                    const serialized = serializeStockLike(slots, next);
                    stockSerializedRef.current = serialized;
                    onChange(serialized);
                  }}
                  className={`${chipClass(selected)} ${atLimit ? "opacity-50" : ""}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (topic === "Brain Teaser & Riddles") {
    const parsed = parseBrain(value);
    const countChoices = [1, 2, 3, 4, 5, 6];
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {topicSubtext ? (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 md:col-span-2">
            {topicSubtext}
          </p>
        ) : null}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Choose how many brain teasers you want
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {countChoices.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onChange(serializeBrain(count, parsed.difficulty))}
                className={`h-14 text-base ${chipClass(parsed.count === count)}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Choose the difficulty
          </h4>
          <div className="space-y-2">
            {["Easy", "Medium", "Hard"].map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() =>
                  onChange(
                    serializeBrain(
                      parsed.count,
                      parsed.difficulty === difficulty ? null : difficulty
                    )
                  )
                }
                className={`w-full ${chipClass(parsed.difficulty === difficulty)}`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (topic === "Sports") {
    const sports = parseSports(value);
    const selectedPlayerCount =
      Object.values(sports.proTeams).reduce((sum, teams) => sum + teams.length, 0) +
      sports.golfPlayers.length +
      Object.values(sports.collegeFootballTeamsByConference).reduce(
        (sum, teams) => sum + teams.length,
        0
      ) +
      Object.values(sports.collegeBasketballTeamsByConference).reduce(
        (sum, teams) => sum + teams.length,
        0
      );
    const enabled = sports.enabledSports;
    const setSports = (next: SportsState) => onChange(serializeSports(next));

    const toggleSport = (sportLabel: string) => {
      const nextEnabled = enabled.includes(sportLabel)
        ? enabled.filter((item) => item !== sportLabel)
        : [...enabled, sportLabel];
      const next: SportsState = {
        ...sports,
        enabledSports: nextEnabled,
        proTeams: { ...sports.proTeams },
        collegeFootballTeamsByConference: { ...sports.collegeFootballTeamsByConference },
        collegeBasketballTeamsByConference: { ...sports.collegeBasketballTeamsByConference },
      };
      if (!nextEnabled.includes("Golf")) next.golfPlayers = [];
      if (!nextEnabled.includes("College Football")) {
        next.collegeFootballTeamsByConference = {};
        setActiveCollegeFootballConference(null);
      }
      if (!nextEnabled.includes("College Basketball")) {
        next.collegeBasketballTeamsByConference = {};
        setActiveCollegeBasketballConference(null);
      }
      for (const league of PRO_SPORTS) {
        if (!nextEnabled.includes(league.key)) {
          next.proTeams[league.key] = [];
        }
      }
      setSports(next);
    };

    const updateProTeam = (league: string, team: string) => {
      const current = sports.proTeams[league] || [];
      const isSelected = current.includes(team);
      if (!isSelected && current.length >= PER_SPORT_TEAM_LIMIT) {
        setSportsNotice("current limit is three teams for this sport");
        return;
      }
      const newTotal = isSelected ? selectedPlayerCount - 1 : selectedPlayerCount + 1;
      if (!isSelected && newTotal > sportsCap) {
        setSportsNotice(`Current plan limit is ${sportsCap} total teams/topics`);
        return;
      }
      setSportsNotice("");
      const next = {
        ...sports,
        proTeams: {
          ...sports.proTeams,
          [league]: isSelected ? current.filter((entry) => entry !== team) : [...current, team],
        },
      };
      setSports(next);
    };

    const updateGolfPlayer = (player: string) => {
      const current = sports.golfPlayers;
      const isSelected = current.includes(player);
      if (!isSelected && current.length >= GOLF_SELECTION_LIMIT) {
        setSportsNotice("choose Men's Golf News, Women's Golf News, or both");
        return;
      }
      const newTotal = isSelected ? selectedPlayerCount - 1 : selectedPlayerCount + 1;
      if (!isSelected && newTotal > sportsCap) {
        setSportsNotice(`Current plan limit is ${sportsCap} total teams/topics`);
        return;
      }
      setSportsNotice("");
      setSports({
        ...sports,
        golfPlayers: isSelected
          ? current.filter((entry) => entry !== player)
          : [...current, player],
      });
    };

    const updateCollegeTeam = (
      sportType: "football" | "basketball",
      conference: string,
      team: string
    ) => {
      const teamsByConference =
        sportType === "football"
          ? sports.collegeFootballTeamsByConference
          : sports.collegeBasketballTeamsByConference;
      const current = teamsByConference[conference] || [];
      const isSelected = current.includes(team);
      if (!isSelected && current.length >= PER_SPORT_TEAM_LIMIT) {
        setSportsNotice("current limit is three teams for this conference");
        return;
      }
      const newTotal = isSelected ? selectedPlayerCount - 1 : selectedPlayerCount + 1;
      if (!isSelected && newTotal > sportsCap) {
        setSportsNotice(`Current plan limit is ${sportsCap} total teams/topics`);
        return;
      }
      setSportsNotice("");
      const updatedConferenceTeams = {
        ...teamsByConference,
        [conference]: isSelected
          ? current.filter((entry) => entry !== team)
          : [...current, team],
      };
      if (updatedConferenceTeams[conference].length === 0) {
        delete updatedConferenceTeams[conference];
      }
      if (sportType === "football") {
        setSports({
          ...sports,
          collegeFootballTeamsByConference: updatedConferenceTeams,
        });
      } else {
        setSports({
          ...sports,
          collegeBasketballTeamsByConference: updatedConferenceTeams,
        });
      }
    };

    const renderSelectedTeamsSection = (
      selectedItems: string[],
      onToggle: (item: string) => void
    ) => {
      if (selectedItems.length === 0) return null;
      return (
        <div className="border-b border-gray-200 bg-sky-50 px-2 py-2 dark:border-slate-700 dark:bg-sky-950/30">
          <p className="mb-1 text-xs font-black text-sky-700 dark:text-sky-300">Selected</p>
          <div className="flex flex-wrap gap-1">
            {selectedItems.map((item) => (
              <button
                key={`selected-${item}`}
                type="button"
                onClick={() => onToggle(item)}
                className="rounded-lg border border-sky-300 bg-white px-2 py-1 text-xs font-bold text-sky-700 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-300"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-3">
        {topicSubtext ? (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{topicSubtext}</p>
        ) : null}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {["NFL", "MLB", "NBA", "NHL", "MLS", "Golf", "College Football", "College Basketball"].map(
            (sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => toggleSport(sport)}
                className={chipClass(enabled.includes(sport))}
              >
                {sport}
              </button>
            )
          )}
        </div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Total selected teams/topics: {selectedPlayerCount}/{sportsCap}
        </p>
        {sportsNotice ? (
          <p className="text-xs font-bold text-primary">{sportsNotice}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {enabled
            .filter((sportKey) => PRO_SPORTS.some((sport) => sport.key === sportKey))
            .map((sportKey) => {
              const proSport = PRO_SPORTS.find((sport) => sport.key === sportKey);
              if (!proSport) return null;
              return (
            <div key={proSport.key} className="rounded-xl border border-gray-200 p-3 dark:border-slate-700">
              <h4 className="mb-2 text-xs font-black text-gray-700 dark:text-gray-300">{proSport.label}</h4>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700">
                {renderSelectedTeamsSection(sports.proTeams[proSport.key] || [], (team) =>
                  updateProTeam(proSport.key, team)
                )}
                {proSport.teams.map((team) => {
                  const selected = (sports.proTeams[proSport.key] || []).includes(team);
                  return (
                    <button
                      key={team}
                      type="button"
                      onClick={() => updateProTeam(proSport.key, team)}
                      className={`w-full border-b border-gray-100 px-3 py-2 text-left text-sm transition-all last:border-b-0 dark:border-slate-800 ${
                        selected
                          ? "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {team}
                    </button>
                  );
                })}
              </div>
            </div>
              );
            })}

          {enabled.includes("Golf") ? (
            <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-slate-700">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Golf
            </label>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700">
              {renderSelectedTeamsSection(sports.golfPlayers, updateGolfPlayer)}
              {GOLF_NEWS_OPTIONS.map((player) => {
                const selected = sports.golfPlayers.includes(player);
                return (
                  <button
                    key={player}
                    type="button"
                    onClick={() => updateGolfPlayer(player)}
                    className={`w-full border-b border-gray-100 px-3 py-2 text-left text-sm transition-all last:border-b-0 dark:border-slate-800 ${
                      selected
                        ? "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {player}
                  </button>
                );
              })}
            </div>
            </div>
          ) : null}

          {enabled.includes("College Football") ? (
            <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-slate-700">
              <h4 className="text-xs font-black text-gray-700 dark:text-gray-300">
                College Football - Conferences
              </h4>
              <div
                ref={collegeFootballListScrollRef}
                className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700"
              >
                {activeCollegeFootballConference ? (
                  <>
                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => setActiveCollegeFootballConference(null)}
                        className="inline-flex items-center gap-2 text-xs font-black text-sky-600 dark:text-sky-300"
                      >
                        <span aria-hidden="true">←</span>
                        Back to conferences
                      </button>
                      <p className="mt-1 text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                        {activeCollegeFootballConference}
                      </p>
                    </div>
                    {renderSelectedTeamsSection(
                      sports.collegeFootballTeamsByConference[activeCollegeFootballConference] || [],
                      (team) =>
                        updateCollegeTeam("football", activeCollegeFootballConference, team)
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        updateCollegeTeam(
                          "football",
                          activeCollegeFootballConference,
                          getConferenceNewsLabel(activeCollegeFootballConference)
                        )
                      }
                      className={`w-full border-b border-gray-100 px-3 py-2 text-left text-sm transition-all dark:border-slate-800 ${
                        (
                          sports.collegeFootballTeamsByConference[
                            activeCollegeFootballConference
                          ] || []
                        ).includes(getConferenceNewsLabel(activeCollegeFootballConference))
                          ? "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {getConferenceNewsLabel(activeCollegeFootballConference)}
                    </button>
                    {(COLLEGE_FOOTBALL_TEAMS_BY_CONFERENCE[activeCollegeFootballConference] || []).map(
                      (team) => {
                        const selected =
                          (
                            sports.collegeFootballTeamsByConference[
                              activeCollegeFootballConference
                            ] || []
                          ).includes(team);
                        return (
                          <button
                            key={team}
                            type="button"
                            onClick={() =>
                              updateCollegeTeam(
                                "football",
                                activeCollegeFootballConference,
                                team
                              )
                            }
                            className={`w-full border-b border-gray-100 px-3 py-2 text-left text-sm transition-all last:border-b-0 dark:border-slate-800 ${
                              selected
                                ? "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300"
                                : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800"
                            }`}
                          >
                            {team}
                          </button>
                        );
                      }
                    )}
                  </>
                ) : (
                  COLLEGE_FOOTBALL_CONFERENCES.map((conference) => {
                    const selectedCount =
                      sports.collegeFootballTeamsByConference[conference]?.length || 0;
                    return (
                      <button
                        key={conference}
                        type="button"
                        onClick={() => setActiveCollegeFootballConference(conference)}
                        className="flex w-full items-center justify-between border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition-all last:border-b-0 hover:bg-gray-50 dark:border-slate-800 dark:text-gray-200 dark:hover:bg-slate-800"
                      >
                        <span>
                          {conference}
                          {selectedCount > 0 ? ` (${selectedCount} selected)` : ""}
                        </span>
                        <span
                          aria-hidden="true"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 text-sm font-black leading-none text-gray-400 dark:border-slate-500 dark:text-slate-400"
                        >
                          →
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {enabled.includes("College Basketball") ? (
            <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-slate-700">
              <h4 className="text-xs font-black text-gray-700 dark:text-gray-300">
                College Basketball - Conferences
              </h4>
              <div
                ref={collegeBasketballListScrollRef}
                className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700"
              >
                {activeCollegeBasketballConference ? (
                  <>
                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => setActiveCollegeBasketballConference(null)}
                        className="inline-flex items-center gap-2 text-xs font-black text-sky-600 dark:text-sky-300"
                      >
                        <span aria-hidden="true">←</span>
                        Back to conferences
                      </button>
                      <p className="mt-1 text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                        {activeCollegeBasketballConference}
                      </p>
                    </div>
                    {renderSelectedTeamsSection(
                      sports.collegeBasketballTeamsByConference[
                        activeCollegeBasketballConference
                      ] || [],
                      (team) =>
                        updateCollegeTeam(
                          "basketball",
                          activeCollegeBasketballConference,
                          team
                        )
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        updateCollegeTeam(
                          "basketball",
                          activeCollegeBasketballConference,
                          getConferenceNewsLabel(activeCollegeBasketballConference)
                        )
                      }
                      className={`w-full border-b border-gray-100 px-3 py-2 text-left text-sm transition-all dark:border-slate-800 ${
                        (
                          sports.collegeBasketballTeamsByConference[
                            activeCollegeBasketballConference
                          ] || []
                        ).includes(getConferenceNewsLabel(activeCollegeBasketballConference))
                          ? "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {getConferenceNewsLabel(activeCollegeBasketballConference)}
                    </button>
                    {(
                      COLLEGE_BASKETBALL_TEAMS_BY_CONFERENCE[
                        activeCollegeBasketballConference
                      ] || []
                    ).map((team) => {
                      const selected =
                        (
                          sports.collegeBasketballTeamsByConference[
                            activeCollegeBasketballConference
                          ] || []
                        ).includes(team);
                      return (
                        <button
                          key={team}
                          type="button"
                          onClick={() =>
                            updateCollegeTeam(
                              "basketball",
                              activeCollegeBasketballConference,
                              team
                            )
                          }
                          className={`w-full border-b border-gray-100 px-3 py-2 text-left text-sm transition-all last:border-b-0 dark:border-slate-800 ${
                            selected
                              ? "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800"
                          }`}
                        >
                          {team}
                        </button>
                      );
                    })}
                  </>
                ) : (
                  COLLEGE_BASKETBALL_CONFERENCES.map((conference) => {
                    const selectedCount =
                      sports.collegeBasketballTeamsByConference[conference]?.length || 0;
                    return (
                      <button
                        key={conference}
                        type="button"
                        onClick={() => setActiveCollegeBasketballConference(conference)}
                        className="flex w-full items-center justify-between border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition-all last:border-b-0 hover:bg-gray-50 dark:border-slate-800 dark:text-gray-200 dark:hover:bg-slate-800"
                      >
                        <span>
                          {conference}
                          {selectedCount > 0 ? ` (${selectedCount} selected)` : ""}
                        </span>
                        <span
                          aria-hidden="true"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 text-sm font-black leading-none text-gray-400 dark:border-slate-500 dark:text-slate-400"
                        >
                          →
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const presetOptions =
    topic === "Tech & AI"
      ? TECH_AI_OPTIONS
      : topic === "World News"
      ? WORLD_NEWS_OPTIONS
      : topic === "Health & Wellness"
      ? HEALTH_OPTIONS
      : topic === "Entertainment"
      ? ENTERTAINMENT_OPTIONS
      : topic === "Personal Finance"
      ? PERSONAL_FINANCE_OPTIONS
      : topic === "Motivational Quotes/Stories"
      ? MOTIVATIONAL_OPTIONS
      : topic === "Fun Facts"
      ? FUN_FACTS_OPTIONS
      : [];

  if (presetOptions.length > 0) {
    const selections = parsePresetList(value, presetOptions);
    return (
      <div className="space-y-2">
        {topicSubtext ? (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{topicSubtext}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {presetOptions.map((option) => {
            const selected = selections.includes(option);
            const atLimit = !selected && selections.length >= PRESET_MAX;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  const next = toggleItem(selections, option, PRESET_MAX);
                  onChange(serializePresetList(next));
                }}
                className={`${chipClass(selected)} ${atLimit ? "opacity-50" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value.slice(0, 200))}
      maxLength={200}
      rows={3}
      className="input-field resize-y overflow-y-auto"
      style={{ minHeight: "80px", maxHeight: "160px" }}
    />
  );
}

