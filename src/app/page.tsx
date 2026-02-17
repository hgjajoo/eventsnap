"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Camera,
    Sparkles,
    Zap,
    Users,
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
            "Advanced computer vision algorithms match your face across thousands of event photos instantly.",
    },
    {
        icon: Zap,
        title: "Instant Event Codes",
        description:
            "Generate unique 6-character event codes for organized and effortless photo management.",
    },
    {
        icon: Download,
        title: "Personalized Downloads",
        description:
            "Attendees upload a single selfie and receive all their event photos in a downloadable ZIP.",
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

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-float" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-float [animation-delay:3s]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[200px]" />
                </div>

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/70 mb-8 animate-fade-in">
                        <Sparkles size={14} className="text-violet-400" />
                        AI-Powered Photo Matching Platform
                    </div>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 animate-slide-up">
                        Find Your{" "}
                        <span className="gradient-text">Event Photos</span>{" "}
                        Instantly
                    </h1>

                    <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 animate-fade-in [animation-delay:0.3s]">
                        Upload event photos, share a code, and let attendees find their
                        personalized shots using AI face recognition — in seconds, not
                        hours.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:0.5s]">
                        <Link
                            href={session ? "/organizer/dashboard" : "/organizer/signup"}
                            className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all"
                        >
                            {session ? "Go to Dashboard" : "Get Started Free"}
                            <ArrowRight
                                size={18}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </Link>
                        <Link
                            href="/attendee/login"
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl glass text-white/80 font-medium text-lg hover:bg-white/10 transition-all"
                        >
                            <Camera size={18} />
                            I&apos;m an Attendee
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                            Why <span className="gradient-text">Eventsnap</span>?
                        </h2>
                        <p className="text-white/50 text-lg max-w-xl mx-auto">
                            Everything you need to make event photo sharing effortless.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={feature.title}
                                className="group p-8 rounded-2xl glass hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                    <feature.icon size={22} className="text-violet-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-white/50 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                            How It <span className="gradient-text">Works</span>
                        </h2>
                        <p className="text-white/50 text-lg">
                            Three simple steps to transform your event photo experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step) => (
                            <div key={step.number} className="text-center group">
                                <div className="text-6xl font-bold gradient-text opacity-40 group-hover:opacity-100 transition-opacity mb-4">
                                    {step.number}
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">
                                    {step.title}
                                </h3>
                                <p className="text-white/50">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="p-12 rounded-3xl gradient-bg border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px]" />
                        <div className="relative">
                            <Users size={40} className="text-violet-400 mx-auto mb-6" />
                            <h2 className="text-4xl font-bold mb-4">
                                Ready to Transform Your Events?
                            </h2>
                            <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
                                Join organizers who save hours on photo distribution with
                                AI-powered face recognition.
                            </p>
                            <Link
                                href={session ? "/organizer/dashboard" : "/organizer/signup"}
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all"
                            >
                                {session ? "Open Dashboard" : "Start for Free"}
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-2xl font-bold gradient-text">Eventsnap</div>
                    <div className="flex items-center gap-6 text-sm text-white/40">
                        <Link
                            href="/about"
                            className="hover:text-white/80 transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="hover:text-white/80 transition-colors"
                        >
                            Contact
                        </Link>
                    </div>
                    <p className="text-sm text-white/30">
                        © {new Date().getFullYear()} Eventsnap. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
