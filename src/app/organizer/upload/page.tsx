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
  const preSelectedEventId = searchParams.get("event");

  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success) {
          setEvents(data.events);
          if (preSelectedEventId) setSelectedEvent(preSelectedEventId);
        }
      } catch {
        setError("Failed to load events");
      }
    };
    fetchEvents();
  }, [preSelectedEventId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (!f.name.endsWith(".zip")) {
        setError("Please upload a ZIP file");
        return;
      }
      setFile(f);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedEvent) return;

    const event = events.find((e) => e._id === selectedEvent);
    if (!event) return;

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("event_code", event.code);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
      }, 500);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MODEL_URL}/upload_photos`,
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);

      if (res.ok) {
        setProgress(100);
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Upload failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const selectedEventData = events.find((e) => e._id === selectedEvent);

  return (
    <div className="min-h-screen pt-28 pb-12 px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Event Photos</h1>
          <p className="text-white/50">
            Upload your event photos as a ZIP file
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError("")}>
              <X size={14} />
            </button>
          </div>
        )}

        {success ? (
          <div className="p-12 rounded-2xl glass text-center animate-slide-up">
            <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
            <p className="text-white/50 mb-2">
              Photos have been processed for event:{" "}
              <span className="text-violet-400">{selectedEventData?.name}</span>
            </p>
            <p className="text-sm text-white/30 mb-6">
              Event Code:{" "}
              <span className="font-mono text-violet-400">
                {selectedEventData?.code}
              </span>
            </p>
            <Link
              href="/organizer/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Event Selector */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Select Event
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all appearance-none"
              >
                <option value="" className="bg-neutral-900">
                  Choose an event...
                </option>
                {events.map((event) => (
                  <option
                    key={event._id}
                    value={event._id}
                    className="bg-neutral-900"
                  >
                    {event.name} ({event.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div
              className={`relative p-12 rounded-2xl border-2 border-dashed transition-all text-center ${file
                ? "border-violet-500/50 bg-violet-500/5"
                : "border-white/10 hover:border-white/20 glass"
                }`}
            >
              {file ? (
                <div>
                  <FileArchive
                    size={48}
                    className="text-violet-400 mx-auto mb-3"
                  />
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-white/40">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setFile(null)}
                    className="mt-3 text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload
                    size={48}
                    className="text-white/20 mx-auto mb-3"
                  />
                  <p className="text-white/60 mb-1">
                    Drop your ZIP file here or click to browse
                  </p>
                  <p className="text-sm text-white/30">
                    Supports .zip files up to 500MB
                  </p>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Uploading...</span>
                  <span className="text-white/50">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !file || !selectedEvent}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing Photos...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload & Process
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    }>
      <UploadContent />
    </Suspense>
  );
}
