// src/app/dashboard/reading-form.tsx
"use client";

import { useState, useTransition } from "react";
import { submitReading } from "./actions";
import { SURAHS } from "@/lib/quran-metadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PenLine } from "lucide-react";
import { toast } from "sonner";

export function ReadingForm({ onSuccess }: { onSuccess: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [startSurah, setStartSurah] = useState("");
    const [endSurah, setEndSurah] = useState("");
    const [startAyah, setStartAyah] = useState("");
    const [endAyah, setEndAyah] = useState("");

    const startSurahData = SURAHS.find((s) => s.number === parseInt(startSurah));
    const endSurahData = SURAHS.find((s) => s.number === parseInt(endSurah));

    const isFormValid = startSurah && endSurah && startAyah && endAyah;

    async function handleSubmit(formData: FormData) {
        if (isPending) return; // Prevent double submit

        formData.set("start_surah", startSurah);
        formData.set("end_surah", endSurah);
        formData.set("start_ayah", startAyah);
        formData.set("end_ayah", endAyah);

        startTransition(async () => {
            const result = await submitReading(formData);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success(
                `Berhasil dicatat! ${result.totalPages} halaman (${result.juzObtained} juz)`
            );
            // Reset form
            setStartSurah("");
            setEndSurah("");
            setStartAyah("");
            setEndAyah("");
            onSuccess();
        });
    }

    return (
        <Card className={`border-emerald-100 shadow-lg transition-opacity ${isPending ? 'opacity-80' : ''}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <PenLine className="w-4 h-4 text-emerald-600" />
                    </span>
                    Catat Tilawah Hari Ini
                </CardTitle>
                <CardDescription>Masukkan ayat yang dibaca hari ini</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    {/* Date Selection */}
                    <div className="p-3 bg-blue-50/50 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-blue-700">Tanggal Bacaan:</p>
                        <Select name="date_option" defaultValue="today">
                            <SelectTrigger className="w-full h-10 bg-white">
                                <SelectValue placeholder="Pilih tanggal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hari ini</SelectItem>
                                <SelectItem value="yesterday">Kemarin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start position */}
                    <div className="p-3 bg-emerald-50/50 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-emerald-700">Mulai dari:</p>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Surah</Label>
                                <Select
                                    value={startSurah}
                                    onValueChange={setStartSurah}
                                    disabled={isPending}
                                >
                                    <SelectTrigger className="w-full h-10 bg-white">
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
                                    disabled={isPending || !startSurah}
                                    value={startAyah}
                                    onChange={(e) => setStartAyah(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* End position */}
                    <div className="p-3 bg-amber-50/50 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-amber-700">Sampai:</p>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Surah</Label>
                                <Select
                                    value={endSurah}
                                    onValueChange={setEndSurah}
                                    disabled={isPending}
                                >
                                    <SelectTrigger className="w-full h-10 bg-white">
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
                                    disabled={isPending || !endSurah}
                                    value={endAyah}
                                    onChange={(e) => setEndAyah(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button with Loading */}
                    <Button
                        type="submit"
                        disabled={!isFormValid || isPending}
                        className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Bacaan"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}