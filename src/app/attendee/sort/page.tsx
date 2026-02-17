"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Camera,
  Loader2,
  Download,
  X,
  ImageIcon,
  Sparkles,
  CheckCircle,
} from "lucide-react";

// TODO: Update MODEL_URL when backend is finalized
const MODEL_URL = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:8000";

interface AttendeeInfo {
  id: string;
  name: string;
  email: string;
  eventCode: string;
  eventName: string;
}

interface MatchedPhoto {
  url: string;
  filename: string;
  confidence: number;
}

export default function AttendeeSort() {
  const [attendee, setAttendee] = useState<AttendeeInfo | null>(null);
  const [eventCode, setEventCode] = useState("");
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [sampleImg, setSampleImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState<MatchedPhoto[]>([]);
  const [downloadLink, setDownloadLink] = useState("");
  const [error, setError] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load attendee from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("attendeeInfo");
    if (stored) {
      const info = JSON.parse(stored);
      setAttendee(info);
      setEventCode(info.eventCode);
    }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setSampleImg(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError("");
      setMatchedPhotos([]);
      setDownloadLink("");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setMode("camera");
      setError("");
    } catch {
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setMode("upload");
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setSampleImg(file);
          setPreviewUrl(URL.createObjectURL(blob));
          setMatchedPhotos([]);
          setDownloadLink("");
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const handleSort = async () => {
    if (!sampleImg || !eventCode) return;
    setLoading(true);
    setError("");
    setMatchedPhotos([]);
    setDownloadLink("");

    try {
      const formData = new FormData();
      formData.append("image", sampleImg);
      formData.append("eventCode", eventCode);

      // TODO: Update this endpoint when backend ML API is ready
      // Expected: POST /api/sort — sends face image + event code, returns matched photos
      const res = await fetch(`${MODEL_URL}/api/sort`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMatchedPhotos(data.photos || []);
        setDownloadLink(data.downloadUrl || "");
      } else {
        setError(data.err || "No matching photos found. Try a clearer photo.");
      }
    } catch {
      setError("Failed to connect to the recognition service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Find Your <span className="gradient-text">Photos</span>
          </h1>
          <p className="text-white/40 max-w-md mx-auto">
            Upload a selfie or use your camera — our AI will find all event photos with your face.
          </p>
        </div>

        <div className="space-y-6 animate-slide-up">
          {/* Event Code */}
          <div className="glass rounded-2xl p-6">
            <label className="text-sm text-white/50 mb-2 block font-medium">Event Code</label>
            <input
              type="text"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character event code"
              maxLength={6}
              className="input-field text-center text-lg font-mono tracking-[0.3em] uppercase"
            />
            {attendee && (
              <p className="text-sm text-white/30 mt-2 text-center">
                Event: <span className="text-white/60">{attendee.eventName}</span>
              </p>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="glass rounded-2xl p-6">
            <label className="text-sm text-white/50 mb-3 block font-medium">Your Photo</label>

            {/* Camera / Upload Toggle */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => { stopCamera(); setMode("upload"); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${mode === "upload"
                  ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                  : "bg-white/5 text-white/40 border border-transparent hover:bg-white/10"
                  }`}
              >
                <Upload size={16} /> Upload Photo
              </button>
              <button
                onClick={startCamera}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${mode === "camera"
                  ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                  : "bg-white/5 text-white/40 border border-transparent hover:bg-white/10"
                  }`}
              >
                <Camera size={16} /> Use Camera
              </button>
            </div>

            {/* Camera View */}
            {mode === "camera" && cameraStream && (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {/* Face guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-60 rounded-full border-2 border-white/20 border-dashed" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={stopCamera} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button onClick={capturePhoto} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Camera size={16} /> Capture
                  </button>
                </div>
              </div>
            )}

            {/* Upload / Preview */}
            {mode === "upload" && !previewUrl && (
              <div
                onClick={() => document.getElementById("faceInput")?.click()}
                className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl p-10 text-center cursor-pointer transition-colors"
              >
                <input
                  id="faceInput"
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon size={24} className="text-white/30" />
                </div>
                <p className="text-sm text-white/40">
                  Click to upload a clear photo of your face
                </p>
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="relative animate-fade-in">
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden mx-auto ring-2 ring-violet-500/30">
                  <Image
                    src={previewUrl}
                    alt="Your photo"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    setSampleImg(null);
                    setPreviewUrl(null);
                    setMatchedPhotos([]);
                    setDownloadLink("");
                  }}
                  className="absolute top-0 right-1/2 translate-x-[100px] -translate-y-2 p-1.5 rounded-full bg-neutral-900/90 border border-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center justify-between">
              {error}
              <button onClick={() => setError("")}><X size={16} /></button>
            </div>
          )}

          {/* Find Button */}
          <button
            onClick={handleSort}
            disabled={!sampleImg || !eventCode || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Searching...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Find My Photos
              </>
            )}
          </button>

          {/* Results */}
          {matchedPhotos.length > 0 && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-400" />
                  Found {matchedPhotos.length} photo{matchedPhotos.length !== 1 ? "s" : ""}
                </h3>
                {downloadLink && (
                  <a
                    href={downloadLink}
                    download
                    className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2"
                  >
                    <Download size={15} /> Download All
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {matchedPhotos.map((photo, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-square card-hover">
                    <Image
                      src={photo.url}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-xs text-white truncate">{photo.filename}</p>
                        <p className="text-[10px] text-white/50">
                          {(photo.confidence * 100).toFixed(0)}% match
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          {!matchedPhotos.length && !loading && (
            <p className="text-xs text-white/20 text-center px-4">
              Your face data is only used for matching and is never stored permanently.
              The AI processes your photo in real-time and discards it after matching.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
