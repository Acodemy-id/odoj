// src/components/hadith-card.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface HadithData {
    text: { ar: string; id: string };
    grade: string;
    takhrij: string;
}

export function HadithCard() {
    const [hadith, setHadith] = useState<HadithData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Check localStorage for cached hadith (same day = same hadith)
        const today = new Date().toISOString().split("T")[0];
        const cached = localStorage.getItem("odoj_hadith");

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.date === today && parsed.data) {
                    setHadith(parsed.data);
                    setLoading(false);
                    return;
                }
            } catch {
                // Invalid cache, fetch fresh
            }
        }

        fetch("https://api.myquran.com/v3/hadis/enc/random")
            .then((res) => res.json())
            .then((json) => {
                if (json.status && json.data) {
                    setHadith(json.data);
                    // Cache for the day to avoid unnecessary API calls
                    localStorage.setItem(
                        "odoj_hadith",
                        JSON.stringify({ date: today, data: json.data })
                    );
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Card className="border-amber-100 shadow-md overflow-hidden">
                <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                        <div className="h-3 bg-amber-100 rounded w-1/3" />
                        <div className="h-4 bg-amber-50 rounded w-full" />
                        <div className="h-4 bg-amber-50 rounded w-3/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !hadith) return null;

    // Truncate long hadith text for display
    const idText = hadith.text.id.length > 300
        ? hadith.text.id.substring(0, 300) + "..."
        : hadith.text.id;

    return (
        <Card className="border-amber-100 shadow-md overflow-hidden bg-gradient-to-br from-amber-50/80 to-orange-50/50">
            <CardContent className="p-4 space-y-3">
                {/* Title */}
                <div className="flex items-center gap-2">
                    <span className="text-lg">📜</span>
                    <h3 className="text-sm font-bold text-amber-800">Hadis Hari Ini</h3>
                </div>

                {/* Arabic text */}
                <p
                    dir="rtl"
                    className="text-base leading-loose text-gray-800 font-serif text-right"
                >
                    {hadith.text.ar.length > 200
                        ? hadith.text.ar.substring(0, 200) + "..."
                        : hadith.text.ar}
                </p>

                {/* Divider */}
                <div className="border-t border-amber-200/60" />

                {/* Indonesian translation */}
                <p className="text-sm text-gray-700 leading-relaxed">{idText}</p>

                {/* Grade & Takhrij */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {hadith.grade}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {hadith.takhrij}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
