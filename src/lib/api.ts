export type ApiError = {
  message: string;
  status?: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const buildUrl = (path: string) => {
  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  return `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
    document.cookie = `auth_token=${token}; path=/; max-age=604800; samesite=lax`;
  } else {
    localStorage.removeItem("auth_token");
    document.cookie = "auth_token=; path=/; max-age=0; samesite=lax";
  }
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore parse error
    }
    throw { message, status: response.status } as ApiError;
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
