// src/app/admin/admin-chart.tsx
"use client";

import { TrendingUp, Sparkles } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
import { AggregatedData } from "./queries";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";


const chartConfig = {
    pages: {
        label: "Halaman",
        color: "var(--chart-1)",
    },
    juz: {
        label: "Juz",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export function AdminChart({ data }: { data: AggregatedData[] }) {
    const chartData = data
        .map((d) => ({
            date: new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
            rawDate: d.date,
            pages: d.totalPages,
            juz: d.totalJuz,
        }))
        .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    const totalPages = chartData.reduce((sum, d) => sum + d.pages, 0);
    const totalJuz = chartData.reduce((sum, d) => sum + d.juz, 0);
    const avgPages = chartData.length > 0 ? Math.round(totalPages / chartData.length) : 0;
    const avgJuz = chartData.length > 0 ? (totalJuz / chartData.length).toFixed(1) : 0;

    return (
        <Card className="border-emerald-100 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </span>
                    Progress Seluruh Siswa (Per Hari)
                </CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Belum ada data bacaan dari siswa.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                top: 20,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            {/* Pages Line (Green) */}
                            <Line
                                dataKey="pages"
                                type="monotone"
                                stroke="var(--color-pages)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-pages)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={10}
                                />
                            </Line>
                            {/* Juz Line (Orange/Amber) */}
                            <Line
                                dataKey="juz"
                                type="monotone"
                                stroke="var(--color-juz)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-juz)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            >
                                <LabelList
                                    position="bottom"
                                    offset={12}
                                    className="fill-amber-600"
                                    fontSize={10}
                                />
                            </Line>
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
            {chartData.length > 0 && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 leading-none font-medium">
                        <div className="flex items-center gap-1">
                            <span className="w-2 H-2 rounded-full bg-[var(--chart-1)]" />
                            Avg: {avgPages} halaman/hari
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                            <span className="w-2 H-2 rounded-full bg-[var(--chart-2)]" />
                            Avg: {avgJuz} juz/hari
                        </div>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                        Total {totalPages} halaman & {totalJuz.toFixed(1)} juz dari {chartData.length} hari
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
