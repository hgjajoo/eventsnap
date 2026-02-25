"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  Loader2,
  X,
  Search,
  CheckCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  LogIn,
  Lock,
  Mail,
  User,
  Scan,
} from "lucide-react";

type Angle = "front" | "left" | "right";
type Step = "auth" | "encode" | "scan" | "loading" | "results";

interface CapturedImage {
  blob: Blob;
  previewUrl: string;
}

interface MatchedPhoto {
  url: string;
  filename: string;
  path: string;
}

const ANGLE_CONFIG: { key: Angle; label: string; instruction: string; icon: string }[] = [
  { key: "front", label: "Front", instruction: "Look straight at the camera", icon: "😐" },
  { key: "left", label: "Left Side", instruction: "Turn your head to the left", icon: "👈" },
  { key: "right", label: "Right Side", instruction: "Turn your head to the right", icon: "👉" },
];

export default function AttendeeSort() {
  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [attendeeId, setAttendeeId] = useState("");
  const [hasEncoding, setHasEncoding] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Flow state
  const [step, setStep] = useState<Step>("auth");
  const [eventCode, setEventCode] = useState("");
  const [error, setError] = useState("");

  // Camera state
  const [currentAngle, setCurrentAngle] = useState(0);
  const [captures, setCaptures] = useState<(CapturedImage | null)[]>([null, null, null]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [encodeStep, setEncodeStep] = useState<"capture" | "review" | "encoding">("capture");
  const [encodeLoading, setEncodeLoading] = useState(false);

  // Results state
  const [matchedPhotos, setMatchedPhotos] = useState<MatchedPhoto[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Restore session from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("attendee_session");
    if (stored) {
      try {
        const s = JSON.parse(stored);
        setAttendeeId(s.attendeeId);
        setHasEncoding(s.hasEncoding);
        setStep(s.hasEncoding ? "scan" : "encode");
      } catch { /* ignore */ }
    }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream]);

  // Attach stream to video element
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, cameraActive]);

  // ─── Auth ─────────────────────────────────────────

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      const res = await fetch("/api/attendee/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.err || "Authentication failed");
        setAuthLoading(false);
        return;
      }

      setAttendeeId(data.attendeeId);
      setHasEncoding(data.hasEncoding);

      // Save session
      sessionStorage.setItem(
        "attendee_session",
        JSON.stringify({ attendeeId: data.attendeeId, hasEncoding: data.hasEncoding })
      );

      if (data.hasEncoding) {
        setStep("scan");
      } else {
        setStep("encode");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Camera ───────────────────────────────────────

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
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

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setCaptures((prev) => {
            const next = [...prev];
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
      setEncodeStep("review");
    }
  }, [currentAngle, startCamera]);

  const startCapture = useCallback(() => {
    setEncodeStep("capture");
    setCurrentAngle(0);
    setCaptures([null, null, null]);
    startCamera();
  }, [startCamera]);

  const retakeFromReview = useCallback((index: number) => {
    setCurrentAngle(index);
    setEncodeStep("capture");
    setCaptures((prev) => {
      const next = [...prev];
      if (next[index]?.previewUrl) URL.revokeObjectURL(next[index]!.previewUrl);
      next[index] = null;
      return next;
    });
    startCamera();
  }, [startCamera]);

  // ─── Encode ───────────────────────────────────────

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleEncode = async () => {
    if (captures.some((c) => !c)) return;
    setEncodeStep("encoding");
    setEncodeLoading(true);
    setError("");

    try {
      const images = await Promise.all(captures.map((c) => blobToBase64(c!.blob)));

      const res = await fetch("/api/attendee/encode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId, images }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.err || "Face encoding failed");
        setEncodeStep("review");
        setEncodeLoading(false);
        return;
      }

      setHasEncoding(true);
      sessionStorage.setItem(
        "attendee_session",
        JSON.stringify({ attendeeId, hasEncoding: true })
      );
      setStep("scan");
    } catch {
      setError("Network error during encoding.");
      setEncodeStep("review");
    } finally {
      setEncodeLoading(false);
    }
  };

  // ─── Sort/Scan ────────────────────────────────────

  const handleScan = async () => {
    if (!eventCode || eventCode.length !== 6) return;
    setStep("loading");
    setError("");
    setMatchedPhotos([]);

    try {
      const res = await fetch("/api/attendee/sort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId, eventCode: eventCode.toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.err || "Scan failed");
        setStep("scan");
        return;
      }

      if (data.matchesFound > 0) {
        setMatchedPhotos(data.photos || []);
        setStep("results");
      } else {
        setError("No matching photos found for this event.");
        setStep("scan");
      }
    } catch {
      setError("Network error during scan.");
      setStep("scan");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("attendee_session");
    setAttendeeId("");
    setHasEncoding(false);
    setEmail("");
    setPassword("");
    setName("");
    setStep("auth");
    setCaptures([null, null, null]);
    setMatchedPhotos([]);
    setEventCode("");
    stopCamera();
  };

  const angleConfig = ANGLE_CONFIG[currentAngle];
  const currentCapture = captures[currentAngle];
  const allCaptured = captures.every((c) => c !== null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-1">
            {step === "auth" && "Welcome"}
            {step === "encode" && encodeStep === "capture" && `Step ${currentAngle + 1} of 3`}
            {step === "encode" && encodeStep === "review" && "Review Photos"}
            {step === "encode" && encodeStep === "encoding" && "Encoding Face..."}
            {step === "scan" && "Find Your Photos"}
            {step === "loading" && "Scanning..."}
            {step === "results" && `${matchedPhotos.length} Photo${matchedPhotos.length !== 1 ? "s" : ""} Found`}
          </h1>
          <p className="text-white/40 text-sm">
            {step === "auth" && "Sign in to find your event photos."}
            {step === "encode" && encodeStep === "capture" && angleConfig.instruction}
            {step === "encode" && encodeStep === "review" && "Tap any photo to retake it."}
            {step === "encode" && encodeStep === "encoding" && "Processing your face data..."}
            {step === "scan" && "Enter an event code to search."}
            {step === "loading" && "Matching against event photos..."}
            {step === "results" && ""}
          </p>
        </div>

        {/* Progress dots for encode */}
        {step === "encode" && (encodeStep === "capture" || encodeStep === "review") && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {ANGLE_CONFIG.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${captures[i]
                  ? "w-8 bg-emerald-400"
                  : i === currentAngle && encodeStep === "capture"
                    ? "w-8 bg-sky-500"
                    : "w-4 bg-white/10"
                  }`}
              />
            ))}
          </div>
        )}

        {/* ── AUTH STEP ── */}
        {step === "auth" && (
          <form onSubmit={handleAuth} className="space-y-4 animate-slide-up">
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-1.5 block font-medium">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1.5 block font-medium">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1.5 block font-medium">
                  Name <span className="text-white/20">(optional)</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center justify-between">
                {error}
                <button type="button" onClick={() => setError("")}><X size={16} /></button>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || !email || password.length < 6}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {authLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing in...</>
              ) : (
                <><LogIn size={18} /> Continue</>
              )}
            </button>

            <p className="text-xs text-white/20 text-center">
              No account? Just enter your email and a password — we&apos;ll create one for you.
            </p>
          </form>
        )}

        {/* ── ENCODE STEP — Camera Capture ── */}
        {step === "encode" && encodeStep === "capture" && (
          <div className="space-y-3 animate-slide-up">
            {!cameraActive && !currentCapture && (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
                  <Camera size={28} className="text-sky-400" />
                </div>
                <p className="font-medium mb-2">Face Scan Required</p>
                <p className="text-sm text-white/40 mb-4">
                  We need 3 photos of your face to find you in event photos.
                </p>
                <button onClick={startCapture} className="btn-primary flex items-center justify-center gap-2 mx-auto">
                  <Camera size={18} /> Start Face Scan
                </button>
              </div>
            )}

            {cameraActive && !currentCapture && (
              <>
                {/* Angle label */}
                <div className="glass rounded-xl px-4 py-2 flex items-center justify-center gap-3">
                  <span className="text-xl">{angleConfig.icon}</span>
                  <p className="font-medium text-sm">{angleConfig.label}</p>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-black ring-1 ring-white/10">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-44 rounded-full border-2 border-white/15 border-dashed" />
                  </div>
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/70">
                    {currentAngle + 1} / 3
                  </div>
                </div>

                <button onClick={capturePhoto} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Camera size={18} /> Capture
                </button>
              </>
            )}

            {currentCapture && (
              <div className="space-y-3 animate-fade-in">
                <div className="glass rounded-xl px-4 py-2 flex items-center justify-center gap-3">
                  <span className="text-xl">{angleConfig.icon}</span>
                  <p className="font-medium text-sm">{angleConfig.label}</p>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] ring-1 ring-emerald-500/30">
                  <Image src={currentCapture.previewUrl} alt={`${angleConfig.label} capture`} fill className="object-cover" />
                  <div className="absolute top-3 right-3">
                    <div className="bg-emerald-500/20 backdrop-blur-sm rounded-full p-1.5">
                      <CheckCircle size={16} className="text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={retakeCurrentAngle} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                    <RotateCcw size={16} /> Retake
                  </button>
                  <button onClick={proceedToNextAngle} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {currentAngle < 2 ? (<>Next <ChevronRight size={16} /></>) : (<>Review All</>)}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ENCODE STEP — Review ── */}
        {step === "encode" && encodeStep === "review" && (
          <div className="space-y-4 animate-slide-up">
            <div className="grid grid-cols-3 gap-3">
              {ANGLE_CONFIG.map((angle, i) => (
                <div key={angle.key} className="space-y-1.5">
                  <div
                    className="relative rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-white/10 group cursor-pointer"
                    onClick={() => retakeFromReview(i)}
                  >
                    {captures[i] ? (
                      <>
                        <Image src={captures[i]!.previewUrl} alt={angle.label} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex flex-col items-center gap-1 text-white/80">
                            <RotateCcw size={18} />
                            <span className="text-[10px]">Retake</span>
                          </div>
                        </div>
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center justify-between">
                {error}
                <button onClick={() => setError("")}><X size={16} /></button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { startCapture(); }}
                className="btn-ghost flex-1 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Retake All
              </button>
              <button
                onClick={handleEncode}
                disabled={!allCaptured || encodeLoading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {encodeLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Encoding...</>
                ) : (
                  <><Scan size={16} /> Encode Face</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── ENCODE STEP — Encoding in progress ── */}
        {step === "encode" && encodeStep === "encoding" && (
          <div className="glass rounded-2xl p-10 text-center animate-slide-up">
            <Loader2 size={36} className="animate-spin text-sky-400 mx-auto mb-4" />
            <p className="font-medium mb-1">Encoding Your Face...</p>
            <p className="text-sm text-white/30">
              Our AI is processing your photos. This may take a moment.
            </p>
          </div>
        )}

        {/* ── SCAN STEP ── */}
        {step === "scan" && (
          <div className="space-y-4 animate-slide-up">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Face Encoded</p>
                  <p className="text-xs text-white/40">Your face data is ready for matching.</p>
                </div>
              </div>

              <label className="text-sm text-white/50 mb-2 block font-medium">Event Code</label>
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="input-field text-center text-xl font-mono tracking-[0.3em] uppercase"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center justify-between">
                {error}
                <button onClick={() => setError("")}><X size={16} /></button>
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={eventCode.length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Search size={18} /> Find My Photos
            </button>

            <button onClick={logout} className="btn-ghost w-full text-sm flex items-center justify-center gap-2 text-white/30">
              Sign Out
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === "loading" && (
          <div className="glass rounded-2xl p-10 text-center animate-slide-up">
            <Loader2 size={36} className="animate-spin text-white/30 mx-auto mb-4" />
            <p className="font-medium mb-1">Scanning event photos...</p>
            <p className="text-sm text-white/30">Matching your face against the event album</p>
          </div>
        )}

        {/* ── RESULTS ── */}
        {step === "results" && (
          <div className="space-y-4 animate-slide-up">
            {matchedPhotos.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-400" />
                    {matchedPhotos.length} photo{matchedPhotos.length !== 1 ? "s" : ""} found
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {matchedPhotos.map((photo, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square card-hover">
                      <Image src={photo.url} alt={photo.filename} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-xs text-white truncate">{photo.filename}</p>
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
                  We couldn&apos;t find any matching photos. Try a different event code.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep("scan"); setMatchedPhotos([]); setEventCode(""); }}
                className="btn-ghost flex-1 flex items-center justify-center gap-2"
              >
                <Search size={16} /> New Search
              </button>
              <button
                onClick={logout}
                className="btn-ghost flex-1 text-white/30 flex items-center justify-center gap-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
