"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Zap,
    ArrowRight,
    ScanFace,
    Download,
    Shield,
} from "lucide-react";

const features = [
    {
        icon: ScanFace,
        title: "AI Face Recognition",
        description:
            "Advanced computer vision matches your face across thousands of event photos instantly.",
    },
    {
        icon: Zap,
        title: "Instant Event Codes",
        description:
            "Generate unique 6-character event codes for organized photo management.",
    },
    {
        icon: Download,
        title: "Personalized Downloads",
        description:
            "Attendees upload a selfie and receive all their event photos in a downloadable ZIP.",
    },
    {
        icon: Shield,
        title: "Secure & Private",
        description:
            "OAuth authentication, rate-limited APIs, and role-based access keep your data safe.",
    },
];

const steps = [
    {
        number: "01",
        title: "Create Event",
        description: "Sign up, create an event, and get your unique event code.",
    },
    {
        number: "02",
        title: "Upload Photos",
        description:
            "Upload your event photos as a ZIP file. Our AI indexes every face.",
    },
    {
        number: "03",
        title: "Share the Code",
        description:
            "Share the event code with attendees. They upload a selfie to get their photos.",
    },
];

export default function LandingPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade-out after a short delay
        const fadeTimer = setTimeout(() => setFadeOut(true), 1200);
        // Remove preloader after fade animation completes
        const removeTimer = setTimeout(() => setLoading(false), 1800);
        return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
    }, []);

    return (
        <>
            {/* ── Preloader ── */}
            {loading && (
                <div
                    className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[hsl(240,10%,4%)]`}
                    style={{
                        transition: "opacity 600ms ease-out, transform 600ms ease-out",
                        opacity: fadeOut ? 0 : 1,
                        transform: fadeOut ? "scale(1.05)" : "scale(1)",
                        pointerEvents: fadeOut ? "none" : "auto",
                    }}
                >
                    <div className="flex flex-col items-center gap-5">
                        <span className="text-xl font-semibold tracking-tight text-white/90">
                            Eventsnap
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "0ms" }} />
                            <span className="w-1 h-1 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: "150ms" }} />
                            <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen">
                {/* Hero */}
                <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                    {/* BG wash */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/[0.12] rounded-full blur-[160px]" />
                        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-sky-600/[0.1] rounded-full blur-[140px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-700/[0.08] rounded-full blur-[140px]" />
                    </div>

                    {/* Grid */}
                    <div
                        className="absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                        }}
                    />

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[13px] text-white/50 mb-8 animate-fade-in">
                            AI-Powered Photo Matching
                        </div>

                        <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] mb-5 animate-slide-up">
                            Find Your{" "}
                            <span className="gradient-text">Event Photos</span>{" "}
                            Instantly
                        </h1>

                        <p className="text-[17px] sm:text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in [animation-delay:0.15s]">
                            Upload event photos, share a code, and let attendees find their
                            personalized shots using AI face recognition.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in [animation-delay:0.25s]">
                            <Link
                                href={session ? ((session.user as any)?.role === "organizer" ? "/organizer/dashboard" : "/attendee/dashboard") : "/signin"}
                                className="group flex items-center gap-2.5 btn-primary !text-[15px] !px-7 !py-3.5 !rounded-xl"
                            >
                                {session ? "Go to Dashboard" : "Get Started Free"}
                                <ArrowRight
                                    size={16}
                                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                                />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-20 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                                Why Eventsnap?
                            </h2>
                            <p className="text-white/40 text-[15px] max-w-md mx-auto">
                                Everything you need to make event photo sharing effortless.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group p-8 rounded-2xl glass hover:bg-white/[0.04] transition-all duration-300 cursor-default"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-6 group-hover:bg-white/[0.08] transition-colors">
                                        <feature.icon size={20} className="text-white/50" />
                                    </div>
                                    <h3 className="text-[17px] font-semibold mb-2 text-white/90">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[14px] text-white/40 leading-relaxed max-w-[320px]">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                                How It Works
                            </h2>
                            <p className="text-white/40 text-[15px] max-w-sm mx-auto leading-relaxed">
                                Three simple steps to transform your event photo experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {steps.map((step) => (
                                <div
                                    key={step.number}
                                    className="relative p-8 rounded-2xl glass hover:bg-white/[0.04] transition-all duration-300 group cursor-default"
                                >
                                    <div className="text-5xl font-bold text-white/[0.08] group-hover:text-white/[0.15] transition-colors duration-500 mb-6 font-mono tracking-tighter">
                                        {step.number}
                                    </div>
                                    <h3 className="text-[17px] font-semibold mb-2.5 text-white/90">
                                        {step.title}
                                    </h3>
                                    <p className="text-[14px] text-white/40 leading-relaxed max-w-[240px] md:max-w-none">
                                        {step.description}
                                    </p>

                                    {/* Subtle connector for desktop */}
                                    {step.number !== "03" && (
                                        <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                                            <ArrowRight size={16} className="text-white/[0.05]" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="p-10 rounded-2xl glass relative overflow-hidden">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                                Ready to Transform Your Events?
                            </h2>
                            <p className="text-white/40 text-[15px] mb-8 max-w-md mx-auto">
                                Join organizers who save hours on photo distribution with
                                AI-powered face recognition.
                            </p>
                            <Link
                                href={session ? ((session.user as any)?.role === "organizer" ? "/organizer/dashboard" : "/attendee/dashboard") : "/signin"}
                                className="inline-flex items-center gap-2 btn-primary !text-[15px] !px-7 !py-3.5 !rounded-xl"
                            >
                                {session ? "Open Dashboard" : "Start for Free"}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/[0.06] py-8 px-6">
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-[14px] font-semibold text-white/80">Eventsnap</span>
                        <div className="flex items-center gap-6 text-[13px] text-white/35">
                            <Link
                                href="/about"
                                className="hover:text-white/70 transition-colors cursor-pointer"
                            >
                                About
                            </Link>
                            <Link
                                href="/contact"
                                className="hover:text-white/70 transition-colors cursor-pointer"
                            >
                                Contact
                            </Link>
                        </div>
                        <p className="text-[12px] text-white/25">
                            © {new Date().getFullYear()} Eventsnap
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
