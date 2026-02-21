// src/app/leaderboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDailyLeaderboard, getTotalLeaderboard, getAwards } from "./actions";
import { LeaderboardClient } from "./leaderboard-client";

export const metadata = {
    title: "Leaderboard - ODOJ Ramadan Tracker",
};

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export default async function LeaderboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Get user role for bottom nav
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const [daily, total, awards] = await Promise.all([
        getDailyLeaderboard(),
        getTotalLeaderboard(),
        getAwards(),
    ]);

    return <LeaderboardClient dailyData={daily} totalData={total} awardsData={awards} userRole={profile?.role || "student"} userId={user.id} />;
}
