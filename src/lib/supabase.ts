import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

let client: ReturnType<typeof createBrowserClient> | null = null;
let sessionCache: { session: Session | null; expiresAt: number } | null = null;
let inFlightSessionPromise: Promise<Session | null> | null = null;
const SESSION_CACHE_TTL_MS = 1000;

export function getSupabaseBrowserClient() {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}

export async function getSessionToken(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.access_token ?? null;
}

type SessionReadOptions = {
  retries?: number;
  retryDelayMs?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCurrentSession(
  options: SessionReadOptions = {}
): Promise<Session | null> {
  const now = Date.now();
  if (sessionCache && sessionCache.expiresAt > now) {
    return sessionCache.session;
  }
  if (inFlightSessionPromise) {
    return inFlightSessionPromise;
  }
  const supabase = getSupabaseBrowserClient();
  const retries = Math.max(0, options.retries ?? 0);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 120);
  inFlightSessionPromise = (async () => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        sessionCache = { session, expiresAt: Date.now() + SESSION_CACHE_TTL_MS };
        return session;
      }
      if (attempt < retries) {
        await sleep(retryDelayMs);
      }
    }
    sessionCache = { session: null, expiresAt: Date.now() + 250 };
    return null;
  })();
  try {
    return await inFlightSessionPromise;
  } finally {
    inFlightSessionPromise = null;
  }
}
