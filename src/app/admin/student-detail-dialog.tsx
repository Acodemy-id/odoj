// src/app/admin/student-detail-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { getStudentReadings } from "./actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Student {
    id: string;
    fullName: string;
    className: string;
    totalPages: number;
    totalJuz: number;
}

interface Props {
    student: Student | null;
    open: boolean;
    onClose: () => void;
}

export function StudentDetailDialog({ student, open, onClose }: Props) {
    const [readings, setReadings] = useState<{ date: string; total_pages: number }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student && open) {
            setLoading(true);
            getStudentReadings(student.id).then((data) => {
                setReadings(data);
                setLoading(false);
            });
        }
    }, [student, open]);

    // Aggregate by date
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
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        {student?.fullName}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {student?.className}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-700">{student?.totalJuz}</p>
                        <p className="text-xs text-emerald-600">Total Juz</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-amber-700">{student?.totalPages}</p>
                        <p className="text-xs text-amber-600">Total Halaman</p>
                    </div>
                </div>

                {loading ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                        Memuat data...
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                        Belum ada data bacaan.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "1px solid #d1fae5" }}
                                formatter={(value) => [`${value} halaman`, "Dibaca"]}
                            />
                            <Bar dataKey="pages" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </DialogContent>
        </Dialog>
    );
}
