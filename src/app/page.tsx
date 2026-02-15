// src/app/page.tsx
// Landing page — redirects authenticated users to dashboard
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4">
      {/* Decorative pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="text-center space-y-6 max-w-md relative z-10">
        {/* Logo */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200">
          <span className="text-4xl">📖</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-600 bg-clip-text text-transparent">
            ODOJ Ramadan Tracker
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            <span className="font-semibold text-emerald-700">One Day One Juz</span><br />
            Catat dan pantau perjalanan tilawah Al-Quran Anda selama Ramadan 🌙
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200">
              Mulai Sekarang
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold">
              Sudah Punya Akun
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          🕌 Selamat menjalankan ibadah Ramadan
        </p>
      </div>
    </div>
  );
}
