"use client";

import React from "react";
import Link from "next/link";
import { Camera, Users } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                        How Would You Like to <span className="gradient-text">Continue</span>?
                    </h1>
                    <p className="text-white/50">
                        Choose your role to proceed
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        href="/organizer/login"
                        className="group p-8 rounded-2xl glass hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Users size={28} className="text-violet-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Organizer</h3>
                        <p className="text-sm text-white/40">
                            Upload event photos and manage your events
                        </p>
                    </Link>

                    <Link
                        href="/attendee/login"
                        className="group p-8 rounded-2xl glass hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Camera size={28} className="text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Attendee</h3>
                        <p className="text-sm text-white/40">
                            Find and download your event photos
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
