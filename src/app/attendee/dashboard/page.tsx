"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Camera,
    Loader2,
    Calendar,
    ImageIcon,
    ChevronRight,
    Search,
    CheckCircle,
    RefreshCw,
    ScanFace,
    Trash2,
    LogOut,
    User,
} from "lucide-react";

interface AttendedEvent {
    id: string;
    name: string;
    code: string;
    date: string | null;
    status: string;
    photoCount: number;
    matchCount: number;
    accessedAt: string;
    downloaded: boolean;
}

export default function AttendeeDashboard() {
    const { data: session, status: sessionStatus, update: updateSession } = useSession();
    const router = useRouter();
    const hasEncoding = (session?.user as any)?.hasEncoding ?? false;
    const isOrganizer = (session?.user as any)?.role === "organizer";

    const [events, setEvents] = useState<AttendedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [clearingEncoding, setClearingEncoding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (sessionStatus === "authenticated" && isOrganizer) {
            router.replace("/organizer/dashboard");
            return;
        }
        if (sessionStatus === "authenticated") {
            fetchEvents();
        }
    }, [sessionStatus, isOrganizer]);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/attendee/events");
            const data = await res.json();
            if (data.success) {
                setEvents(data.events || []);
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    const handleClearEncoding = async () => {
        setClearingEncoding(true);
        try {
            const res = await fetch("/api/attendee/encode", { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                await updateSession();
                router.push("/attendee/sort");
            }
        } catch {
            // silently fail
        } finally {
            setClearingEncoding(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (confirmDeleteId !== eventId) {
            setConfirmDeleteId(eventId);
            return;
        }

        setDeletingId(eventId);
        try {
            const res = await fetch(`/api/attendee/events/${eventId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setEvents((prev) => prev.filter((e) => e.id !== eventId));
            }
        } catch {
            // silently fail
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    if (sessionStatus === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-white/30" />
            </div>
        );
    }

    if (sessionStatus === "unauthenticated") {
        router.replace("/signin");
        return null;
    }

    return (
        <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">My Photos</h1>
                    <p className="text-white/40 text-sm mt-1">
                        Your events and matched photos
                    </p>
                </div>
                <Link
                    href="/attendee/sort"
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Search size={16} /> Scan Event
                </Link>
            </div>

            {/* User & Encoding Card */}
            <div className="glass rounded-2xl p-5 mb-6 space-y-4">
                {/* User info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <User size={18} className="text-white/40" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                            <p className="text-xs text-white/30">{session?.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="btn-ghost text-xs flex items-center gap-1.5 text-white/30 hover:text-red-400"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>

                <div className="h-px bg-white/5" />

                {/* Face encoding status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasEncoding ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                            {hasEncoding ? (
                                <CheckCircle size={18} className="text-emerald-400" />
                            ) : (
                                <ScanFace size={18} className="text-amber-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {hasEncoding ? "Face Scan Active" : "No Face Scan"}
                            </p>
                            <p className="text-xs text-white/40">
                                {hasEncoding
                                    ? "Your face data is ready for photo matching."
                                    : "Set up a face scan to find your photos."}
                            </p>
                        </div>
                    </div>
                    {hasEncoding ? (
                        <button
                            onClick={handleClearEncoding}
                            disabled={clearingEncoding}
                            className="btn-ghost text-xs flex items-center gap-1.5"
                        >
                            {clearingEncoding ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <RefreshCw size={14} />
                            )}
                            Re-scan
                        </button>
                    ) : (
                        <Link href="/attendee/sort" className="btn-primary text-xs flex items-center gap-1.5">
                            <Camera size={14} /> Set Up
                        </Link>
                    )}
                </div>
            </div>

            {/* Events Section */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                    My Events
                </h2>
                <span className="text-xs text-white/30">{events.length} event{events.length !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-white/20" />
                </div>
            ) : events.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Camera size={28} className="text-white/20" />
                    </div>
                    <p className="text-lg font-semibold mb-2">No Events Yet</p>
                    <p className="text-sm text-white/40 mb-6">
                        Enter an event code to find your photos.
                    </p>
                    <Link href="/attendee/sort" className="btn-primary inline-flex items-center gap-2">
                        <Search size={16} /> Scan Your First Event
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="glass rounded-xl overflow-hidden group"
                        >
                            <div className="flex items-center">
                                {/* Main content — navigates */}
                                <Link
                                    href={`/attendee/events/${event.id}`}
                                    className="flex-1 flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-all cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                                        <ImageIcon size={20} className="text-sky-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm group-hover:text-white transition-colors truncate">
                                            {event.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-white/50 group-hover:text-white/70 transition-colors">
                                                {event.code}
                                            </span>
                                            {event.date && (
                                                <span className="flex items-center gap-1 text-xs text-white/30">
                                                    <Calendar size={11} />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </span>
                                            )}
                                            <span className="text-xs text-emerald-400/80">
                                                {event.matchCount} match{event.matchCount !== 1 ? "es" : ""}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
                                </Link>

                                {/* Delete button */}
                                <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    disabled={deletingId === event.id}
                                    className={`shrink-0 h-full px-4 py-4 border-l border-white/5 transition-all cursor-pointer ${confirmDeleteId === event.id
                                        ? "bg-red-500/10 text-red-400"
                                        : "text-white/15 hover:text-red-400 hover:bg-red-500/[0.06]"
                                        }`}
                                    title={confirmDeleteId === event.id ? "Click again to confirm" : "Remove event"}
                                >
                                    {deletingId === event.id ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={15} />
                                    )}
                                </button>
                            </div>

                            {/* Confirm banner */}
                            {confirmDeleteId === event.id && deletingId !== event.id && (
                                <div className="flex items-center justify-between px-4 py-2 bg-red-500/[0.06] border-t border-red-500/10 text-xs">
                                    <span className="text-red-400/80">Remove this event and its cached photos?</span>
                                    <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="text-white/30 hover:text-white text-xs cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
