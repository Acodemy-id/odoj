import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "acodemy",
  project: "odoj-project",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Auth token for source map uploads — set SENTRY_AUTH_TOKEN in CI/CD env
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload wider set of source maps for more readable stack traces
  widenClientFileUpload: true,

  // Tunnel Sentry events through Next.js server to bypass ad blockers
  tunnelRoute: "/monitoring",
});
