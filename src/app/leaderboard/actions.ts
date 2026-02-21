// src/app/leaderboard/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export interface LeaderboardEntry {
    userId: string;
    fullName: string;
    className: string;
    totalPages: number;
    totalJuz: number;
    khatamCount: number;
    rank: number;
}

/**
 * Daily leaderboard — ranks students by pages read TODAY
 */
export async function getDailyLeaderboard(): Promise<LeaderboardEntry[]> {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    // Get today's readings
    const { data: readings, error: readingErr } = await supabase
        .from("readings")
        .select("user_id, total_pages, juz_obtained")
        .eq("date", today);

    if (readingErr || !readings) return [];

    // Get all student profiles
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, class_name")
        .eq("role", "student");

    if (!profiles) return [];

    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    // Aggregate per user for today
    const userTotals = new Map<string, { pages: number; juz: number }>();
    readings.forEach((r) => {
        const current = userTotals.get(r.user_id) || { pages: 0, juz: 0 };
        current.pages += r.total_pages;
        current.juz += r.juz_obtained;
        userTotals.set(r.user_id, current);
    });

    // Get khatam awards for these users
    const { data: awards } = await supabase
        .from("user_awards")
        .select("user_id, award_value")
        .eq("award_type", "khatam");

    const khatamMap = new Map<string, number>();
    awards?.forEach(a => {
        const currentMax = khatamMap.get(a.user_id) || 0;
        if (a.award_value > currentMax) {
            khatamMap.set(a.user_id, a.award_value);
        }
    });

    // Build sorted array
    const entries: LeaderboardEntry[] = Array.from(userTotals.entries())
        .map(([userId, totals]) => {
            const profile = profileMap.get(userId);
            return {
                userId,
                fullName: profile?.full_name || "Unknown",
                className: profile?.class_name || "-",
                totalPages: totals.pages,
                totalJuz: Math.round(totals.juz * 100) / 100,
                khatamCount: khatamMap.get(userId) || 0,
                rank: 0,
            };
        })
        .sort((a, b) => b.totalPages - a.totalPages);

    // Assign ranks
    entries.forEach((e, i) => {
        e.rank = i + 1;
    });

    return entries;
}

/**
 * Total leaderboard — ranks students by all-time pages read
 */
export async function getTotalLeaderboard(): Promise<LeaderboardEntry[]> {
    const supabase = await createClient();

    // Get all readings
    const { data: readings, error: readingErr } = await supabase
        .from("readings")
        .select("user_id, total_pages, juz_obtained");

    if (readingErr || !readings) return [];

    // Get all student profiles
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, class_name")
        .eq("role", "student");

    if (!profiles) return [];

    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    // Aggregate all-time per user
    const userTotals = new Map<string, { pages: number; juz: number }>();
    readings.forEach((r) => {
        const current = userTotals.get(r.user_id) || { pages: 0, juz: 0 };
        current.pages += r.total_pages;
        current.juz += r.juz_obtained;
        userTotals.set(r.user_id, current);
    });

    // Get khatam awards for these users
    const { data: awards } = await supabase
        .from("user_awards")
        .select("user_id, award_value")
        .eq("award_type", "khatam");

    const khatamMap = new Map<string, number>();
    awards?.forEach(a => {
        const currentMax = khatamMap.get(a.user_id) || 0;
        if (a.award_value > currentMax) {
            khatamMap.set(a.user_id, a.award_value);
        }
    });

    // Include all students (even those with 0 readings)
    const entries: LeaderboardEntry[] = profiles
        .filter((p) => p.class_name) // safety check
        .map((p) => {
            const totals = userTotals.get(p.id) || { pages: 0, juz: 0 };
            return {
                userId: p.id,
                fullName: p.full_name,
                className: p.class_name,
                totalPages: totals.pages,
                totalJuz: Math.round(totals.juz * 100) / 100,
                khatamCount: khatamMap.get(p.id) || 0,
                rank: 0,
            };
        })
        .sort((a, b) => b.totalPages - a.totalPages);

    entries.forEach((e, i) => {
        e.rank = i + 1;
    });

    return entries;
}

export interface AwardEntry {
    userId: string;
    fullName: string;
    className: string;
    awardType: string;
    awardValue: number;
    achievedAt: string;
}

/**
 * Get all awards for Wall of Fame
 */
export async function getAwards(): Promise<AwardEntry[]> {
    const supabase = await createClient();

    const { data: awards, error: awardErr } = await supabase
        .from("user_awards")
        .select(`
            user_id,
            award_type,
            award_value,
            achieved_at,
            profiles (
                full_name,
                class_name
            )
        `)
        .order("achieved_at", { ascending: false });

    if (awardErr || !awards) return [];

    return awards.map((a: any) => ({
        userId: a.user_id,
        fullName: a.profiles?.full_name || "Unknown",
        className: a.profiles?.class_name || "-",
        awardType: a.award_type,
        awardValue: a.award_value,
        achievedAt: a.achieved_at,
    }));
}
