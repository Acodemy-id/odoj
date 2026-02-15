// scripts/generate-quran-metadata.mjs
// Run: node scripts/generate-quran-metadata.mjs
// Generates src/lib/quran-metadata.ts from the AlQuran API

const API_BASE = "https://api.alquran.cloud/v1";

async function main() {
    console.log("Fetching Quran metadata from API...");
    const res = await fetch(`${API_BASE}/meta`);
    const json = await res.json();
    const data = json.data;

    // Extract surah info
    const surahs = data.surahs.references.map((s) => ({
        number: s.number,
        englishName: s.englishName,
        numberOfAyahs: s.numberOfAyahs,
    }));

    // Extract page references (604 pages)
    // Each entry is { surah, ayah } marking the START of that page
    const pageRefs = data.pages.references.map((ref, idx) => ({
        page: idx + 1,
        surah: ref.surah,
        ayah: ref.ayah,
    }));

    // Extract juz references (30 juz)
    const juzRefs = data.juzs.references.map((ref, idx) => ({
        juz: idx + 1,
        surah: ref.surah,
        ayah: ref.ayah,
    }));

    const output = `// src/lib/quran-metadata.ts
// Auto-generated from https://api.alquran.cloud/v1/meta
// DO NOT EDIT MANUALLY — run: node scripts/generate-quran-metadata.mjs

export interface SurahInfo {
  number: number;
  englishName: string;
  numberOfAyahs: number;
}

export interface PageReference {
  page: number;
  surah: number;
  ayah: number;
}

export interface JuzReference {
  juz: number;
  surah: number;
  ayah: number;
}

export const SURAHS: SurahInfo[] = ${JSON.stringify(surahs, null, 2)} as const;

export const PAGE_REFERENCES: PageReference[] = ${JSON.stringify(pageRefs, null, 2)} as const;

export const JUZ_REFERENCES: JuzReference[] = ${JSON.stringify(juzRefs, null, 2)} as const;

export const TOTAL_PAGES = 604;
export const TOTAL_JUZ = 30;
export const PAGES_PER_JUZ = 20;
`;

    const fs = await import("fs");
    const path = await import("path");
    const outPath = path.join(process.cwd(), "src", "lib", "quran-metadata.ts");
    fs.writeFileSync(outPath, output, "utf-8");
    console.log(`Generated ${outPath}`);
    console.log(`  Surahs: ${surahs.length}`);
    console.log(`  Pages: ${pageRefs.length}`);
    console.log(`  Juz: ${juzRefs.length}`);
}

main().catch(console.error);
