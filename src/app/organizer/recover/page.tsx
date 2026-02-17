"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function RecoverPage() {
    const router = useRouter();
    const [form, setForm] = useState({ token: "", newPassword: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/recover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => router.push("/organizer/login"), 2000);
            } else {
                setError(data.err || "Invalid or expired token");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {success ? (
                    <div className="text-center animate-slide-up">
                        <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold mb-2">Password Reset!</h1>
                        <p className="text-white/50">Redirecting to login...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                            <p className="text-white/50">Enter your recovery token and new password</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Recovery Token"
                                value={form.token}
                                onChange={(e) => setForm({ ...form, token: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
                            />

                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    required
                                    minLength={8}
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

                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                                Reset Password
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
