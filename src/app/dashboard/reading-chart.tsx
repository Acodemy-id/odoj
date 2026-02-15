// src/app/dashboard/reading-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface Reading {
    date: string;
    total_pages: number;
}

interface Props {
    readings: Reading[];
}

export function ReadingChart({ readings }: Props) {
    // Aggregate pages by date
    const dailyMap = new Map<string, number>();
    readings.forEach((r) => {
        const current = dailyMap.get(r.date) || 0;
        dailyMap.set(r.date, current + r.total_pages);
    });

    const chartData = Array.from(dailyMap.entries())
        .map(([date, pages]) => ({
            date: new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
            rawDate: date,
            pages,
        }))
        .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    return (
        <Card className="border-emerald-100 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">📊</span>
                    Halaman per Hari
                </CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                        Belum ada data bacaan. Mulai catat tilawah Anda! 🌟
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                label={{ value: "Halaman", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #d1fae5",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                                }}
                                formatter={(value) => [`${value} halaman`, "Dibaca"]}
                            />
                            <Bar
                                dataKey="pages"
                                fill="url(#greenGradient)"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={40}
                            />
                            <defs>
                                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
