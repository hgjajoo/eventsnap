"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Users,
    ImageIcon,
    HardDrive,
    Upload,
    Loader2,
    CheckCircle,
    X,
    Cpu,
    FolderUp
} from "lucide-react";
import Link from "next/link";
import { useUpload } from "@/components/providers/UploadProvider";

interface EventData {
    id: string;
    name: string;
    code: string;
    photo_count: number;
    total_size_mb: number;
    attendeesAccessed: any[];
}

export default function EventDetailsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [files, setFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [encodedCount, setEncodedCount] = useState<number | null>(null);

    // Global Direct S3 Upload State
    const { isUploading, phase, progress, encodeProgress, statusMessage, startUpload, startEncodingPoll, uploadingEventId, imageCount, cancelUpload } = useUpload();

    const fetchEvent = useCallback(async () => {
        try {
            const res = await fetch(`/api/events/${eventId}`);
            const data = await res.json();
            if (data.success) {
                setEvent(data.event);

                // Also fetch encoding count in the same load cycle
                try {
                    const countRes = await fetch(`/api/encode/count?eventId=${data.event.id}`);
                    const countData = await countRes.json();
                    if (countData.success) setEncodedCount(countData.encoded_count);
                } catch { /* encoding count is optional */ }
            } else {
                setError(data.err || "Failed to load event");
            }
        } catch {
            setError("Failed to load event");
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    const reconcileStorage = useCallback(async () => {
        if (!eventId) return;
        try {
            const res = await fetch(`/api/events/${eventId}/reconcile`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setEvent(prev => prev ? {
                    ...prev,
                    photo_count: data.photo_count,
                    total_size_mb: data.total_size_mb
                } : null);
            }
        } catch (err) {
            console.error("Auto-reconciliation failed", err);
        }
    }, [eventId]);

    // Re-fetch encoding count when encoding phase changes
    useEffect(() => {
        const isActiveUpload = uploadingEventId === event?.id && phase === "uploading";
        if (!event?.id || isActiveUpload) return;
        if (phase === "done") {
            fetch(`/api/encode/count?eventId=${event.id}`)
                .then(res => res.json())
                .then(data => { if (data.success) setEncodedCount(data.encoded_count); })
                .catch(() => { });
        }
    }, [event?.id, phase]);

    useEffect(() => {
        if (session) {
            fetchEvent();
            reconcileStorage();
        }
    }, [session, fetchEvent, reconcileStorage]);

    // Poll Supabase every 10s while uploading to this event so stats update live
    useEffect(() => {
        if (!isUploading || uploadingEventId !== eventId) return;
        const interval = setInterval(() => {
            fetchEvent();
        }, 2000);
        return () => clearInterval(interval);
    }, [isUploading, uploadingEventId, eventId, fetchEvent]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Filter only true images matching our Python backend list
            const validFiles = Array.from(e.target.files).filter(f =>
                !f.name.startsWith("._") && !f.name.startsWith("__MACOSX") &&
                (f.type.startsWith("image/") || f.name.match(/\.(jpg|jpeg|png|webp|bmp|tiff)$/i))
            );
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const validFiles = Array.from(e.dataTransfer.files).filter(f =>
                !f.name.startsWith("._") && !f.name.startsWith("__MACOSX") &&
                (f.type.startsWith("image/") || f.name.match(/\.(jpg|jpeg|png|webp|bmp|tiff)$/i))
            );
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    // startS3Upload has been moved to UploadProvider so it persists globally

    const triggerBackendEncoding = async () => {
        if (!event) return;
        try {
            const res = await fetch("/api/encode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId: event.id }),
            });

            const data = await res.json();

            if (data.success && data.task_id) {
                // Start tracking the Celery task in the global upload widget
                startEncodingPoll(data.task_id, event.id);
            } else {
                setError(data.err || "Failed to trigger encoding.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to contact encoding server.");
        }
    };

    if (!session || loading) {
        return (
            <div className="h-[calc(100vh-3.5rem)]">
                <div className="max-w-6xl mx-auto px-5 py-6 h-full flex flex-col animate-pulse">
                    <div className="h-4 w-20 bg-white/5 rounded mb-4" />
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                        <div className="flex-1 space-y-2">
                            <div className="h-7 w-40 bg-white/10 rounded-lg" />
                            <div className="h-3 w-52 bg-white/5 rounded" />
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 w-[100px] space-y-2">
                                    <div className="h-3 w-8 bg-white/5 rounded" />
                                    <div className="h-6 w-10 bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5 flex-1 min-h-0">
                        {[1, 2].map(i => (
                            <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 flex flex-col gap-3">
                                <div className="h-5 w-36 bg-white/10 rounded" />
                                <div className="h-3 w-48 bg-white/5 rounded" />
                                <div className="flex-1 rounded-xl bg-white/[0.02] flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center px-5">
                <div className="max-w-sm w-full rounded-2xl bg-red-500/[0.06] border border-red-500/20 p-8 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Link href="/organizer/dashboard" className="btn-primary inline-flex">Go Back</Link>
                </div>
            </div>
        );
    }

    const photoCount = uploadingEventId === event?.id && (phase === "uploading" || phase === "encoding") && imageCount > 0
        ? imageCount
        : (event?.photo_count || 0);

    return (
        <div className="min-h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden relative">
            {/* Ambient background glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-sky-600/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-blue-600/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-5 py-5 h-full flex flex-col stagger-children">
                {/* Back link */}
                <Link
                    href="/organizer/dashboard"
                    className="inline-flex items-center gap-1.5 text-[13px] text-white/30 hover:text-white/70 mb-4 transition-colors w-fit animate-fade-in"
                >
                    <ArrowLeft size={14} /> Dashboard
                </Link>

                {error && (
                    <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-2.5 mb-4 text-red-400 text-sm flex items-center justify-between animate-slide-up">
                        {error}
                        <button onClick={() => setError("")} className="hover:text-red-300 transition"><X size={14} /></button>
                    </div>
                )}

                {/* Header: Event info + Stats */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold truncate">{event?.name}</h1>
                            <span className="shrink-0 font-mono text-[11px] bg-white/[0.06] text-white/60 px-2 py-0.5 rounded-md border border-white/[0.08] select-all cursor-copy" title="Click to copy event code">
                                {event?.code}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-[13px] text-white/30 truncate">Upload pipeline & face recognition</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Stat pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[
                                { label: "Photos", value: photoCount.toLocaleString() },
                                { label: "Encoded", value: encodedCount !== null ? encodedCount.toLocaleString() : "..." },
                                { label: "Attendees", value: event?.attendeesAccessed?.length || 0 },
                                { label: "Storage", value: `${(event?.total_size_mb || 0).toFixed(1)} MB` }
                            ].map((stat, i) => (
                                <div key={i} className="glass-card rounded-xl px-4 py-2 text-center min-w-[75px]">
                                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">{stat.label}</p>
                                    <p className="text-base font-bold tabular-nums text-white/90">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pipeline Cards */}
                <div className="grid md:grid-cols-2 gap-5 flex-1 min-h-0">

                    {/* ── Card 1: Upload ── */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 flex flex-col relative overflow-hidden group animate-slide-up" style={{ animationDelay: '100ms' }}>
                        {/* Top accent */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center text-[11px] font-bold text-sky-400">1</div>
                            <h2 className="text-[15px] font-semibold">Upload Photos</h2>
                        </div>
                        <p className="text-xs text-white/30 mb-3">Drop photos from your hard drive to cloud storage</p>

                        {/* Dropzone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`flex-1 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 border border-dashed ${(phase === "uploading" && uploadingEventId === event?.id) ? "border-sky-500/20 bg-sky-500/[0.03]"
                                : (phase === "encoding" && uploadingEventId === event?.id) ? "opacity-40 border-white/[0.06] bg-white/[0.01]"
                                    : dragActive ? "border-sky-400/50 bg-sky-500/[0.06] scale-[1.01]"
                                        : files.length ? "border-sky-500/20 bg-sky-500/[0.03] cursor-pointer"
                                            : "border-white/[0.08] bg-white/[0.01] hover:border-white/[0.15] hover:bg-white/[0.02] cursor-pointer"
                                }`}
                            onClick={() => phase !== "uploading" && phase !== "encoding" && document.getElementById("folderInput")?.click()}
                        >
                            <input
                                id="folderInput"
                                type="file"
                                multiple
                                accept="image/jpeg, image/png, image/webp"
                                // @ts-ignore
                                webkitdirectory="true"
                                directory="true"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {phase === "uploading" && uploadingEventId === event?.id ? (
                                <div className="w-full px-6 space-y-5">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-2xl font-bold tabular-nums text-white/90">{progress}</span>
                                            <span className="text-xs font-bold text-white/20 uppercase tracking-widest">%</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); cancelUpload(); }}
                                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider transition-colors border border-red-500/20 shadow-lg"
                                        >
                                            Cancel Upload
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden border border-white/5 p-[1px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                                            </span>
                                            <p className="text-[11px] text-white/40 font-medium tracking-tight truncate max-w-[200px]">
                                                {statusMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : !files.length ? (
                                <div className="space-y-2 text-center">
                                    <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-2">
                                        <FolderUp size={22} className="text-white/25" />
                                    </div>
                                    <p className="text-sm font-medium text-white/60">
                                        {dragActive ? "Drop here" : "Select folder"}
                                    </p>
                                    <p className="text-[11px] text-white/20">or drag & drop images • JPG, PNG, WebP</p>
                                </div>
                            ) : (
                                <div className="space-y-2 text-center">
                                    <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center mx-auto mb-2">
                                        <ImageIcon size={22} className="text-sky-400" />
                                    </div>
                                    <p className="text-sm font-medium text-white/90">{files.length.toLocaleString()} images queued</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                                        className="text-[11px] text-white/25 hover:text-red-400 transition"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {files.length > 0 && phase !== "uploading" && phase !== "encoding" && (
                            <button
                                onClick={() => startUpload(files, event!)}
                                className="mt-4 w-full btn-premium py-2.5 justify-center"
                            >
                                <Upload size={14} className="text-white/60" />
                                <span>Start Upload</span>
                            </button>
                        )}
                    </div>

                    {/* ── Card 2: AI Encoding ── */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 flex flex-col relative overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
                        {/* Top accent */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center text-[11px] font-bold text-sky-400">2</div>
                            <h2 className="text-[15px] font-semibold">AI Face Recognition</h2>
                        </div>
                        <p className="text-xs text-white/30 mb-3">Analyze uploaded photos with GPU-powered face detection</p>

                        <div className="flex-1 rounded-xl bg-white/[0.01] border border-white/[0.04] flex flex-col items-center justify-center">
                            {phase === "encoding" && uploadingEventId === event?.id ? (
                                <div className="w-full px-6 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto relative">
                                        <Cpu size={26} className="text-sky-400 animate-pulse" />
                                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-500/20 animate-[spin_3s_linear_infinite]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-sky-300">Processing</p>
                                        <p className="text-xs text-white/30 mt-0.5">{statusMessage}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-sky-400">Encoding</span>
                                            <span className="text-white/40 tabular-nums">{encodeProgress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${encodeProgress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ) : (event?.photo_count || 0) === 0 || (uploadingEventId === event?.id && phase === "uploading") ? (
                                <div className="text-center px-6 space-y-2">
                                    <div className="w-14 h-14 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto border border-white/5">
                                        <Cpu size={24} className="text-white/10" />
                                    </div>
                                    <p className="text-sm text-white/20">
                                        {uploadingEventId === event?.id && phase === "uploading" ? "Upload in progress..." : "Upload photos first"}
                                    </p>
                                </div>
                            ) : encodedCount !== null && encodedCount >= (event?.photo_count || 0) && (event?.photo_count || 0) > 0 ? (
                                <div className="text-center px-6 space-y-3">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                                        <CheckCircle size={26} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-emerald-400">All {encodedCount.toLocaleString()} images encoded</p>
                                        <p className="text-[11px] text-white/25 mt-0.5">Face recognition ready</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center px-6 space-y-4">
                                    <div className="w-14 h-14 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto relative">
                                        <Cpu size={24} className="text-sky-400" />
                                        <div className="absolute inset-0 rounded-full border border-dashed border-sky-500/20 animate-[spin_10s_linear_infinite]" />
                                    </div>
                                    {encodedCount !== null && encodedCount > 0 && (
                                        <p className="text-xs text-white/30">{encodedCount}/{event?.photo_count || 0} encoded</p>
                                    )}
                                    <button
                                        onClick={triggerBackendEncoding}
                                        className="w-full btn-premium py-2.5 justify-center"
                                    >
                                        <Cpu size={14} className="text-white/60" />
                                        <span>Start Recognition</span>
                                    </button>
                                    <p className="text-[10px] text-white/20">~1 min per 500 photos</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

