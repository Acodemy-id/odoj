// src/app/leaderboard/podium.tsx
"use client";

import type { LeaderboardEntry } from "./actions";

interface PodiumProps {
    top3: LeaderboardEntry[];
}

function getMedalEmoji(rank: number) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    return "🥉";
}

function PodiumSlot({
    entry,
    height,
}: {
    entry: LeaderboardEntry | undefined;
    height: string;
}) {
    if (!entry) {
        return (
            <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="w-full flex flex-col items-center justify-end">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-300 mb-2">
                        ?
                    </div>
                    <div
                        className="w-full rounded-t-xl bg-gray-100"
                        style={{ height }}
                    />
                </div>
            </div>
        );
    }

    const isFirst = entry.rank === 1;
    const bgGradient = isFirst
        ? "from-amber-400 via-yellow-400 to-amber-500"
        : entry.rank === 2
            ? "from-gray-300 via-gray-200 to-gray-300"
            : "from-amber-700 via-amber-600 to-amber-700";

    return (
        <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-full flex flex-col items-center justify-end">
                {/* Medal */}
                <div className="text-2xl sm:text-3xl mb-1">{getMedalEmoji(entry.rank)}</div>

                {/* Avatar circle */}
                <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg mb-2 ${isFirst ? "bg-gradient-to-br from-amber-500 to-yellow-600 ring-2 ring-yellow-300" : "bg-gradient-to-br from-emerald-500 to-emerald-700"
                        }`}
                >
                    {entry.fullName.charAt(0).toUpperCase()}
                </div>

                {/* Name & class */}
                <div className="flex flex-col items-center w-full px-1">
                    <p className="text-xs sm:text-sm font-bold text-center text-wrap leading-tight">{entry.fullName}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{entry.className}</p>
                    {entry.khatamCount > 0 && (
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-black shadow-sm mb-2">
                            🏆 {entry.khatamCount}x
                        </div>
                    )}
                </div>

                {/* Podium block */}
                <div
                    className={`w-full rounded-t-xl bg-gradient-to-b ${bgGradient} flex flex-col items-center justify-center shadow-inner relative overflow-hidden px-1 py-2`}
                    style={{ height }}
                >
                    {/* Shimmer effect for 1st place */}
                    {isFirst && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    )}

                    {/* Juz count */}
                    <div className="flex flex-col items-center relative z-10">
                        <span className={`text-lg sm:text-xl font-black drop-shadow-md ${entry.rank === 2 || entry.rank === 1 ? "text-gray-800" : "text-white"}`}>
                            {entry.totalJuz}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-medium ${entry.rank === 2 || entry.rank === 1 ? "text-gray-600" : "text-white/80"}`}>
                            juz
                        </span>
                    </div>

                    {/* Divider */}
                    <div className={`w-8 h-px my-1 ${entry.rank === 2 ? "bg-gray-400/50" : "bg-white/30"}`} />

                    {/* Pages count */}
                    <div className="flex flex-col items-center relative z-10">
                        <span className={`text-base sm:text-lg font-bold drop-shadow-md ${entry.rank === 2 || entry.rank === 1 ? "text-gray-700" : "text-white/90"}`}>
                            {entry.totalPages}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-medium ${entry.rank === 2 || entry.rank === 1 ? "text-gray-500" : "text-white/70"}`}>
                            hal
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Podium({ top3 }: PodiumProps) {
    // Podium order: 2nd, 1st, 3rd (classic podium layout)
    const first = top3.find((e) => e.rank === 1);
    const second = top3.find((e) => e.rank === 2);
    const third = top3.find((e) => e.rank === 3);

    return (
        <div className="flex items-end justify-center gap-2 sm:gap-4 px-2 py-4">
            {/* 2nd place */}
            <PodiumSlot entry={second} height="120px" />
            {/* 1st place */}
            <PodiumSlot entry={first} height="160px" />
            {/* 3rd place */}
            <PodiumSlot entry={third} height="90px" />
        </div>
    );
}