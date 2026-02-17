"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoveryMsg, setRecoveryMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/organizer/dashboard");
        }
    };

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailForRecovery: recoveryEmail }),
            });
            const data = await res.json();

            if (data.success) {
                setRecoveryMsg("Recovery email sent! Check your inbox.");
            } else {
                setError(data.err || "Failed to send recovery email");
            }
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {showRecovery ? "Password Recovery" : "Welcome Back"}
                    </h1>
                    <p className="text-white/50">
                        {showRecovery
                            ? "Enter your email to receive a recovery link"
                            : "Sign in to your Eventsnap account"}
                    </p>
                </div>

                {!showRecovery && (
                    <>
                        {/* OAuth Buttons */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() =>
                                    signIn("google", { callbackUrl: "/organizer/dashboard" })
                                }
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl glass hover:bg-white/10 transition-all text-sm font-medium"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>
                            <button
                                onClick={() =>
                                    signIn("github", { callbackUrl: "/organizer/dashboard" })
                                }
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl glass hover:bg-white/10 transition-all text-sm font-medium"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-sm text-white/30">or</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>
                    </>
                )}

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}
                {recoveryMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                        {recoveryMsg}
                    </div>
                )}

                {showRecovery ? (
                    <form onSubmit={handleRecovery} className="space-y-4">
                        <div className="relative">
                            <Mail
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Send Recovery Email
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowRecovery(false);
                                setError("");
                                setRecoveryMsg("");
                            }}
                            className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => setShowRecovery(true)}
                                className="text-sm text-violet-400 hover:text-violet-300"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Sign In
                        </button>
                    </form>
                )}

                <p className="text-center text-sm text-white/40 mt-6">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/organizer/signup"
                        className="text-violet-400 hover:text-violet-300 font-medium"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
