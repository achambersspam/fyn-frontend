/** @type {import('next').NextConfig} */
const BACKEND_API_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig
