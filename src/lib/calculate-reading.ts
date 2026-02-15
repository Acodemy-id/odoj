// src/lib/calculate-reading.ts
// Core logic: convert Surah:Ayah range to page count and juz obtained
import { PAGE_REFERENCES, PAGES_PER_JUZ } from "./quran-metadata";

/**
 * Find the Mushaf page number for a given Surah:Ayah.
 * Uses binary search on PAGE_REFERENCES (sorted by surah, then ayah).
 * Each entry in PAGE_REFERENCES marks the FIRST ayah on that page —
 * so we find the largest page whose (surah, ayah) <= the target.
 */
export function getPageNumber(surah: number, ayah: number): number {
    let low = 0;
    let high = PAGE_REFERENCES.length - 1;
    let result = 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const ref = PAGE_REFERENCES[mid];

        // Compare: is ref <= target?
        if (
            ref.surah < surah ||
            (ref.surah === surah && ref.ayah <= ayah)
        ) {
            result = ref.page;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return result;
}

export interface ReadingProgress {
    startPage: number;
    endPage: number;
    totalPages: number;
    juzObtained: number;
}

/**
 * Calculate pages read and juz obtained from a Surah:Ayah range.
 *
 * Constraint: endSurah:endAyah must be >= startSurah:startAyah
 * (i.e., the reader progresses forward in the Mushaf).
 */
export function calculateReadingProgress(
    startSurah: number,
    startAyah: number,
    endSurah: number,
    endAyah: number
): ReadingProgress {
    const startPage = getPageNumber(startSurah, startAyah);
    const endPage = getPageNumber(endSurah, endAyah);

    if (endPage < startPage) {
        throw new Error(
            `Invalid range: end position (page ${endPage}) is before start position (page ${startPage})`
        );
    }

    const totalPages = endPage - startPage + 1;
    // Keep 2 decimal places for juz
    const juzObtained = Math.round((totalPages / PAGES_PER_JUZ) * 100) / 100;

    return { startPage, endPage, totalPages, juzObtained };
}
