export const NAV_COACH_STORAGE_KEY = "fyn.nav_coach_marks.v1";
export const NAV_COACH_FROM_CREATING_KEY = "fyn.coach.from_creating";
export const NAV_COACH_ACTIVE_KEY = "fyn.coach.active";

export const NAV_COACH_ITEMS = [
  { label: "HOME", path: "/dashboard", copy: "Your issues" },
  { label: "DISCOVER", path: "/discover", copy: "Find topics" },
  { label: "NEWSLETTER", path: "/newsletter", copy: "Edit setup" },
  { label: "SETTINGS", path: "/settings", copy: "Plan & account" },
] as const;

export type NavCoachLabel = (typeof NAV_COACH_ITEMS)[number]["label"];
export type NavCoachSeen = Partial<Record<NavCoachLabel, boolean>>;

export const emptyCoachSeen = (): NavCoachSeen => ({});

export const allCoachLabels = (): NavCoachLabel[] =>
  NAV_COACH_ITEMS.map((item) => item.label);

export const isCoachComplete = (seen: NavCoachSeen): boolean =>
  allCoachLabels().every((label) => seen[label] === true);

export const readLocalCoachSeen = (): NavCoachSeen => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NAV_COACH_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NavCoachSeen;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const writeLocalCoachSeen = (seen: NavCoachSeen) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAV_COACH_STORAGE_KEY, JSON.stringify(seen));
};

export const markArrivedFromCreating = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(NAV_COACH_FROM_CREATING_KEY, "1");
};

export const consumeCoachActivation = (): boolean => {
  if (typeof window === "undefined") return false;
  const fromCreating = window.sessionStorage.getItem(NAV_COACH_FROM_CREATING_KEY) === "1";
  const alreadyActive = window.sessionStorage.getItem(NAV_COACH_ACTIVE_KEY) === "1";
  if (fromCreating) {
    window.sessionStorage.removeItem(NAV_COACH_FROM_CREATING_KEY);
    window.sessionStorage.setItem(NAV_COACH_ACTIVE_KEY, "1");
    return true;
  }
  return alreadyActive;
};
