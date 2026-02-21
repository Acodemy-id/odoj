// src/app/leaderboard/leaderboard-client.tsx
"use client";

import { useState } from "react";
import { Podium } from "./podium";
import type { LeaderboardEntry, AwardEntry } from "./actions";
import { StudentBottomNav, AdminBottomNav } from "@/components/bottom-nav";
import { Trophy, Sun, BarChart3, Award, Medal, Sparkles, Flame, Sunrise, Zap, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
    dailyData: LeaderboardEntry[];
    totalData: LeaderboardEntry[];
    awardsData: AwardEntry[];
    userRole: string;
    userId: string;
}

// Priority order for sorting awards
const AWARD_TYPE_PRIORITY: Record<string, number> = {
    finisher: 0,
    khatam: 1,
    streak: 2,
    odoj: 3,
    early_bird: 4,
    sprint: 5,
};

const AWARD_CRITERIA = [
    { type: 'finisher', name: 'The Finisher', desc: 'Selesaikan target khatam 30 Juz.' },
    { type: 'khatam', name: 'Khatam Award', desc: 'Diberikan setiap menyelesaikan 30 Juz.' },
    { type: 'streak', name: 'Istiqomah Streak', desc: 'Tilawah rutin berturut-turut (3, 7, 15, 30 hari).' },
    { type: 'odoj', name: 'ODOJ Award', desc: 'Selesaikan minimal 1.0 Juz dalam satu hari.' },
    { type: 'early_bird', name: 'Morning Star', desc: 'Setor laporan sebelum pukul 07.00 WIB.' },
    { type: 'sprint', name: 'Sprint Reader', desc: 'Kenaikan halaman >50% dari rata-rata 7 hari terakhir.' },
];

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
    // Only show rank 4+
    const rest = entries.filter((e) => e.rank > 3);

    if (rest.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-muted-foreground">
                Belum ada data untuk ditampilkan di luar podium.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10 text-center pl-3">#</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden sm:table-cell">Kelas</TableHead>
                        <TableHead className="text-right">Juz</TableHead>
                        <TableHead className="text-right pr-3">Halaman</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rest.map((entry) => (
                        <TableRow key={entry.userId} className="hover:bg-emerald-50/30 transition-colors">
                            <TableCell className="text-center font-semibold text-muted-foreground pl-3">
                                {entry.rank}
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span>{entry.fullName}</span>
                                        {entry.khatamCount > 0 && (
                                            <Badge variant="outline" className="h-5 px-1 bg-amber-50 border-amber-200 text-amber-700 gap-0.5 text-[9px] font-bold">
                                                <Trophy className="w-2.5 h-2.5" />
                                                {entry.khatamCount}x
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground sm:hidden">{entry.className}</span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge variant="secondary" className="text-xs">
                                    {entry.className}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-emerald-700">
                                {entry.totalJuz}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-amber-700 pr-3">
                                {entry.totalPages}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function AwardIcon({ type }: { type: string }) {
    switch (type) {
        case 'khatam': return <Trophy className="w-7 h-7 text-amber-500" />;
        case 'streak': return <Flame className="w-7 h-7 text-emerald-500" />;
        case 'early_bird': return <Sunrise className="w-7 h-7 text-blue-500" />;
        case 'odoj': return <Medal className="w-7 h-7 text-red-500" />;
        case 'sprint': return <Zap className="w-7 h-7 text-orange-500" />;
        case 'finisher': return <Star className="w-7 h-7 text-yellow-600" />;
        default: return <Medal className="w-7 h-7 text-gray-400" />;
    }
}

function AwardName({ type, value }: { type: string, value: number }) {
    switch (type) {
        case 'khatam': return `${value}x Khatam`;
        case 'streak': return `Istiqomah ${value} Hari`;
        case 'early_bird': return 'Morning Star';
        case 'odoj': return 'ODOJ Award';
        case 'sprint': return 'Sprint Reader';
        case 'finisher': return 'The Finisher';
        default: return 'Pencapaian Baru';
    }
}

function AwardCompactCard({ award }: { award: AwardEntry }) {
    return (
        <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow text-center min-h-[140px] justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <AwardIcon type={award.awardType} />
            </div>
            <div className="space-y-1 w-full flex-1 flex flex-col justify-center">
                <p className="text-[11px] font-bold text-emerald-900 leading-tight">
                    <AwardName type={award.awardType} value={award.awardValue} />
                </p>
                <p className="text-[10px] text-muted-foreground font-medium break-words px-1">
                    {award.fullName}
                </p>
            </div>
            <p className="text-[9px] text-muted-foreground/60 shrink-0">
                {new Date(award.achievedAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short'
                })}
            </p>
        </div>
    );
}

function AwardGrid({ awards }: { awards: AwardEntry[] }) {
    if (awards.length === 0) {
        return (
            <div className="py-8 text-center text-muted-foreground text-xs flex flex-col items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Belum ada award. Semangat tilawahnya!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-2.5">
            {awards.map((award, i) => (
                <AwardCompactCard key={`${award.userId}-${award.awardType}-${award.awardValue}-${i}`} award={award} />
            ))}
        </div>
    );
}

function AwardCatalog() {
    return (
        <div className="grid grid-cols-3 gap-2.5">
            {AWARD_CRITERIA.map((item) => (
                <div key={item.type} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-emerald-50/30 border border-emerald-100/50 text-center min-h-[140px] justify-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <AwardIcon type={item.type} />
                    </div>
                    <p className="text-[10px] font-bold text-emerald-900 leading-tight">{item.name}</p>
                    <p className="text-[9px] text-emerald-700/80 leading-snug">{item.desc}</p>
                </div>
            ))}
        </div>
    );
}

function AwardsShowroom({ awards, userId, userRole }: { awards: AwardEntry[]; userId: string; userRole: string }) {
    const isAdmin = userRole === 'admin';
    const myAwards = awards.filter(a => a.userId === userId);

    // Admins see all awards sorted by type priority, then by student name
    const allAwards = isAdmin ? [...awards].sort((a, b) => {
        const pa = AWARD_TYPE_PRIORITY[a.awardType] ?? 99;
        const pb = AWARD_TYPE_PRIORITY[b.awardType] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.fullName.localeCompare(b.fullName);
    }) : [];

    return (
        <div className="space-y-6">
            {/* Student View: My Awards & Catalog */}
            {!isAdmin && (
                <>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 px-1">
                            <Star className="w-3.5 h-3.5" />
                            My Awards
                        </h3>
                        <AwardGrid awards={myAwards} />
                    </div>

                    <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 px-1">
                            <Trophy className="w-3.5 h-3.5" />
                            Katalog Awards
                        </h3>
                        <AwardCatalog />
                    </div>
                </>
            )}

            {/* Admin View: All Awards grouped by Type then User */}
            {isAdmin && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <Award className="w-3.5 h-3.5" />
                        Semua Pencapaian Siswa
                    </h3>
                    <AwardGrid awards={allAwards} />
                </div>
            )}
        </div>
    );
}

export function LeaderboardClient({ dailyData, totalData, awardsData, userRole, userId }: Props) {
    const [tab, setTab] = useState("daily");
    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent flex items-center gap-1.5">
                        <Trophy className="w-5 h-5 text-emerald-600" />
                        Leaderboard
                    </h1>
                    <p className="text-xs text-muted-foreground">{today}</p>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-emerald-100/50 h-11 rounded-xl p-1">
                        <TabsTrigger
                            value="daily"
                            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold gap-1 text-xs sm:text-sm rounded-lg transition-all"
                        >
                            <Sun className="w-3.5 h-3.5" />
                            Hari Ini
                        </TabsTrigger>
                        <TabsTrigger
                            value="total"
                            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold gap-1 text-xs sm:text-sm rounded-lg transition-all"
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Total
                        </TabsTrigger>
                        <TabsTrigger
                            value="awards"
                            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold gap-1 text-xs sm:text-sm rounded-lg transition-all"
                        >
                            <Award className="w-3.5 h-3.5" />
                            Awards
                        </TabsTrigger>
                    </TabsList>

                    {/* Daily Leaderboard */}
                    <TabsContent value="daily" className="space-y-4 mt-4">
                        <Card className="border-emerald-100 shadow-lg overflow-hidden">
                            <CardHeader className="pb-0 bg-gradient-to-r from-emerald-50 to-amber-50">
                                <CardTitle className="text-base text-center text-emerald-800 flex items-center justify-center gap-1.5">
                                    <Medal className="w-4 h-4" />
                                    Top Pembaca Hari Ini
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 pb-2">
                                {dailyData.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-400" />
                                        Belum ada yang membaca hari ini. Jadilah yang pertama!
                                    </div>
                                ) : (
                                    <Podium top3={dailyData.slice(0, 3)} />
                                )}
                            </CardContent>
                        </Card>

                        {dailyData.length > 3 && (
                            <Card className="border-emerald-100 shadow-lg">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Peringkat Lainnya</CardTitle>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <LeaderboardTable entries={dailyData} />
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Total Leaderboard */}
                    <TabsContent value="total" className="space-y-4 mt-4">
                        <Card className="border-emerald-100 shadow-lg overflow-hidden">
                            <CardHeader className="pb-0 bg-gradient-to-r from-emerald-50 to-amber-50">
                                <CardTitle className="text-base text-center text-emerald-800 flex items-center justify-center gap-1.5">
                                    <Medal className="w-4 h-4" />
                                    Top Pembaca Ramadan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 pb-2">
                                {totalData.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground text-sm">
                                        Belum ada data bacaan.
                                    </div>
                                ) : (
                                    <Podium top3={totalData.slice(0, 3)} />
                                )}
                            </CardContent>
                        </Card>

                        {totalData.length > 3 && (
                            <Card className="border-emerald-100 shadow-lg">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Peringkat Lainnya</CardTitle>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <LeaderboardTable entries={totalData} />
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Wall of Fame */}
                    <TabsContent value="awards" className="space-y-4 mt-4">
                        <Card className="border-amber-100 shadow-lg overflow-hidden">
                            <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-yellow-50">
                                <CardTitle className="text-base text-center text-amber-800 flex items-center justify-center gap-1.5">
                                    <Award className="w-4 h-4" />
                                    Wall of Fame
                                </CardTitle>
                                <p className="text-xs text-center text-amber-600/70">Pencapaian terbaik peserta</p>
                            </CardHeader>
                            <CardContent className="pt-3">
                                <AwardsShowroom awards={awardsData} userId={userId} userRole={userRole} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            {userRole === "admin" ? <AdminBottomNav /> : <StudentBottomNav />}
        </div>
    );
}