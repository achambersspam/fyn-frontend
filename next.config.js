/** @type {import('next').NextConfig} */
const BACKEND_API_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";

const isDev = process.env.NODE_ENV !== "production";

// Origins the browser legitimately talks to. Supabase (auth + REST), the
// backend API, and PostHog/Sentry telemetry. Dev additionally allows the
// localhost fallback ports the API client probes.
const connectOrigins = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co",
  BACKEND_API_ORIGIN,
  process.env.NEXT_PUBLIC_API_BASE_URL || "",
  "https://us.i.posthog.com",
  "https://us-assets.i.posthog.com",
  "https://*.sentry.io",
  ...(isDev
    ? ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "ws://localhost:3000"]
    : []),
]
  .filter(Boolean)
  .filter((value, index, list) => list.indexOf(value) === index);

// Next.js requires inline scripts for hydration; 'unsafe-eval' is dev-only
// (react-refresh). Newsletter issue HTML renders with inline style attributes,
// hence 'unsafe-inline' for styles. Images allow https so source-article
// imagery in issues keeps loading.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://us-assets.i.posthog.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectOrigins.join(" ")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_API_ORIGIN}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: nothing in this app needs to be framed.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig
