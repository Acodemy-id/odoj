// src/instrumentation-client.ts
// Client-side Sentry SDK initialization
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://8dd71b03ff3986ee20942e65bd9529c9@o4510951442284544.ingest.us.sentry.io/4510974403870720",

    // PII: attach request headers & IP for user context
    sendDefaultPii: true,

    // Performance: 100% in dev, 10% in production
    // Monitor usage stats and adjust based on traffic volume
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

    integrations: [
        Sentry.replayIntegration(),
    ],

    // Session Replay: 10% of all sessions, 100% of error sessions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Structured logging support
    enableLogs: true,
});

// Instrument router navigations for performance tracing
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
