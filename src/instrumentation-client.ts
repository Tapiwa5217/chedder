// Client-side Sentry initialisation.
// Uses @sentry/react directly because @sentry/nextjs cannot be resolved
// by Turbopack (Next.js 16 default bundler) in the browser context.
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://5133b867393ea014c4b1ea08088af196@o4511463300988928.ingest.us.sentry.io/4511463309180928",

  integrations: [Sentry.replayIntegration()],

  // 20% of transactions sampled — enough signal without burning the free tier
  tracesSampleRate: 0.2,

  // Capture replays for 10% of sessions, 100% when an error occurs
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,
  sendDefaultPii: true,
});
