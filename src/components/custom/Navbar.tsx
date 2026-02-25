"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    Menu,
    X,
    LayoutDashboard,
    Upload,
    LogOut,
} from "lucide-react";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const initials = session?.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl">
            <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
                {/* Left: Logo */}
                <Link
                    href="/"
                    className="text-[15px] font-semibold tracking-tight hover:opacity-80 transition-opacity cursor-pointer select-none"
                >
                    Eventsnap
                </Link>

                {/* Center: Nav Links (desktop) */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${pathname === link.href
                                ? "text-white bg-white/[0.06]"
                                : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right: Auth / Actions */}
                <div className="hidden md:flex items-center gap-2">
                    {session ? (
                        <div className="flex items-center gap-1">
                            <Link
                                href="/organizer/dashboard"
                                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                                title="Dashboard"
                            >
                                <LayoutDashboard size={16} />
                            </Link>

                            {/* Profile */}
                            {session.user?.image ? (
                                <Link href="/organizer/dashboard" className="ml-1 cursor-pointer">
                                    <Image
                                        src={session.user.image}
                                        alt=""
                                        width={28}
                                        height={28}
                                        className="w-7 h-7 rounded-full ring-1 ring-white/10 hover:ring-white/25 transition-all"
                                    />
                                </Link>
                            ) : (
                                <Link
                                    href="/organizer/dashboard"
                                    className="ml-1 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:bg-white/15 transition-colors"
                                >
                                    {initials}
                                </Link>
                            )}

                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-all cursor-pointer"
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/organizer/login"
                                className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/organizer/signup"
                                className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-2xl animate-slide-up">
                    <div className="px-5 py-4 space-y-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors cursor-pointer ${pathname === link.href
                                    ? "text-white bg-white/[0.06]"
                                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {session && (
                            <>
                                <Link
                                    href="/organizer/dashboard"
                                    className="block px-3 py-2.5 rounded-lg text-[14px] font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                                >
                                    Dashboard
                                </Link>
                            </>
                        )}

                        <div className="pt-3 mt-2 border-t border-white/[0.06]">
                            {session ? (
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="w-full px-3 py-2.5 rounded-lg text-[14px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors text-left cursor-pointer"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <Link
                                        href="/organizer/login"
                                        className="block w-full text-center px-3 py-2.5 rounded-lg text-[14px] font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/organizer/signup"
                                        className="block w-full text-center px-4 py-2.5 rounded-lg text-[14px] font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
