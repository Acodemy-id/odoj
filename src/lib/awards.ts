// src/lib/awards.ts
import { createClient } from "@/lib/supabase/server";

export type AwardType = 'khatam' | 'streak' | 'early_bird' | 'odoj' | 'sprint' | 'finisher';

/**
 * Check and award Milestone: Khatam (every 30 juz)
 */
export async function checkAndAwardKhatam(userId: string) {
    const supabase = await createClient();

    // 1. Calculate total juz obtained
    const { data: readings } = await supabase
        .from("readings")
        .select("juz_obtained")
        .eq("user_id", userId);

    if (!readings) return;

    const totalJuz = readings.reduce((sum, r) => sum + r.juz_obtained, 0);
    const khatamCount = Math.floor(totalJuz / 30);

    if (khatamCount <= 0) return;

    // 2. Check existing khatam awards
    const { data: existingAwards } = await supabase
        .from("user_awards")
        .select("award_value")
        .eq("user_id", userId)
        .eq("award_type", "khatam");

    const awardedValues = new Set(existingAwards?.map(a => a.award_value) || []);

    // 3. Award new milestones
    for (let i = 1; i <= khatamCount; i++) {
        if (!awardedValues.has(i)) {
            await supabase.from("user_awards").insert({
                user_id: userId,
                award_type: "khatam",
                award_value: i,
                metadata: { total_juz: totalJuz }
            });
        }
    }

    // Check for "The Finisher" if totalJuz is exactly multiple of 30 or just reached a new 30
    // Actually, any khatam is a finisher moment.
    const { data: existingFinisher } = await supabase
        .from("user_awards")
        .select("id")
        .eq("user_id", userId)
        .eq("award_type", "finisher")
        .eq("award_value", khatamCount)
        .single();

    if (!existingFinisher) {
        await supabase.from("user_awards").insert({
            user_id: userId,
            award_type: "finisher",
            award_value: khatamCount,
            metadata: { total_juz: totalJuz, date: new Date().toISOString().split('T')[0] }
        });
    }
}

/**
 * Check and award Activity: Timing based (Early Bird)
 */
export async function checkAndAwardTiming(userId: string, createdAt: string, date: string) {
    const supabase = await createClient();

    // createdAt is UTC. We need to check in WIB (UTC+7)
    const createdDate = new Date(createdAt);
    const wibHour = (createdDate.getUTCHours() + 7) % 24;

    // 1. Morning Star (Early Bird): Reported before 07:00 WIB
    if (wibHour < 7) {
        // Check if already awarded for THIS specific date
        const { data: existing } = await supabase
            .from("user_awards")
            .select("id")
            .eq("user_id", userId)
            .eq("award_type", "early_bird")
            .eq("metadata->>date", date)
            .single();

        if (!existing) {
            await supabase.from("user_awards").insert({
                user_id: userId,
                award_type: "early_bird",
                award_value: 1,
                metadata: { date, hour: wibHour }
            });
        }
    }
}

/**
 * Check and award Intensity: ODOJ Award (>= 1.0 juz in one day)
 */
export async function checkAndAwardODOJ(userId: string, date: string) {
    const supabase = await createClient();

    // Get all readings for that date
    const { data: dayReadings } = await supabase
        .from("readings")
        .select("juz_obtained")
        .eq("user_id", userId)
        .eq("date", date);

    if (!dayReadings) return;

    const dayTotal = dayReadings.reduce((sum, r) => sum + r.juz_obtained, 0);

    if (dayTotal >= 1.0) {
        const { data: existing } = await supabase
            .from("user_awards")
            .select("id")
            .eq("user_id", userId)
            .eq("award_type", "odoj")
            .eq("metadata->>date", date)
            .single();

        if (!existing) {
            await supabase.from("user_awards").insert({
                user_id: userId,
                award_type: "odoj",
                award_value: 1,
                metadata: { date, total_juz: dayTotal }
            });
        }
    }
}

/**
 * Check and award Activity: Istiqomah Streak
 */
export async function checkAndAwardStreak(userId: string) {
    const supabase = await createClient();

    // 1. Get all unique dates for this user, sorted descending
    const { data: readings } = await supabase
        .from("readings")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: false });

    if (!readings || readings.length === 0) return;

    // Filter unique dates
    const uniqueDates = Array.from(new Set(readings.map(r => r.date)));

    // 2. Calculate current streak
    let currentStreak = 0;
    const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split("T")[0];
    const yesterday = new Date(Date.now() + 7 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Check if the latest report is today or yesterday (otherwise streak is broken)
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        currentStreak = 0;
    } else {
        currentStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const current = new Date(uniqueDates[i]);
            const next = new Date(uniqueDates[i + 1]);
            const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    if (currentStreak < 3) return; // Minimum 3 days for an award

    // 3. Award thresholds: 3, 7, 15, 30
    const thresholds = [3, 7, 15, 30];
    const { data: existingAwards } = await supabase
        .from("user_awards")
        .select("award_value")
        .eq("user_id", userId)
        .eq("award_type", "streak");

    const awardedValues = new Set(existingAwards?.map(a => a.award_value) || []);

    for (const threshold of thresholds) {
        if (currentStreak >= threshold && !awardedValues.has(threshold)) {
            await supabase.from("user_awards").insert({
                user_id: userId,
                award_type: "streak" as AwardType,
                award_value: threshold,
                metadata: { current_streak: currentStreak }
            });
        }
    }
}

/**
 * Check and award Intensity: Sprint Reader (Increase > 50% vs last 7 days average)
 */
export async function checkAndAwardSprint(userId: string, date: string) {
    const supabase = await createClient();

    // 1. Get all readings for this user to calculate historical average
    const { data: readings } = await supabase
        .from("readings")
        .select("date, juz_obtained")
        .eq("user_id", userId)
        .order("date", { ascending: false });

    if (!readings || readings.length === 0) return;

    // Aggregate by date
    const dailyTotals = new Map<string, number>();
    readings.forEach(r => {
        dailyTotals.set(r.date, (dailyTotals.get(r.date) || 0) + r.juz_obtained);
    });

    const uniqueDates = Array.from(dailyTotals.keys()).sort((a, b) => b.localeCompare(a));

    // Find index of the current date
    const todayIndex = uniqueDates.indexOf(date);
    if (todayIndex === -1 || uniqueDates.length - todayIndex < 2) return; // Need at least one previous day

    const todayVol = dailyTotals.get(date) || 0;

    // Calculate average of previous days (up to 7 days before today)
    let prevSum = 0;
    let count = 0;
    for (let i = todayIndex + 1; i < Math.min(uniqueDates.length, todayIndex + 8); i++) {
        prevSum += dailyTotals.get(uniqueDates[i]) || 0;
        count++;
    }

    if (count === 0) return;
    const avgPrev = prevSum / count;

    // Award if today's volume is > 50% higher than average
    if (avgPrev > 0 && todayVol > avgPrev * 1.5) {
        const { data: existing } = await supabase
            .from("user_awards")
            .select("id")
            .eq("user_id", userId)
            .eq("award_type", "sprint")
            .eq("metadata->>date", date)
            .single();

        if (!existing) {
            await supabase.from("user_awards").insert({
                user_id: userId,
                award_type: "sprint",
                award_value: 1,
                metadata: { date, today_vol: todayVol, avg_prev: avgPrev }
            });
        }
    }
}
