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

    return (
        <DashboardClient
            profile={profile}
            initialReadings={readings}
            totalJuz={Math.round(totalJuz * 100) / 100}
            totalPages={totalPages}
            readingsEnabled={readingsEnabled}
        />
    );
}
