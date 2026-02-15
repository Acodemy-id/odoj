// src/app/landing-client.tsx
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, LogIn, UserPlus, Sparkles } from "lucide-react";

// Dynamic import to avoid SSR issues with Three.js
const Antigravity = dynamic(() => import("@/components/antigravity"), {
    ssr: false,
});

export function LandingClient() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950">
            {/* Antigravity background */}
            <div className="absolute inset-0 z-0">
                <Antigravity
                    count={300}
                    magnetRadius={5}
                    ringRadius={5}
                    waveSpeed={0.4}
                    waveAmplitude={1}
                    particleSize={1.5}
                    lerpSpeed={0.05}
                    autoAnimate
                    particleVariance={1}
                    rotationSpeed={0}
                    depthFactor={1}
                    pulseSpeed={3}
                    fieldStrength={20}
                    color="#86efac"
                    particleShape="sphere"
                />
            </div>

            {/* Content overlay — pointer-events-none so cursor reaches the canvas for magnet effect */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pointer-events-none">
                <div className="text-center space-y-8 max-w-lg">
                    {/* Logo */}
                    <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-900/50 ring-1 ring-white/20">
                        <BookOpen className="w-10 h-10 text-emerald-300" />
                    </div>

                    {/* Title */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-300/80">
                                Ramadan 1447H
                            </span>
                            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
                            ODOJ
                            <span className="block text-2xl sm:text-3xl mt-1 font-medium bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">
                                Ramadan Tracker
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-emerald-100/70 leading-relaxed max-w-sm mx-auto">
                            <span className="font-semibold text-emerald-200">One Day One Juz</span>
                            <br />
                            Catat dan pantau perjalanan tilawah Al-Quran Anda selama Ramadan
                        </p>
                    </div>

                    {/* CTA buttons — re-enable pointer events for interactive elements */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 pointer-events-auto">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto h-12 px-8 bg-white text-emerald-900 hover:bg-emerald-50 font-semibold shadow-lg shadow-black/20 gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Mulai Sekarang
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto h-12 px-8 border-emerald-400/30 text-emerald-900 hover:bg-emerald-800/50 hover:text-white font-semibold backdrop-blur-sm gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                Sudah Punya Akun
                            </Button>
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-emerald-100/50 pt-4">
                        Selamat menjalankan ibadah Ramadan
                    </p>
                </div>
            </div>
        </div>
    );
}
