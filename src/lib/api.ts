import { getCurrentSession } from "./supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const LOCAL_FALLBACK_BASES = [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:3003",
];

const buildCandidateBases = () => {
  const candidates = [API_BASE_URL];
  const looksLocal =
    API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
  if (looksLocal) {
    for (const base of LOCAL_FALLBACK_BASES) {
      if (!candidates.includes(base)) candidates.push(base);
    }
  }
  return candidates;
};

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
};

type RequestOptions = {
  requireAuth?: boolean;
  sessionRetries?: number;
  sessionRetryDelayMs?: number;
  timeoutMs?: number;
};

async function request<T>(
  path: string,
  init?: RequestInit,
  options: RequestOptions = {}
): Promise<T> {
  const requireAuth = options.requireAuth ?? true;
  const sessionRetries = Math.max(
    0,
    requireAuth ? (options.sessionRetries ?? 1) : (options.sessionRetries ?? 0)
  );
  const sessionRetryDelayMs = Math.max(0, options.sessionRetryDelayMs ?? 150);
  const session = requireAuth
    ? await getCurrentSession({ retries: sessionRetries, retryDelayMs: sessionRetryDelayMs })
    : null;

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const bases = buildCandidateBases();
  const browserOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : null;
  const shouldTryAnotherBase = (base: string, status: number): boolean => {
    if (!browserOrigin) return false;
    if (base === browserOrigin) return false;
    // In local/dev runs, some candidates can reject auth while another local base is valid.
    return status === 401 || status === 403 || status === 404;
  };
  let response: Response | null = null;
  let lastNetworkError: unknown = null;

  for (const base of bases) {
    const controller =
      typeof AbortController !== "undefined" && options.timeoutMs
        ? new AbortController()
        : null;
    const timeout =
      controller && options.timeoutMs
        ? setTimeout(() => controller.abort(), Math.max(1, options.timeoutMs))
        : null;
    try {
      const candidate = await fetch(`${base}${path}`, {
        ...init,
        headers,
        credentials: "include",
        signal: controller?.signal,
      });
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      if (
        !candidate.ok &&
        (API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1")) &&
        shouldTryAnotherBase(base, candidate.status)
      ) {
        response = candidate;
        continue;
      }
      response = candidate;
      break;
    } catch (error) {
      const message =
        error && typeof error === "object" && "name" in error
          ? String((error as { name?: string }).name || "")
          : "";
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      if (
        message === "AbortError"
      ) {
        lastNetworkError = new Error("Request timed out.");
        continue;
      }
      lastNetworkError = error;
      continue;
    }
  }

  if (!response) {
    const message =
      lastNetworkError &&
      typeof lastNetworkError === "object" &&
      "message" in lastNetworkError
        ? (lastNetworkError as { message: string }).message
        : "Unable to connect to API server.";
    throw {
      message,
      status: 0,
      code: "API_CONNECTION_FAILED",
      details: {
        code: "API_CONNECTION_FAILED",
        attempted_bases: bases,
      },
    } as ApiError;
  }

  if (!response.ok) {
    let message = "Request failed";
    let code: string | undefined;
    let details: unknown;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
      else if (body?.message) message = body.message;
      if (typeof body?.code === "string") {
        code = body.code;
      }
      details = body?.details;
    } catch {
      /* ignore parse error */
    }
    if (response.status === 401) {
      throw {
        message: "Session expired. Please log in again.",
        status: response.status,
        code: code || "SESSION_EXPIRED",
        details,
      } as ApiError;
    }
    throw { message, status: response.status, code, details } as ApiError;
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "DELETE" }, options),
};
