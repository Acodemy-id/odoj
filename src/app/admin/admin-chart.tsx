// src/app/admin/admin-chart.tsx
"use client";

import { TrendingUp, Sparkles } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

interface AggregatedData {
    date: string;
    totalPages: number;
}

const chartConfig = {
    pages: {
        label: "Halaman",
        color: "var(--chart-1)",
    },
    cumulative: {
        label: "Kumulatif",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export function AdminChart({ data }: { data: AggregatedData[] }) {
    const chartData = data
        .map((d) => ({
            date: new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
            rawDate: d.date,
            pages: d.totalPages,
        }))
        .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    // Calculate cumulative
    let cumulative = 0;
    const cumulativeData = chartData.map((d) => {
        cumulative += d.pages;
        return { ...d, cumulative };
    });

    const totalPages = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1].cumulative : 0;
    const avgPages = chartData.length > 0 ? Math.round(totalPages / chartData.length) : 0;

    return (
        <Card className="border-emerald-100 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </span>
                    Progress Seluruh Siswa
                </CardTitle>
            </CardHeader>
            <CardContent>
                {cumulativeData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Belum ada data bacaan dari siswa.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={cumulativeData}
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
                            <Line
                                dataKey="cumulative"
                                type="natural"
                                stroke="var(--color-cumulative)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-cumulative)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Line>
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
            {cumulativeData.length > 0 && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                        Total kumulatif {totalPages} halaman
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                        Rata-rata {avgPages} halaman/hari dari {chartData.length} hari
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
