"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
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
  Cpu,
} from "lucide-react";
import Link from "next/link";

interface EventOption {
  id: string;
  name: string;
  code: string;
}

type UploadPhase = "idle" | "uploading" | "encoding" | "done";

function UploadContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedEvent = searchParams.get("event");

  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(preselectedEvent || "");
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [encodeProgress, setEncodeProgress] = useState(0);
  const [encodeStatus, setEncodeStatus] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [imageCount, setImageCount] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(
          data.events.map((e: any) => ({ id: e.id || e._id, name: e.name, code: e.code }))
        );
        if (preselectedEvent && data.events.some((e: any) => (e.id || e._id) === preselectedEvent)) {
          setSelectedEvent(preselectedEvent);
        }
      }
    } catch {
      setError("Failed to load events");
    }
  }, [preselectedEvent]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollEncodingStatus = (taskId: string) => {
    setPhase("encoding");
    setEncodeProgress(0);
    setEncodeStatus("Queued for processing...");

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/upload/status?taskId=${taskId}`);
        const data = await res.json();

        if (data.status === "PROCESSING" || data.status === "INITIALIZING") {
          const pct = parseInt(data.progress) || 0;
          setEncodeProgress(pct);
          setEncodeStatus(
            data.status === "INITIALIZING"
              ? "Initializing model..."
              : `Processing ${data.images_processed || 0}/${data.total_images || "?"} images`
          );
        } else if (data.status === "SUCCESS") {
          setEncodeProgress(100);
          setEncodeStatus("Encoding complete!");
          setPhase("done");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === "FAILURE") {
          setError("Encoding failed. Please try again.");
          setPhase("idle");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Silently retry on network hiccups
      }
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".zip")) {
        setError("Please select a ZIP file containing your event photos");
        return;
      }
      setFile(selected);
      setError("");
      setPhase("idle");
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
      setPhase("idle");
    } else {
      setError("Please drop a ZIP file");
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedEvent) return;
    setPhase("uploading");
    setUploadMessage("Extracting and uploading images...");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", selectedEvent);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.err || "Upload failed");
        setPhase("idle");
        return;
      }

      setImageCount(data.imageCount || 0);
      setUploadMessage(`${data.imageCount} images uploaded to storage`);

      // If we got a task ID, poll encoding progress
      if (data.taskId) {
        pollEncodingStatus(data.taskId);
      } else {
        // No task ID — encoding couldn't be triggered, but upload succeeded
        setPhase("done");
      }
    } catch {
      setError("Upload failed. Please try again.");
      setPhase("idle");
    }
  };

  const resetForm = () => {
    setPhase("idle");
    setFile(null);
    setEncodeProgress(0);
    setEncodeStatus("");
    setUploadMessage("");
    setImageCount(0);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : "0";
  const selectedEventData = events.find((e) => e.id === selectedEvent);

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
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Upload Photos</h1>
          <p className="text-white/40 mb-8">
            Upload a ZIP file of event photos. Our AI will process and index every face.
          </p>

          {phase === "done" ? (
            <div className="glass rounded-2xl p-10 text-center animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {encodeProgress >= 100 ? "Processing Complete!" : "Upload Complete!"}
              </h3>
              <p className="text-white/40 mb-2">
                {imageCount > 0 && `${imageCount} images uploaded.`}
                {encodeProgress >= 100
                  ? " All faces have been indexed."
                  : " Encoding will continue in the background."}
              </p>
              {selectedEventData && (
                <p className="text-sm text-white/30 mb-6">
                  Event code: <span className="font-mono text-white/50">{selectedEventData.code}</span>
                </p>
              )}
              <div className="flex gap-3 justify-center">
                <button onClick={resetForm} className="btn-ghost">
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
                  disabled={phase !== "idle"}
                >
                  <option value="" className="bg-neutral-900">Choose an event...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id} className="bg-neutral-900">
                      {event.name} ({event.code})
                    </option>
                  ))}
                </select>
                {events.length === 0 && (
                  <p className="text-sm text-white/30 mt-2">
                    No events found.{" "}
                    <Link href="/organizer/dashboard" className="text-white/60 hover:text-white transition-colors">
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
                className={`glass rounded-2xl p-10 text-center border-2 border-dashed transition-all duration-300 ${phase !== "idle"
                    ? "pointer-events-none opacity-60"
                    : "cursor-pointer"
                  } ${dragActive
                    ? "border-sky-500 bg-sky-500/5"
                    : file
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                onClick={() => phase === "idle" && document.getElementById("zipInput")?.click()}
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
                      {phase === "idle" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <X size={13} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Upload size={28} className="text-white/40" />
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

              {/* Upload/Encoding Progress */}
              {(phase === "uploading" || phase === "encoding") && (
                <div className="glass rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    {phase === "uploading" ? (
                      <Loader2 size={18} className="animate-spin text-sky-400" />
                    ) : (
                      <Cpu size={18} className="text-violet-400 animate-pulse" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white/80">
                        {phase === "uploading" ? "Uploading to Storage" : "AI Face Encoding"}
                      </p>
                      <p className="text-xs text-white/40">
                        {phase === "uploading" ? uploadMessage : encodeStatus}
                      </p>
                    </div>
                  </div>
                  {phase === "encoding" && (
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-sky-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${encodeProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || !selectedEvent || phase !== "idle"}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {phase === "uploading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Uploading...
                  </>
                ) : phase === "encoding" ? (
                  <>
                    <Cpu size={18} className="animate-pulse" /> Encoding...
                  </>
                ) : (
                  <>
                    <Upload size={18} /> Upload & Process Photos
                  </>
                )}
              </button>

              {/* Info */}
              <div className="flex items-start gap-3 text-xs text-white/25 px-1">
                <ImageIcon size={14} className="mt-0.5 shrink-0" />
                <p>
                  Upload a ZIP file containing JPG/PNG images. The AI model will detect and index faces
                  in each photo so attendees can find their photos with a face scan.
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
          <Loader2 className="w-8 h-8 animate-spin text-white/30" />
        </div>
      }
    >
      <UploadContent />
    </Suspense>
  );
}
