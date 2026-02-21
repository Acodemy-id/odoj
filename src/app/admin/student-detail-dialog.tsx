// src/app/admin/student-detail-dialog.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { getStudentReadings } from "./actions";
import { updateStudentReading, deleteStudentReading } from "./admin-actions";
import { SURAHS } from "@/lib/quran-metadata";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, X, Check, Loader2, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { ReadingChart } from "../dashboard/reading-chart";
import { RamadhanCalendar } from "../dashboard/ramadhan-calendar";
import { toast } from "sonner";

interface Student {
    id: string;
    fullName: string;
    className: string;
    totalPages: number;
    totalJuz: number;
}

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
    student: Student | null;
    open: boolean;
    onClose: () => void;
}

function getSurahName(num: number) {
    return SURAHS.find((s) => s.number === num)?.englishName || `Surah ${num}`;
}

export function StudentDetailDialog({ student, open, onClose }: Props) {
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingReading, setEditingReading] = useState<Reading | null>(null);
    const [deletingReading, setDeletingReading] = useState<Reading | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (student && open) {
            setLoading(true);
            getStudentReadings(student.id).then((data) => {
                setReadings(data);
                setLoading(false);
            });
        }
    }, [student, open]);

    const sortedReadings = [...readings].sort((a, b) => b.date.localeCompare(a.date));

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
        if (!deletingReading || !student) return;

        startTransition(async () => {
            const result = await deleteStudentReading(deletingReading.id);
            if (result.error) {
                setError(result.error);
            } else {
                setReadings((prev) => prev.filter((r) => r.id !== deletingReading.id));
                setIsDeleteOpen(false);
                setDeletingReading(null);
                toast.success("Bacaan berhasil dihapus");
            }
        });
    };

    const handleUpdate = (formData: FormData) => {
        if (!editingReading || !student) return;

        startTransition(async () => {
            const result = await updateStudentReading(editingReading.id, formData);
            if (result.error) {
                setError(result.error);
            } else {
                const updatedReading: Reading = {
                    ...editingReading,
                    start_surah: parseInt(formData.get("start_surah") as string),
                    start_ayah: parseInt(formData.get("start_ayah") as string),
                    end_surah: parseInt(formData.get("end_surah") as string),
                    end_ayah: parseInt(formData.get("end_ayah") as string),
                    total_pages: result.totalPages || 0,
                    juz_obtained: result.juzObtained || 0,
                };
                setReadings((prev) =>
                    prev.map((r) => (r.id === editingReading.id ? updatedReading : r))
                );
                setIsEditOpen(false);
                setEditingReading(null);
                setError(null);
                toast.success("Bacaan berhasil diupdate");
            }
        });
    };

    return (
        <>
            <Dialog open={open && !isEditOpen && !isDeleteOpen} onOpenChange={onClose}>
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

                    {/* Progress Chart & Calendar */}
                    {loading ? (
                        <div className="h-48 flex items-center justify-center text-muted-foreground animate-pulse bg-gray-50/50 rounded-xl">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-2" />
                            Memuat data...
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {readings.length > 0 ? (
                                <>
                                    <ReadingChart readings={readings} />
                                    <RamadhanCalendar readings={readings} />
                                </>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-gray-100 rounded-xl">
                                    Belum ada data bacaan.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Detailed Readings List */}
                    <div className="mt-6 border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            Detail Bacaan
                            <Badge variant="secondary" className="text-xs">{readings.length} entri</Badge>
                        </h4>

                        {sortedReadings.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Belum ada riwayat bacaan.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {sortedReadings.map((r) => (
                                    <div
                                        key={r.id}
                                        className="p-3 bg-gray-50 rounded-lg hover:bg-emerald-50/50 transition-colors group"
                                    >
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
                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                                                        onClick={() => handleEdit(r)}
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100"
                                                        onClick={() => handleDelete(r)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
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
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit Bacaan Siswa
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
                                        disabled={isPending}
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
                                        disabled={isPending}
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
                                        disabled={isPending}
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
                                        disabled={isPending}
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
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Simpan
                                        </>
                                    )}
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
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}