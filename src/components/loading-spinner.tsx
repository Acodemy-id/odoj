// src/components/loading-spinner.tsx
import { BookOpen } from "lucide-react";

export function LoadingSpinner() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                </div>
                <p className="text-sm font-semibold text-emerald-800 animate-pulse">
                    Memuat...
                </p>
            </div>
        </div>
    );
}
