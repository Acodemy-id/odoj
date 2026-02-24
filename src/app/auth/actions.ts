// src/app/auth/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    });

    if (error) {
        return { error: error.message };
    }

    redirect("/dashboard");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;
    const className = formData.get("class_name") as string;

    if (!email || !password || !fullName || !className) {
        return { error: "Semua field harus diisi." };
    }

    if (password.length < 6) {
        return { error: "Password minimal 6 karakter." };
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                class_name: className,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    redirect("/dashboard");
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const origin = formData.get("origin") as string;

    if (!email) {
        return { error: "Email harus diisi." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get("password") as string;

    if (!password || password.length < 6) {
        return { error: "Password minimal 6 karakter." };
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect("/dashboard?message=Password berhasil diperbarui");
}
