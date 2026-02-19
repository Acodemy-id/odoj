// src/app/profile/profile-client.tsx
"use client";

import { useState, useTransition } from "react";
import { logout } from "@/app/auth/actions";
import { updateReading, deleteReading } from "@/app/dashboard/actions";
import { StudentBottomNav } from "@/components/bottom-nav";
import { SURAHS } from "@/lib/quran-metadata";
import { User, ClipboardList, LogOut, Pencil, Trash2, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Reading {
    id: string;
    date: string;
    start_surah: number;
    start_ayah: number;
    end_surah: number;
    end_ayah: number;
    total_pages: number;
    juz_obtained: number;
}

interface Props {
    profile: { full_name: string; class_name: string; role: string } | null;
    readings: Reading[];
    totalJuz: number;
    totalPages: number;
}

function getSurahName(num: number) {
    return SURAHS.find((s) => s.number === num)?.englishName || `Surah ${num}`;
}

export function ProfileClient({ profile, readings, totalJuz, totalPages }: Props) {
    const [readingList, setReadingList] = useState(readings);
    const [editingReading, setEditingReading] = useState<Reading | null>(null);
    const [deletingReading, setDeletingReading] = useState<Reading | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Sort readings newest first for display
    const sortedReadings = [...readingList].sort((a, b) => b.date.localeCompare(a.date));

    const handleEdit = (reading: Reading) => {
        setEditingReading(reading);
        setError(null);
        setIsEditOpen(true);
    };

    const handleDelete = (reading: Reading) => {
        setDeletingReading(reading);
        setError(null);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingReading) return;

        startTransition(async () => {
            const result = await deleteReading(deletingReading.id);
            if (result.error) {
                setError(result.error);
            } else {
                setReadingList((prev) => prev.filter((r) => r.id !== deletingReading.id));
                setIsDeleteOpen(false);
                setDeletingReading(null);
            }
        });
    };

    const handleUpdate = (formData: FormData) => {
        if (!editingReading) return;

        startTransition(async () => {
            const result = await updateReading(editingReading.id, formData);
            if (result.error) {
                setError(result.error);
            } else {
                // Refresh the reading in the list
                const updatedReading: Reading = {
                    ...editingReading,
                    start_surah: parseInt(formData.get("start_surah") as string),
                    start_ayah: parseInt(formData.get("start_ayah") as string),
                    end_surah: parseInt(formData.get("end_surah") as string),
                    end_ayah: parseInt(formData.get("end_ayah") as string),
                    total_pages: result.totalPages || 0,
                    juz_obtained: result.juzObtained || 0,
                };
                setReadingList((prev) =>
                    prev.map((r) => (r.id === editingReading.id ? updatedReading : r))
                );
                setIsEditOpen(false);
                setEditingReading(null);
                setError(null);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent flex items-center gap-1.5">
                        <User className="w-5 h-5 text-emerald-600" />
                        Profil
                    </h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Profile Card */}
                <Card className="border-emerald-100 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 ring-2 ring-white/40">
                            {profile?.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <h2 className="text-xl font-bold">{profile?.full_name || "-"}</h2>
                        <p className="text-emerald-100 text-sm mt-1">{profile?.class_name || "-"}</p>
                    </div>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-emerald-50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-emerald-700">{totalJuz}</p>
                                <p className="text-xs text-emerald-600">Total Juz</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-amber-700">{totalPages}</p>
                                <p className="text-xs text-amber-600">Total Halaman</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reading History */}
                <Card className="border-emerald-100 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <ClipboardList className="w-4 h-4 text-emerald-600" />
                            </span>
                            Riwayat Bacaan
                            <Badge variant="secondary" className="ml-auto text-xs">
                                {readingList.length} entri
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        {sortedReadings.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground px-4">
                                Belum ada riwayat bacaan.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {sortedReadings.map((r) => (
                                    <div key={r.id} className="px-4 py-3 hover:bg-emerald-50/30 transition-colors group">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(r.date).toLocaleDateString("id-ID", {
                                                    weekday: "short",
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200">
                                                    {r.total_pages} hal · {r.juz_obtained} juz
                                                </Badge>
                                                {/* Edit/Delete buttons - visible on hover or mobile */}
                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                                                        onClick={() => handleEdit(r)}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100"
                                                        onClick={() => handleDelete(r)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {getSurahName(r.start_surah)}:{r.start_ayah}{" "}
                                            <span className="text-muted-foreground">→</span>{" "}
                                            {getSurahName(r.end_surah)}:{r.end_ayah}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Logout */}
                <form action={logout}>
                    <Button
                        variant="outline"
                        className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 font-semibold gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar dari Akun
                    </Button>
                </form>
            </main>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit Bacaan
                        </DialogTitle>
                    </DialogHeader>
                    {editingReading && (
                        <form action={handleUpdate} className="space-y-4">
                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_surah">Surah Awal</Label>
                                    <Select
                                        name="start_surah"
                                        defaultValue={editingReading.start_surah.toString()}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih surah" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {SURAHS.map((s) => (
                                                <SelectItem key={s.number} value={s.number.toString()}>
                                                    {s.number}. {s.englishName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start_ayah">Ayat Awal</Label>
                                    <Select
                                        name="start_ayah"
                                        defaultValue={editingReading.start_ayah.toString()}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih ayat" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {Array.from(
                                                {
                                                    length:
                                                        SURAHS.find(
                                                            (s) => s.number === editingReading.start_surah
                                                        )?.numberOfAyahs || 7,
                                                },
                                                (_, i) => i + 1
                                            ).map((n) => (
                                                <SelectItem key={n} value={n.toString()}>
                                                    Ayat {n}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="end_surah">Surah Akhir</Label>
                                    <Select
                                        name="end_surah"
                                        defaultValue={editingReading.end_surah.toString()}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih surah" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {SURAHS.map((s) => (
                                                <SelectItem key={s.number} value={s.number.toString()}>
                                                    {s.number}. {s.englishName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_ayah">Ayat Akhir</Label>
                                    <Select
                                        name="end_ayah"
                                        defaultValue={editingReading.end_ayah.toString()}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih ayat" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {Array.from(
                                                {
                                                    length:
                                                        SURAHS.find(
                                                            (s) => s.number === editingReading.end_surah
                                                        )?.numberOfAyahs || 7,
                                                },
                                                (_, i) => i + 1
                                            ).map((n) => (
                                                <SelectItem key={n} value={n.toString()}>
                                                    Ayat {n}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditOpen(false)}
                                    disabled={isPending}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    {isPending ? "Menyimpan..." : "Simpan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Hapus Bacaan?
                        </DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus bacaan ini? Tindakan ini tidak dapat
                            dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingReading && (
                        <div className="p-3 bg-muted rounded-md text-sm">
                            <p className="font-medium">
                                {getSurahName(deletingReading.start_surah)}:
                                {deletingReading.start_ayah} →{" "}
                                {getSurahName(deletingReading.end_surah)}:
                                {deletingReading.end_ayah}
                            </p>
                            <p className="text-muted-foreground mt-1">
                                {deletingReading.total_pages} halaman ·{" "}
                                {deletingReading.juz_obtained} juz
                            </p>
                        </div>
                    )}
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <StudentBottomNav />
        </div>
    );
}