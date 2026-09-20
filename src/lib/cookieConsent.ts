export const COOKIE_CONSENT_KEY = "fyn.cookie_consent.v1";
export const COOKIE_CONSENT_EVENT = "fyn-cookie-consent";

export type CookieConsentValue = {
  analytics: boolean;
  at: string;
};

const isBrowser = () => typeof window !== "undefined";

export const hasDoNotTrack = (): boolean => {
  if (!isBrowser()) return false;
  const nav = window.navigator as Navigator & { msDoNotTrack?: string };
  return nav.doNotTrack === "1" || nav.msDoNotTrack === "1";
};

export const readCookieConsent = (): CookieConsentValue | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentValue;
    if (typeof parsed?.analytics !== "boolean" || typeof parsed?.at !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const writeCookieConsent = (analytics: boolean): CookieConsentValue => {
  const value: CookieConsentValue = { analytics, at: new Date().toISOString() };
  if (isBrowser()) {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
  }
  return value;
};

export const isAnalyticsAllowed = (): boolean => {
  if (hasDoNotTrack()) return false;
  return readCookieConsent()?.analytics === true;
};
