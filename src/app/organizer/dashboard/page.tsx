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
    Upload,
    Loader2,
    HardDrive,
    Download,
    BarChart3,
    ArrowUpRight,
    X,
} from "lucide-react";

interface AttendeeAccess {
    _id: string;
    name: string;
    email: string;
    downloadedAt?: string;
}

interface EventData {
    _id: string;
    name: string;
    code: string;
    description?: string;
    date?: string;
    status: "draft" | "active" | "archived";
    photoCount: number;
    totalSizeMB: number;
    downloadCount: number;
    attendeesAccessed: AttendeeAccess[];
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState({ name: "", description: "", date: "" });
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [error, setError] = useState("");

    const fetchEvents = async () => {
        try {
            // TODO: Update API route when backend is finalized
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
        setError("");
        try {
            // TODO: Update API route when backend is finalized
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
        if (!confirm("Delete this event? This cannot be undone.")) return;
        try {
            // TODO: Update API route when backend is finalized
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

    // Aggregate stats
    const totalPhotos = events.reduce((sum, e) => sum + (e.photoCount || 0), 0);
    const totalAttendees = events.reduce((sum, e) => sum + (e.attendeesAccessed?.length || 0), 0);
    const totalDownloads = events.reduce((sum, e) => sum + (e.downloadCount || 0), 0);
    const totalSizeMB = events.reduce((sum, e) => sum + (e.totalSizeMB || 0), 0);

    const statusColors: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        archived: "bg-white/5 text-white/40 border-white/10",
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Welcome, <span className="gradient-text">{session?.user?.name?.split(" ")[0]}</span>
                        </h1>
                        <p className="text-white/40 mt-1">Manage your events and track attendee engagement</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary flex items-center gap-2 w-fit"
                    >
                        <Plus size={18} />
                        New Event
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
                    {[
                        { label: "Total Events", value: events.length, icon: Calendar, color: "violet" },
                        { label: "Photos Uploaded", value: totalPhotos, icon: ImageIcon, color: "blue" },
                        { label: "Attendees", value: totalAttendees, icon: Users, color: "emerald" },
                        { label: "Downloads", value: totalDownloads, icon: Download, color: "amber" },
                    ].map((stat) => (
                        <div key={stat.label} className="glass rounded-2xl p-5 card-hover">
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-3`}>
                                <stat.icon size={20} className={`text-${stat.color}-400`} />
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-white/40">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Storage info */}
                {totalSizeMB > 0 && (
                    <div className="glass rounded-xl p-4 mb-10 flex items-center gap-3">
                        <HardDrive size={18} className="text-violet-400" />
                        <span className="text-sm text-white/60">
                            Storage used: <span className="text-white font-medium">{totalSizeMB.toFixed(1)} MB</span> across {events.length} events
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm flex items-center justify-between">
                        {error}
                        <button onClick={() => setError("")}><X size={16} /></button>
                    </div>
                )}

                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="glass rounded-2xl p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                            <Calendar size={28} className="text-violet-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                        <p className="text-white/40 mb-6 max-w-sm mx-auto">
                            Create your first event to start uploading and sharing photos with attendees.
                        </p>
                        <button onClick={() => setShowModal(true)} className="btn-primary mx-auto flex items-center gap-2">
                            <Plus size={18} /> Create Event
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-5 stagger-children">
                        {events.map((event) => (
                            <div key={event._id} className="glass rounded-2xl overflow-hidden card-hover">
                                {/* Card Header */}
                                <div className="p-5 pb-3">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold truncate">{event.name}</h3>
                                            {event.description && (
                                                <p className="text-sm text-white/40 mt-0.5 line-clamp-1">{event.description}</p>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[event.status]} ml-3 shrink-0`}>
                                            {event.status}
                                        </span>
                                    </div>

                                    {/* Event Code */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="font-mono text-sm bg-white/5 px-3 py-1.5 rounded-lg tracking-wider">
                                            {event.code}
                                        </span>
                                        <button
                                            onClick={() => copyCode(event.code)}
                                            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                            title="Copy event code"
                                        >
                                            {copiedCode === event.code ? (
                                                <Check size={14} className="text-emerald-400" />
                                            ) : (
                                                <Copy size={14} className="text-white/40" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-semibold">{event.photoCount || 0}</p>
                                            <p className="text-[11px] text-white/30">Photos</p>
                                        </div>
                                        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-semibold">{event.attendeesAccessed?.length || 0}</p>
                                            <p className="text-[11px] text-white/30">Attendees</p>
                                        </div>
                                        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-semibold">{event.downloadCount || 0}</p>
                                            <p className="text-[11px] text-white/30">Downloads</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Attendee Accordion */}
                                {event.attendeesAccessed?.length > 0 && (
                                    <div className="border-t border-white/5">
                                        <button
                                            onClick={() => setExpandedEvent(expandedEvent === event._id ? null : event._id)}
                                            className="w-full px-5 py-3 text-left text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                                        >
                                            <span className="flex items-center gap-2">
                                                <BarChart3 size={14} />
                                                Attendee Activity
                                            </span>
                                            <ArrowUpRight
                                                size={14}
                                                className={`transition-transform duration-200 ${expandedEvent === event._id ? "rotate-90" : ""}`}
                                            />
                                        </button>
                                        {expandedEvent === event._id && (
                                            <div className="px-5 pb-4 space-y-2 animate-slide-up">
                                                {event.attendeesAccessed.map((attendee) => (
                                                    <div key={attendee._id} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-white/[0.02]">
                                                        <div>
                                                            <p className="font-medium text-white/80">{attendee.name}</p>
                                                            <p className="text-xs text-white/30">{attendee.email}</p>
                                                        </div>
                                                        {attendee.downloadedAt ? (
                                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                                <Download size={12} /> Downloaded
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-white/20">Viewed</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Card Footer */}
                                <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-white/30">
                                        <Calendar size={12} />
                                        {event.date
                                            ? new Date(event.date).toLocaleDateString()
                                            : new Date(event.createdAt).toLocaleDateString()}
                                        {event.totalSizeMB > 0 && (
                                            <span className="ml-2">· {event.totalSizeMB.toFixed(1)} MB</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/organizer/upload?event=${event._id}`}
                                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                            title="Upload photos"
                                        >
                                            <Upload size={15} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(event._id)}
                                            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
                                            title="Delete event"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md glass-strong rounded-2xl p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Create Event</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-white/50 mb-1.5 block">Event Name *</label>
                                <input
                                    type="text"
                                    value={newEvent.name}
                                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                    placeholder="e.g. Tech Conference 2026"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-white/50 mb-1.5 block">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Brief description of your event..."
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-white/50 mb-1.5 block">Date</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !newEvent.name.trim()}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
