// src/app/auth/callback/route.ts
// Handles Supabase auth callback (email confirmation, etc.)
import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as "recovery" | "signup" | "invite" | "magiclink" | null;
    const next = searchParams.get("next") ?? "/dashboard";

    const supabase = await createClient();

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const isInternalRedirect = next.startsWith("/");
            return NextResponse.redirect(`${origin}${isInternalRedirect ? next : "/dashboard"}`);
        }

        // Error exchanging code
        console.error("Auth callback (code exchange) error:", error.message);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (!error) {
            const isInternalRedirect = next.startsWith("/");
            return NextResponse.redirect(`${origin}${isInternalRedirect ? next : "/dashboard"}`);
        }

        // Error verifying OTP
        console.error("Auth callback (token_hash) error:", error.message);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
