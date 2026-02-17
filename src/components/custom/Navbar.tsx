"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    Menu,
    X,
    LayoutDashboard,
    Upload,
    LogOut,
    ChevronDown,
    Sparkles,
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
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleScroll = useCallback(() => {
        const currentY = window.scrollY;
        setScrolled(currentY > 20);

        // Hide on scroll down, show on scroll up
        if (currentY > lastScrollY && currentY > 100) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setLastScrollY(currentY);
    }, [lastScrollY]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
        setDropdownOpen(false);
    }, [pathname]);

    const initials = session?.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${hidden ? "-translate-y-full" : "translate-y-0"
                }`}
        >
            <div
                className={`mx-4 sm:mx-8 transition-all duration-500 ease-out ${scrolled
                        ? "mt-0 rounded-none sm:mt-3 sm:rounded-2xl bg-black/60 backdrop-blur-2xl border-b sm:border border-white/[0.06] shadow-2xl shadow-black/40"
                        : "mt-4 rounded-2xl bg-transparent border border-transparent"
                    }`}
            >
                <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105">
                            <Sparkles size={16} className="text-white" />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Sparkles size={16} className="text-white relative z-10" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Event<span className="gradient-text">snap</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link px-4 py-2 rounded-lg hover:bg-white/5 ${pathname === link.href ? "active" : ""
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200"
                                >
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt=""
                                            className="w-8 h-8 rounded-full ring-2 ring-violet-500/30"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                            {initials}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium max-w-[100px] truncate">
                                        {session.user?.name?.split(" ")[0]}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={`text-white/40 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-neutral-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 z-50 overflow-hidden animate-slide-up">
                                            <div className="p-3 border-b border-white/5">
                                                <p className="text-sm font-medium truncate">
                                                    {session.user?.name}
                                                </p>
                                                <p className="text-xs text-white/40 truncate">
                                                    {session.user?.email}
                                                </p>
                                            </div>
                                            <div className="p-1.5">
                                                <Link
                                                    href="/organizer/dashboard"
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                                >
                                                    <LayoutDashboard size={15} />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/organizer/upload"
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                                >
                                                    <Upload size={15} />
                                                    Upload Photos
                                                </Link>
                                                <button
                                                    onClick={() => signOut({ callbackUrl: "/" })}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
                                                >
                                                    <LogOut size={15} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/organizer/login"
                                    className="btn-ghost text-sm"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/organizer/signup"
                                    className="btn-primary text-sm !px-5 !py-2"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden fixed inset-0 top-0 z-40 bg-black/95 backdrop-blur-2xl transition-all duration-300 ${mobileOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }`}
            >
                <div className="flex flex-col h-full pt-20 px-6 pb-8">
                    <div className="space-y-1 stagger-children">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block px-4 py-3 rounded-xl text-lg transition-colors ${pathname === link.href
                                        ? "text-white bg-white/5"
                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {session && (
                            <>
                                <Link
                                    href="/organizer/dashboard"
                                    className="block px-4 py-3 rounded-xl text-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/organizer/upload"
                                    className="block px-4 py-3 rounded-xl text-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Upload Photos
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        {session ? (
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/5 transition-colors text-left"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    href="/organizer/login"
                                    className="block w-full text-center btn-ghost"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/organizer/signup"
                                    className="block w-full text-center btn-primary"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
