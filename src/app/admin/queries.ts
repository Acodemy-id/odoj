import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase-helpers";

export interface AggregatedData {
    date: string;
    totalPages: number;
    totalJuz: number;
}

export async function getAllReadingsAggregated(): Promise<AggregatedData[]> {
    const supabase = await createClient();

    // Fetch ALL readings with pagination to bypass Supabase's 1000-row default limit
    let data: { date: string; total_pages: number; juz_obtained: number | null }[];
    try {
        data = await fetchAllRows(supabase, "readings", "date, total_pages, juz_obtained", {
            order: { column: "date", ascending: true }
        });
    } catch (error) {
        console.error("Error fetching aggregated readings:", error);
        return [];
    }

    // Group by date and sum pages and juz
    const dailyMap = new Map<string, { totalPages: number; totalJuz: number }>();
    (data || []).forEach((r: { date: string; total_pages: number; juz_obtained: number | null }) => {
        const existing = dailyMap.get(r.date) || { totalPages: 0, totalJuz: 0 };
        dailyMap.set(r.date, {
            totalPages: existing.totalPages + r.total_pages,
            totalJuz: existing.totalJuz + (r.juz_obtained || 0)
        });
    });

    return Array.from(dailyMap.entries()).map(([date, stats]) => ({
        date,
        totalPages: stats.totalPages,
        totalJuz: parseFloat(stats.totalJuz.toFixed(2))
    }));
}
