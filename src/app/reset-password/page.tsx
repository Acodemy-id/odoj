"use client";

import { useState, useEffect } from "react";
import { requestPasswordReset, updatePassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft, MailCheck, KeyRound } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const [mode, setMode] = useState<"request" | "update">("request");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState("");

    const supabase = createClient();

    useEffect(() => {
        setOrigin(window.location.origin);

        // Check if we have a session (meaning user clicked reset link)
        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setMode("update");
            }
        }
        checkSession();
    }, [supabase.auth]);

    async function handleRequestReset(formData: FormData) {
        setLoading(true);
        setError(null);
        formData.append("origin", origin);

        const result = await requestPasswordReset(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else if (result?.success) {
            setSuccess(true);
            setLoading(false);
        }
    }

    async function handleUpdatePassword(formData: FormData) {
        setLoading(true);
        setError(null);

        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Password tidak cocok.");
            setLoading(false);
            return;
        }

        const result = await updatePassword(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    if (mode === "update") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4">
                <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                <Card className="w-full max-w-md shadow-xl border-emerald-100">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                            Atur Ulang Password
                        </CardTitle>
                        <CardDescription className="text-base">
                            Masukkan password baru Anda di bawah ini
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleUpdatePassword} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">Password Baru</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-md"
                            >
                                {loading ? "Memproses..." : "Simpan Password Baru"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4">
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <Card className="w-full max-w-md shadow-xl border-emerald-100">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-base">
                        {success
                            ? "Instruksi reset password telah dikirim"
                            : "Masukkan email Anda untuk menerima link reset password"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-6">
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-6 rounded-xl flex flex-col items-center text-center space-y-3">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                    <MailCheck className="w-6 h-6" />
                                </div>
                                <p className="font-medium">Cek email Anda sekarang!</p>
                                <p className="text-sm opacity-90">
                                    Kami telah mengirimkan link untuk mengatur ulang password ke alamat email Anda.
                                </p>
                            </div>
                            <Button asChild className="w-full h-11 bg-emerald-600 hover:bg-emerald-700">
                                <Link href="/login">Kembali ke Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form action={handleRequestReset} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-md"
                            >
                                {loading ? "Memproses..." : "Kirim Link Reset"}
                            </Button>

                            <div className="pt-2">
                                <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-emerald-700">
                                    <Link href="/login" className="flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Kembali ke Login
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
