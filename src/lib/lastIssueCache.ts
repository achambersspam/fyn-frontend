export const LAST_ISSUE_CACHE = "fyn-last-issue";
export const LAST_ISSUE_URL = "/offline/last-issue";

export async function cacheLastReadIssue(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const cache = await caches.open(LAST_ISSUE_CACHE);
    const html = `<!DOCTYPE html>${document.documentElement.outerHTML}`;
    await cache.put(
      LAST_ISSUE_URL,
      new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    );
  } catch {
    /* cache is best-effort */
  }
}
