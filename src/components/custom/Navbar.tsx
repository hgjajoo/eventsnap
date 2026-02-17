"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    Menu,
    X,
    LogOut,
    LayoutDashboard,
    User,
    ChevronDown,
} from "lucide-react";

const Navbar = () => {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close mobile menu on navigation
    useEffect(() => {
        setMobileOpen(false);
        setDropdownOpen(false);
    }, [pathname]);

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <nav
            className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 rounded-2xl transition-all duration-300 ${scrolled
                    ? "glass-strong shadow-lg shadow-black/10"
                    : "glass"
                }`}
        >
            <div className="flex items-center justify-between h-16 px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-2xl font-bold tracking-tight gradient-text hover:opacity-80 transition-opacity"
                >
                    Eventsnap
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.href)
                                    ? "bg-white/10 text-white"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {status === "loading" ? (
                        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse ml-4" />
                    ) : session?.user ? (
                        <div className="relative ml-4">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                            >
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt=""
                                        className="w-8 h-8 rounded-full ring-2 ring-violet-500/50"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                )}
                                <span className="text-sm text-white/80 max-w-[120px] truncate">
                                    {session.user.name}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={`text-white/40 transition-transform ${dropdownOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {dropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 top-12 w-56 rounded-xl glass-strong shadow-xl z-50 p-2 animate-slide-up">
                                        <Link
                                            href="/organizer/dashboard"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <LayoutDashboard size={16} />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/organizer/upload"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <User size={16} />
                                            Upload Photos
                                        </Link>
                                        <hr className="my-1 border-white/10" />
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 ml-4">
                            <Link
                                href="/organizer/login"
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/organizer/signup"
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden px-4 pb-4 animate-slide-up">
                    <div className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(link.href)
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <hr className="my-2 border-white/10" />

                        {session?.user ? (
                            <>
                                <Link
                                    href="/organizer/dashboard"
                                    className="px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/organizer/login"
                                    className="px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/organizer/signup"
                                    className="px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
