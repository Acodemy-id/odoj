// src/sentry.edge.config.ts
// Edge runtime Sentry SDK initialization (middleware, edge API routes)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://8dd71b03ff3986ee20942e65bd9529c9@o4510951442284544.ingest.us.sentry.io/4510974403870720",

    // PII: attach request headers & IP for user context
    sendDefaultPii: true,

    // Performance: 100% in dev, 10% in production
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

    // Structured logging support
    enableLogs: true,
});
