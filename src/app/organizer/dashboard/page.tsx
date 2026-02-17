"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Plus,
    Calendar,
    Users,
    ImageIcon,
    Copy,
    Check,
    Trash2,
    ExternalLink,
    Loader2,
} from "lucide-react";

interface EventData {
    _id: string;
    name: string;
    code: string;
    description?: string;
    date?: string;
    status: "draft" | "active" | "archived";
    photoCount: number;
    attendeesAccessed: { _id: string; name: string; email: string }[];
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ name: "", description: "", date: "" });
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [error, setError] = useState("");

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            if (data.success) setEvents(data.events);
        } catch {
            setError("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreate = async () => {
        if (!newEvent.name.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEvent),
            });
            const data = await res.json();
            if (data.success) {
                setEvents((prev) => [data.event, ...prev]);
                setShowModal(false);
                setNewEvent({ name: "", description: "", date: "" });
            } else {
                setError(data.err);
            }
        } catch {
            setError("Failed to create event");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setEvents((prev) => prev.filter((e) => e._id !== id));
            }
        } catch {
            setError("Failed to delete event");
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const statusColors = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        archived: "bg-white/5 text-white/40 border-white/10",
    };

    return (
        <div className="min-h-screen pt-28 pb-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">
                            Welcome back,{" "}
                            <span className="gradient-text">
                                {session?.user?.name?.split(" ")[0] || "Organizer"}
                            </span>
                        </h1>
                        <p className="text-white/50 mt-1">
                            Manage your events and photos from here.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={18} />
                        New Event
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        {
                            icon: Calendar,
                            label: "Total Events",
                            value: events.length,
                            color: "text-violet-400",
                        },
                        {
                            icon: ImageIcon,
                            label: "Total Photos",
                            value: events.reduce((a, e) => a + e.photoCount, 0),
                            color: "text-indigo-400",
                        },
                        {
                            icon: Users,
                            label: "Total Attendees",
                            value: events.reduce((a, e) => a + e.attendeesAccessed.length, 0),
                            color: "text-emerald-400",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="p-6 rounded-2xl glass hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <stat.icon size={20} className={stat.color} />
                                <span className="text-sm text-white/50">{stat.label}</span>
                            </div>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Events List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="text-violet-400 animate-spin" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20">
                        <Calendar
                            size={48}
                            className="text-white/20 mx-auto mb-4"
                        />
                        <h3 className="text-xl font-medium text-white/60 mb-2">
                            No events yet
                        </h3>
                        <p className="text-white/40 mb-6">
                            Create your first event to get started.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium"
                        >
                            <Plus size={18} />
                            Create Event
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {events.map((event) => (
                            <div
                                key={event._id}
                                className="group p-6 rounded-2xl glass hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[event.status]
                                            }`}
                                    >
                                        {event.status}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <h3 className="text-lg font-semibold mb-1">{event.name}</h3>
                                {event.description && (
                                    <p className="text-sm text-white/40 mb-3 line-clamp-2">
                                        {event.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 font-mono text-sm text-violet-400 tracking-wider">
                                        {event.code}
                                    </div>
                                    <button
                                        onClick={() => copyCode(event.code)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                                    >
                                        {copiedCode === event.code ? (
                                            <Check size={16} className="text-emerald-400" />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-xs text-white/40">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <ImageIcon size={12} /> {event.photoCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={12} /> {event.attendeesAccessed.length}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/organizer/upload?event=${event._id}`}
                                        className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
                                    >
                                        Upload <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl glass-strong p-6 animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-6">Create New Event</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">
                                    Event Name *
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.name}
                                    onChange={(e) =>
                                        setNewEvent({ ...newEvent, name: e.target.value })
                                    }
                                    placeholder="e.g., Annual Company Meetup"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) =>
                                        setNewEvent({ ...newEvent, description: e.target.value })
                                    }
                                    placeholder="Brief description of your event..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">
                                    Event Date
                                </label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) =>
                                        setNewEvent({ ...newEvent, date: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !newEvent.name.trim()}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {creating && <Loader2 size={16} className="animate-spin" />}
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
