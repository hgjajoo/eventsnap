"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Upload,
  FileArchive,
  Loader2,
  CheckCircle,
  X,
  ArrowLeft,
  ImageIcon,
  HardDrive,
} from "lucide-react";
import Link from "next/link";

interface EventOption {
  _id: string;
  name: string;
  code: string;
}

function UploadContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedEvent = searchParams.get("event");

  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(preselectedEvent || "");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fetchEvents = async () => {
    try {
      // TODO: Update API route when backend is finalized
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
        if (preselectedEvent && data.events.some((e: EventOption) => e._id === preselectedEvent)) {
          setSelectedEvent(preselectedEvent);
        }
      }
    } catch {
      setError("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".zip")) {
        setError("Please select a ZIP file containing your event photos");
        return;
      }
      setFile(selected);
      setError("");
      setSuccess(false);
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
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.name.endsWith(".zip")) {
      setFile(dropped);
      setError("");
      setSuccess(false);
    } else {
      setError("Please drop a ZIP file");
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedEvent) return;
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", selectedEvent);

      // TODO: Update API route when backend is finalized — this should point to your upload endpoint
      const res = await fetch("/api/events/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setFile(null);
        setProgress(100);
      } else {
        setError(data.err || "Upload failed");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : "0";

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="text-white/60 mb-4">Please sign in to upload photos.</p>
          <Link href="/organizer/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">
            Upload <span className="gradient-text">Photos</span>
          </h1>
          <p className="text-white/40 mb-8">
            Upload a ZIP file of event photos. Our AI will process and match them to attendees.
          </p>

          {/* Success State */}
          {success ? (
            <div className="glass rounded-2xl p-10 text-center animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Complete!</h3>
              <p className="text-white/40 mb-6">
                Your photos are being processed. Attendees can now find their photos using the event code.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setSuccess(false); setFile(null); }} className="btn-ghost">
                  Upload More
                </button>
                <Link href="/organizer/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Event Selection */}
              <div className="glass rounded-2xl p-6">
                <label className="text-sm text-white/50 mb-2 block font-medium">Select Event</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="" className="bg-neutral-900">Choose an event...</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id} className="bg-neutral-900">
                      {event.name} ({event.code})
                    </option>
                  ))}
                </select>
                {events.length === 0 && (
                  <p className="text-sm text-white/30 mt-2">
                    No events found.{" "}
                    <Link href="/organizer/dashboard" className="text-violet-400 hover:text-violet-300">
                      Create one first
                    </Link>
                  </p>
                )}
              </div>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`glass rounded-2xl p-10 text-center border-2 border-dashed transition-all duration-300 cursor-pointer ${dragActive
                    ? "border-violet-500 bg-violet-500/5"
                    : file
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                onClick={() => document.getElementById("zipInput")?.click()}
              >
                <input
                  id="zipInput"
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="animate-fade-in">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <FileArchive size={28} className="text-emerald-400" />
                    </div>
                    <p className="font-medium mb-1">{file.name}</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-white/40">
                      <span className="flex items-center gap-1">
                        <HardDrive size={13} /> {fileSizeMB} MB
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <X size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                      <Upload size={28} className="text-violet-400" />
                    </div>
                    <p className="font-medium mb-1">
                      {dragActive ? "Release to upload" : "Drag & drop your ZIP file"}
                    </p>
                    <p className="text-sm text-white/30">or click to browse · ZIP files only</p>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center justify-between">
                  {error}
                  <button onClick={() => setError("")}><X size={16} /></button>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 size={18} className="animate-spin text-violet-400" />
                    <span className="text-sm text-white/60">Uploading and processing...</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || !selectedEvent || uploading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} /> Upload Photos
                  </>
                )}
              </button>

              {/* Info */}
              <div className="flex items-start gap-3 text-xs text-white/25 px-1">
                <ImageIcon size={14} className="mt-0.5 shrink-0" />
                <p>
                  Upload a ZIP file containing JPG/PNG images. The AI model will process faces
                  in each photo so attendees can find their photos by uploading a selfie.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      }
    >
      <UploadContent />
    </Suspense>
  );
}
