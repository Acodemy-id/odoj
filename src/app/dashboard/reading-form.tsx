// src/app/dashboard/reading-form.tsx
"use client";

import { useState } from "react";
import { submitReading } from "./actions";
import { SURAHS } from "@/lib/quran-metadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function ReadingForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [startSurah, setStartSurah] = useState("");
    const [endSurah, setEndSurah] = useState("");

    const startSurahData = SURAHS.find((s) => s.number === parseInt(startSurah));
    const endSurahData = SURAHS.find((s) => s.number === parseInt(endSurah));

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.set("start_surah", startSurah);
        formData.set("end_surah", endSurah);

        const result = await submitReading(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success(
            `Berhasil dicatat! ${result.totalPages} halaman (${result.juzObtained} juz)`
        );
        setStartSurah("");
        setEndSurah("");
        onSuccess();
    }

    return (
        <Card className="border-emerald-100 shadow-lg">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">📝</span>
                    Catat Tilawah Hari Ini
                </CardTitle>
                <CardDescription>Masukkan ayat yang dibaca hari ini</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    {/* Start position */}
                    <div className="p-3 bg-emerald-50/50 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-emerald-700">Mulai dari:</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Surah</Label>
                                <Select value={startSurah} onValueChange={setStartSurah}>
                                    <SelectTrigger className="h-10 bg-white">
                                        <SelectValue placeholder="Pilih surah" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {SURAHS.map((s) => (
                                            <SelectItem key={s.number} value={String(s.number)}>
                                                {s.number}. {s.englishName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Ayat {startSurahData ? `(1-${startSurahData.numberOfAyahs})` : ""}
                                </Label>
                                <Input
                                    name="start_ayah"
                                    type="number"
                                    min={1}
                                    max={startSurahData?.numberOfAyahs}
                                    placeholder="1"
                                    required
                                    className="h-10 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* End position */}
                    <div className="p-3 bg-amber-50/50 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-amber-700">Sampai:</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Surah</Label>
                                <Select value={endSurah} onValueChange={setEndSurah}>
                                    <SelectTrigger className="h-10 bg-white">
                                        <SelectValue placeholder="Pilih surah" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {SURAHS.map((s) => (
                                            <SelectItem key={s.number} value={String(s.number)}>
                                                {s.number}. {s.englishName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Ayat {endSurahData ? `(1-${endSurahData.numberOfAyahs})` : ""}
                                </Label>
                                <Input
                                    name="end_ayah"
                                    type="number"
                                    min={1}
                                    max={endSurahData?.numberOfAyahs}
                                    placeholder="1"
                                    required
                                    className="h-10 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !startSurah || !endSurah}
                        className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-md"
                    >
                        {loading ? "Menyimpan..." : "Simpan Bacaan"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
