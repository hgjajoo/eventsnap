"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  Loader2,
  Download,
  X,
  Sparkles,
  CheckCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// TODO: Update MODEL_URL when backend is finalized
const MODEL_URL = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:8000";

type Angle = "front" | "left" | "right";

interface CapturedImage {
  blob: Blob;
  previewUrl: string;
}

interface MatchedPhoto {
  url: string;
  filename: string;
  confidence: number;
}

const ANGLE_CONFIG: { key: Angle; label: string; instruction: string; icon: string }[] = [
  { key: "front", label: "Front", instruction: "Look straight at the camera", icon: "😐" },
  { key: "left", label: "Left Side", instruction: "Turn your head to the left", icon: "👈" },
  { key: "right", label: "Right Side", instruction: "Turn your head to the right", icon: "👉" },
];

export default function AttendeeSort() {
  // Flow state
  const [eventCode, setEventCode] = useState("");
  const [attendeeInfo, setAttendeeInfo] = useState<{ name: string; eventName: string } | null>(null);
  const [step, setStep] = useState<"code" | "capture" | "review" | "loading" | "results">("code");
  const [currentAngle, setCurrentAngle] = useState(0); // 0=front, 1=left, 2=right
  const [captures, setCaptures] = useState<(CapturedImage | null)[]>([null, null, null]);
  const [cameraActive, setCameraActive] = useState(false);

  // Results
  const [matchedPhotos, setMatchedPhotos] = useState<MatchedPhoto[]>([]);
  const [downloadLink, setDownloadLink] = useState("");
  const [error, setError] = useState("");

  // Camera
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load attendee info from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("attendee");
    if (stored) {
      const info = JSON.parse(stored);
      setAttendeeInfo({ name: info.name, eventName: info.eventName });
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

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setCameraActive(true);
      setError("");
    } catch {
      setError("Unable to access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror for selfie cam
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setCaptures((prev) => {
            const next = [...prev];
            // Revoke old URL if retaking
            if (next[currentAngle]?.previewUrl) {
              URL.revokeObjectURL(next[currentAngle]!.previewUrl);
            }
            next[currentAngle] = { blob, previewUrl };
            return next;
          });
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  }, [currentAngle, stopCamera]);

  const retakeCurrentAngle = useCallback(() => {
    setCaptures((prev) => {
      const next = [...prev];
      if (next[currentAngle]?.previewUrl) {
        URL.revokeObjectURL(next[currentAngle]!.previewUrl);
      }
      next[currentAngle] = null;
      return next;
    });
    startCamera();
  }, [currentAngle, startCamera]);

  const proceedToNextAngle = useCallback(() => {
    if (currentAngle < 2) {
      setCurrentAngle(currentAngle + 1);
      startCamera();
    } else {
      // All 3 captured → review
      setStep("review");
    }
  }, [currentAngle, startCamera]);

  const startCapture = useCallback(() => {
    if (!eventCode) return;
    setStep("capture");
    setCurrentAngle(0);
    setCaptures([null, null, null]);
    startCamera();
  }, [eventCode, startCamera]);

  const retakeFromReview = useCallback((index: number) => {
    setCurrentAngle(index);
    setStep("capture");
    setCaptures((prev) => {
      const next = [...prev];
      if (next[index]?.previewUrl) {
        URL.revokeObjectURL(next[index]!.previewUrl);
      }
      next[index] = null;
      return next;
    });
    startCamera();
  }, [startCamera]);

  const handleSubmit = async () => {
    // All 3 must be captured
    if (captures.some((c) => !c)) return;

    setStep("loading");
    setError("");
    setMatchedPhotos([]);
    setDownloadLink("");

    try {
      const formData = new FormData();
      formData.append("front", new File([captures[0]!.blob], "front.jpg", { type: "image/jpeg" }));
      formData.append("left", new File([captures[1]!.blob], "left.jpg", { type: "image/jpeg" }));
      formData.append("right", new File([captures[2]!.blob], "right.jpg", { type: "image/jpeg" }));
      formData.append("eventCode", eventCode);

      // TODO: Update this endpoint when backend ML API is ready
      // Expected: POST /api/sort — sends 3 face images (front, left, right) + event code
      const res = await fetch(`${MODEL_URL}/api/sort`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMatchedPhotos(data.photos || []);
        setDownloadLink(data.downloadUrl || "");
        setStep("results");
      } else {
        setError(data.err || "No matching photos found.");
        setStep("review");
      }
    } catch {
      setError("Failed to connect to the recognition service.");
      setStep("review");
    }
  };

  const angleConfig = ANGLE_CONFIG[currentAngle];
  const currentCapture = captures[currentAngle];
  const allCaptured = captures.every((c) => c !== null);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Find Your <span className="gradient-text">Photos</span>
          </h1>
          <p className="text-white/40 max-w-sm mx-auto text-sm">
            {step === "code" && "Enter your event code to begin scanning."}
            {step === "capture" && `Step ${currentAngle + 1}/3 — ${angleConfig.instruction}`}
            {step === "review" && "Review your photos before submitting."}
            {step === "loading" && "Our AI is searching for your photos..."}
            {step === "results" && `Found ${matchedPhotos.length} photo${matchedPhotos.length !== 1 ? "s" : ""}!`}
          </p>
        </div>

        {/* Progress dots */}
        {(step === "capture" || step === "review") && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {ANGLE_CONFIG.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${captures[i]
                    ? "w-8 bg-emerald-400"
                    : i === currentAngle && step === "capture"
                      ? "w-8 bg-violet-500 animate-pulse"
                      : "w-4 bg-white/10"
                  }`}
              />
            ))}
          </div>
        )}

        {/* ── Step: Event Code ── */}
        {step === "code" && (
          <div className="space-y-6 animate-slide-up">
            <div className="glass rounded-2xl p-6">
              <label className="text-sm text-white/50 mb-2 block font-medium">Event Code</label>
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="input-field text-center text-xl font-mono tracking-[0.3em] uppercase"
              />
              {attendeeInfo && (
                <p className="text-sm text-white/30 mt-2 text-center">
                  Event: <span className="text-white/60">{attendeeInfo.eventName}</span>
                </p>
              )}
            </div>

            <button
              onClick={startCapture}
              disabled={eventCode.length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Camera size={18} /> Start Face Scan
            </button>

            <p className="text-xs text-white/20 text-center">
              You&apos;ll take 3 photos: front, left side, and right side.
              <br />
              Your face data is processed in real-time and never stored permanently.
            </p>
          </div>
        )}

        {/* ── Step: Camera Capture ── */}
        {step === "capture" && (
          <div className="space-y-5 animate-slide-up">
            {/* Angle label */}
            <div className="glass rounded-xl px-4 py-3 flex items-center justify-center gap-3">
              <span className="text-2xl">{angleConfig.icon}</span>
              <div className="text-center">
                <p className="font-semibold text-sm">{angleConfig.label}</p>
                <p className="text-xs text-white/40">{angleConfig.instruction}</p>
              </div>
            </div>

            {/* Camera OR Preview */}
            {cameraActive && !currentCapture ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black ring-2 ring-white/5">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {/* Face guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-56 rounded-full border-2 border-white/15 border-dashed" />
                  </div>
                  {/* Angle badge */}
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/70">
                    {currentAngle + 1} / 3
                  </div>
                </div>

                <button
                  onClick={capturePhoto}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Camera size={18} /> Capture
                </button>
              </div>
            ) : currentCapture ? (
              /* Preview after capture */
              <div className="space-y-4 animate-fade-in">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] ring-2 ring-emerald-500/30">
                  <Image
                    src={currentCapture.previewUrl}
                    alt={`${angleConfig.label} capture`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-emerald-500/20 backdrop-blur-sm rounded-full p-1.5">
                      <CheckCircle size={18} className="text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={retakeCurrentAngle}
                    className="btn-ghost flex-1 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} /> Retake
                  </button>
                  <button
                    onClick={proceedToNextAngle}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {currentAngle < 2 ? (
                      <>Next <ChevronRight size={16} /></>
                    ) : (
                      <>Review All</>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ── Step: Review All 3 ── */}
        {step === "review" && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-3 gap-3">
              {ANGLE_CONFIG.map((angle, i) => (
                <div key={angle.key} className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-white/10 group">
                    {captures[i] ? (
                      <>
                        <Image
                          src={captures[i]!.previewUrl}
                          alt={angle.label}
                          fill
                          className="object-cover"
                        />
                        {/* Retake overlay */}
                        <button
                          onClick={() => retakeFromReview(i)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <div className="flex flex-col items-center gap-1 text-white/80">
                            <RotateCcw size={20} />
                            <span className="text-[10px]">Retake</span>
                          </div>
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <X size={20} className="text-white/20" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 text-center">{angle.label}</p>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center justify-between">
                {error}
                <button onClick={() => setError("")}><X size={16} /></button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep("code"); stopCamera(); setCaptures([null, null, null]); }}
                className="btn-ghost flex-1 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Start Over
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allCaptured}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Sparkles size={16} /> Find My Photos
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Loading ── */}
        {step === "loading" && (
          <div className="glass rounded-2xl p-12 text-center animate-slide-up">
            <Loader2 size={40} className="animate-spin text-violet-400 mx-auto mb-4" />
            <p className="font-medium mb-1">Scanning event photos...</p>
            <p className="text-sm text-white/30">This may take a moment</p>
          </div>
        )}

        {/* ── Step: Results ── */}
        {step === "results" && (
          <div className="space-y-5 animate-slide-up">
            {matchedPhotos.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-400" />
                    {matchedPhotos.length} photo{matchedPhotos.length !== 1 ? "s" : ""} found
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

                <div className="grid grid-cols-2 gap-3">
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
              </>
            ) : (
              <div className="glass rounded-2xl p-10 text-center">
                <p className="text-lg font-semibold mb-2">No photos found</p>
                <p className="text-sm text-white/40 mb-4">
                  We couldn&apos;t find any matching photos. Try scanning again with better lighting.
                </p>
              </div>
            )}

            <button
              onClick={() => { setStep("code"); setCaptures([null, null, null]); setMatchedPhotos([]); setDownloadLink(""); }}
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Scan Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
