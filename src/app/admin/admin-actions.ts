// src/app/admin/admin-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateReadingProgress } from "@/lib/calculate-reading";
import { SURAHS } from "@/lib/quran-metadata";

/**
 * Recalculate all awards for all users based on historical reading data.
 * Admin-only. Clears existing awards and recomputes from scratch.
 */
export async function recalculateAllAwards(): Promise<{ success: boolean; error?: string; stats?: { users: number; awards: number } }> {
    const supabase = await createClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") return { success: false, error: "Forbidden - Admin only" };

    try {
        // 1. Clear all existing awards to recalculate from scratch
        const { error: deleteError } = await supabase
            .from("user_awards")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

        if (deleteError) return { success: false, error: `Failed to clear awards: ${deleteError.message}` };

        // 2. Get all readings with created_at for timing awards
        const { data: allReadings, error: readError } = await supabase
            .from("readings")
            .select("user_id, date, juz_obtained, total_pages, created_at")
            .order("date", { ascending: true });

        if (readError) return { success: false, error: `Failed to fetch readings: ${readError.message}` };
        if (!allReadings || allReadings.length === 0) return { success: true, stats: { users: 0, awards: 0 } };

        // 3. Group readings by user
        const userReadings = new Map<string, typeof allReadings>();
        allReadings.forEach(r => {
            const arr = userReadings.get(r.user_id) || [];
            arr.push(r);
            userReadings.set(r.user_id, arr);
        });

        let totalAwards = 0;
        const awardsToInsert: Array<{
            user_id: string;
            award_type: string;
            award_value: number;
            metadata: Record<string, unknown>;
        }> = [];

        // 4. Process each user
        for (const [userId, readings] of userReadings) {
            // --- KHATAM & FINISHER ---
            const totalJuz = readings.reduce((sum, r) => sum + r.juz_obtained, 0);
            const khatamCount = Math.floor(totalJuz / 30);
            for (let i = 1; i <= khatamCount; i++) {
                awardsToInsert.push({
                    user_id: userId,
                    award_type: "khatam",
                    award_value: i,
                    metadata: { total_juz: totalJuz }
                });
                awardsToInsert.push({
                    user_id: userId,
                    award_type: "finisher",
                    award_value: i,
                    metadata: { total_juz: i * 30 }
                });
            }

            // --- TIMING AWARDS (per reading entry) ---
            const earlyBirdDates = new Set<string>();
            readings.forEach(r => {
                const createdDate = new Date(r.created_at);
                const wibHour = (createdDate.getUTCHours() + 7) % 24;

                // Early Bird: before 07:00 WIB
                if (wibHour < 7 && !earlyBirdDates.has(r.date)) {
                    earlyBirdDates.add(r.date);
                    awardsToInsert.push({
                        user_id: userId,
                        award_type: "early_bird",
                        award_value: 1,
                        metadata: { date: r.date, hour: wibHour }
                    });
                }
            });

            // --- ODOJ AWARD (>= 1.0 juz per day) ---
            const dailyJuz = new Map<string, number>();
            readings.forEach(r => {
                dailyJuz.set(r.date, (dailyJuz.get(r.date) || 0) + r.juz_obtained);
            });
            for (const [date, total] of dailyJuz) {
                if (total >= 1.0) {
                    awardsToInsert.push({
                        user_id: userId,
                        award_type: "odoj",
                        award_value: 1,
                        metadata: { date, total_juz: total }
                    });
                }
            }

            // --- STREAK ---
            const uniqueDates = Array.from(new Set(readings.map(r => r.date))).sort((a, b) => b.localeCompare(a));

            if (uniqueDates.length > 0) {
                // Calculate max streak (not just current) for backfill purposes
                let maxStreak = 1;
                let currentStreak = 1;

                // Sort ascending for streak calculation
                const sortedDates = [...uniqueDates].sort((a, b) => a.localeCompare(b));
                for (let i = 1; i < sortedDates.length; i++) {
                    const prev = new Date(sortedDates[i - 1]);
                    const curr = new Date(sortedDates[i]);
                    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        currentStreak++;
                        maxStreak = Math.max(maxStreak, currentStreak);
                    } else {
                        currentStreak = 1;
                    }
                }

                const thresholds = [3, 7, 15, 30];
                for (const threshold of thresholds) {
                    if (maxStreak >= threshold) {
                        awardsToInsert.push({
                            user_id: userId,
                            award_type: "streak",
                            award_value: threshold,
                            metadata: { max_streak: maxStreak }
                        });
                    }
                }
            }

            // --- SPRINT READER ---
            const dailyTotals = new Map<string, number>();
            readings.forEach(r => {
                dailyTotals.set(r.date, (dailyTotals.get(r.date) || 0) + r.juz_obtained);
            });
            const sprintDates = Array.from(dailyTotals.keys()).sort((a, b) => a.localeCompare(b));
            const sprintAwarded = new Set<string>();

            for (let d = 1; d < sprintDates.length; d++) {
                const date = sprintDates[d];
                const todayVol = dailyTotals.get(date) || 0;

                // Average of up to 7 previous days
                let prevSum = 0;
                let count = 0;
                for (let j = Math.max(0, d - 7); j < d; j++) {
                    prevSum += dailyTotals.get(sprintDates[j]) || 0;
                    count++;
                }
                if (count === 0) continue;
                const avgPrev = prevSum / count;

                if (avgPrev > 0 && todayVol > avgPrev * 1.5 && !sprintAwarded.has(date)) {
                    sprintAwarded.add(date);
                    awardsToInsert.push({
                        user_id: userId,
                        award_type: "sprint",
                        award_value: 1,
                        metadata: { date, today_vol: todayVol, avg_prev: avgPrev }
                    });
                }
            }
        }

        // 5. Batch insert all awards (chunks of 500 to avoid payload limits)
        const CHUNK_SIZE = 500;
        for (let i = 0; i < awardsToInsert.length; i += CHUNK_SIZE) {
            const chunk = awardsToInsert.slice(i, i + CHUNK_SIZE);
            const { error: insertError } = await supabase
                .from("user_awards")
                .insert(chunk);

            if (insertError) {
                return { success: false, error: `Failed to insert awards (batch ${Math.floor(i / CHUNK_SIZE) + 1}): ${insertError.message}` };
            }
        }

        totalAwards = awardsToInsert.length;

        return {
            success: true,
            stats: {
                users: userReadings.size,
                awards: totalAwards
            }
        };
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

/**
 * Admin can update any student's reading
 */
export async function updateStudentReading(readingId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { error: "Forbidden - Admin only" };
    }

    const startSurah = parseInt(formData.get("start_surah") as string);
    const startAyah = parseInt(formData.get("start_ayah") as string);
    const endSurah = parseInt(formData.get("end_surah") as string);
    const endAyah = parseInt(formData.get("end_ayah") as string);

    // Validate inputs
    if ([startSurah, startAyah, endSurah, endAyah].some(isNaN)) {
        return { error: "Input tidak valid. Pastikan semua field terisi." };
    }

    // Validate surah range
    const startSurahData = SURAHS.find((s) => s.number === startSurah);
    const endSurahData = SURAHS.find((s) => s.number === endSurah);
    if (!startSurahData || !endSurahData) {
        return { error: "Surah tidak ditemukan." };
    }

    // Validate ayah range
    if (startAyah < 1 || startAyah > startSurahData.numberOfAyahs) {
        return { error: `Ayat awal harus antara 1 dan ${startSurahData.numberOfAyahs}.` };
    }
    if (endAyah < 1 || endAyah > endSurahData.numberOfAyahs) {
        return { error: `Ayat akhir harus antara 1 dan ${endSurahData.numberOfAyahs}.` };
    }

    // Validate logical order
    if (endSurah < startSurah || (endSurah === startSurah && endAyah < startAyah)) {
        return { error: "Posisi akhir harus setelah posisi awal." };
    }

    try {
        const { totalPages, juzObtained } = calculateReadingProgress(
            startSurah, startAyah, endSurah, endAyah
        );

        const { error } = await supabase
            .from("readings")
            .update({
                start_surah: startSurah,
                start_ayah: startAyah,
                end_surah: endSurah,
                end_ayah: endAyah,
                total_pages: totalPages,
                juz_obtained: juzObtained,
            })
            .eq("id", readingId);

        if (error) return { error: error.message };
        return { success: true, totalPages, juzObtained };
    } catch (e) {
        return { error: (e as Error).message };
    }
}

/**
 * Admin can delete any student's reading
 */
export async function deleteStudentReading(readingId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { error: "Forbidden - Admin only" };
    }

    const { error } = await supabase
        .from("readings")
        .delete()
        .eq("id", readingId);

    if (error) return { error: error.message };
    return { success: true };
}