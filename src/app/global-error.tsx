"use client";

// src/app/global-error.tsx
// Captures unhandled React render errors across the entire App Router
import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
    error,
}: {
    error: Error & { digest?: string };
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                {/* NextError requires statusCode; App Router doesn't expose it, so 0 renders generic message */}
                <NextError statusCode={0} />
            </body>
        </html>
    );
}
