// src/app/admin/admin-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateReadingProgress } from "@/lib/calculate-reading";
import { SURAHS } from "@/lib/quran-metadata";

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