// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyReadings, getMyProfile } from "./actions";
import { getReadingsEnabled } from "@/app/admin/actions";
import { DashboardClient } from "./dashboard-client";

export const metadata = {
    title: "Dashboard - ODOJ Ramadan Tracker",
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const profile = await getMyProfile();

    // Redirect admin to admin dashboard
    if (profile?.role === "admin") redirect("/admin");

    const readings = await getMyReadings();
    const readingsEnabled = await getReadingsEnabled();
    const totalJuz = readings.reduce((sum, r) => sum + (r.juz_obtained || 0), 0);
    const totalPages = readings.reduce((sum, r) => sum + (r.total_pages || 0), 0);

    // Calculate Trending (Today vs Yesterday Productivity)
    // 1. Get current date in WIB (UTC+7)
    const today = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split("T")[0];

    // 2. Get yesterday date in WIB
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // 3. Filter readings for Today and Yesterday
    const readingsToday = readings.filter((r) => r.date === todayStr);
    const readingsYesterday = readings.filter((r) => r.date === yesterdayStr);

    // 4. Sum totals for Today vs Yesterday
    const sumJuzToday = readingsToday.reduce((sum, r) => sum + (r.juz_obtained || 0), 0);
    const sumPagesToday = readingsToday.reduce((sum, r) => sum + (r.total_pages || 0), 0);

    const sumJuzYesterday = readingsYesterday.reduce((sum, r) => sum + (r.juz_obtained || 0), 0);
    const sumPagesYesterday = readingsYesterday.reduce((sum, r) => sum + (r.total_pages || 0), 0);

    // 5. Calculate percentage change (Productivity Trend)
    const calculateTrending = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const trendingJuz = calculateTrending(sumJuzToday, sumJuzYesterday);
    const trendingPages = calculateTrending(sumPagesToday, sumPagesYesterday);

    return (
        <DashboardClient
            profile={profile}
            initialReadings={readings}
            totalJuz={Math.round(totalJuz * 100) / 100}
            totalPages={totalPages}
            readingsEnabled={readingsEnabled}
            trendingJuz={trendingJuz}
            trendingPages={trendingPages}
        />
    );
}
