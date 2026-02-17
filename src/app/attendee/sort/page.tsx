"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Camera,
  Loader2,
  Download,
  X,
  ImageIcon,
} from "lucide-react";

interface AttendeeInfo {
  id: string;
  name: string;
  email: string;
  eventCode: string;
  eventName: string;
}

export default function AttendeeSort() {
  const router = useRouter();
  const [attendee, setAttendee] = useState<AttendeeInfo | null>(null);
  const [eventCode, setEventCode] = useState("");
  const [sampleImg, setSampleImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("attendee");
    if (stored) {
      const parsed = JSON.parse(stored);
      setAttendee(parsed);
      setEventCode(parsed.eventCode);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSampleImg(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Camera access denied");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setSampleImg(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }, "image/jpeg");

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setShowCamera(false);
  };

  const handleSort = async () => {
    if (!sampleImg || !eventCode) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", sampleImg);
      formData.append("event_code", eventCode);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MODEL_URL}/sort_photos`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setDownloadLink(url);

        // Track download for this attendee
        if (attendee?.id) {
          fetch("/api/attendee/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attendeeId: attendee.id,
              eventId: eventCode,
            }),
          }).catch(() => { });
        }
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to sort photos. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Find Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Photos
            </span>
          </h1>
          {attendee && (
            <p className="text-white/50">
              Event: <span className="text-emerald-400">{attendee.eventName}</span>{" "}
              ({attendee.eventCode})
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Event Code (if not from login) */}
        {!attendee && (
          <div className="mb-6">
            <label className="block text-sm text-white/60 mb-1.5">
              Event Code
            </label>
            <input
              type="text"
              placeholder="ABC123"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all uppercase tracking-widest font-mono text-center text-lg"
            />
          </div>
        )}

        {/* Photo Upload Area */}
        <div className="p-8 rounded-2xl glass text-center">
          {previewUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Your selfie"
                className="w-48 h-48 rounded-2xl object-cover mx-auto ring-2 ring-emerald-500/30"
              />
              <button
                onClick={() => {
                  setSampleImg(null);
                  setPreviewUrl(null);
                  setDownloadLink("");
                }}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div>
              <ImageIcon
                size={48}
                className="text-white/20 mx-auto mb-4"
              />
              <p className="text-white/50 mb-4">
                Upload a clear selfie so we can find your photos
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:bg-white/10 transition-all text-sm"
                >
                  <Upload size={16} />
                  Upload Photo
                </button>
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:bg-white/10 transition-all text-sm"
                >
                  <Camera size={16} />
                  Take Selfie
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl glass-strong p-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl"
              />
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach((t) => t.stop());
                    setShowCamera(false);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium"
                >
                  Capture
                </button>
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {!downloadLink ? (
            <button
              onClick={handleSort}
              disabled={loading || !sampleImg || !eventCode}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Finding your photos...
                </>
              ) : (
                "Find My Photos"
              )}
            </button>
          ) : (
            <a
              href={downloadLink}
              download="my-event-photos.zip"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download Your Photos
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
