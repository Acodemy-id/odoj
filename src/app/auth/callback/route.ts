// src/app/auth/callback/route.ts
// Handles Supabase auth callback (email confirmation, etc.)
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // Use the next parameter if it exists, otherwise default to dashboard
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Check if next is a relative path to avoid open redirect vulnerabilities
            const isInternalRedirect = next.startsWith("/");
            const redirectUrl = isInternalRedirect ? `${origin}${next}` : `${origin}/dashboard`;

            return NextResponse.redirect(redirectUrl);
        }
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
