// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "via.placeholder.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",
  },
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
