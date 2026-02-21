import { createClient } from "@/lib/supabase/server";

export interface AggregatedData {
    date: string;
    totalPages: number;
    totalJuz: number;
}

export async function getAllReadingsAggregated(): Promise<AggregatedData[]> {
    const supabase = await createClient();

    // Get all readings, aggregated by date
    const { data, error } = await supabase
        .from("readings")
        .select("date, total_pages, juz_obtained")
        .order("date", { ascending: true });

    if (error) {
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
