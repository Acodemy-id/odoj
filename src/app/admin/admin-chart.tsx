// src/app/admin/admin-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface AggregatedData {
    date: string;
    totalPages: number;
}

export function AdminChart({ data }: { data: AggregatedData[] }) {
    const chartData = data.map((d) => ({
        date: new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        rawDate: d.date,
        pages: d.totalPages,
    })).sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    // Calculate cumulative
    let cumulative = 0;
    const cumulativeData = chartData.map((d) => {
        cumulative += d.pages;
        return { ...d, cumulative };
    });

    return (
        <Card className="border-emerald-100 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">📈</span>
                    Progress Seluruh Siswa
                </CardTitle>
            </CardHeader>
            <CardContent>
                {cumulativeData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                        Belum ada data bacaan dari siswa.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={cumulativeData}>
                            <defs>
                                <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #d1fae5",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                                }}
                                formatter={(value) => [
                                    `${value} halaman`,
                                    "Kumulatif",
                                ]}
                            />
                            <Area
                                type="monotone"
                                dataKey="cumulative"
                                stroke="#059669"
                                strokeWidth={2}
                                fill="url(#areaGreen)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
