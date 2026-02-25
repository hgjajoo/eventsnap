"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, KeyRound, Loader2, ArrowRight } from "lucide-react";

export default function AttendeeLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", eventCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/attendee/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        // Store attendee info for the sort page
        sessionStorage.setItem(
          "attendee",
          JSON.stringify({
            id: data.attendeeId,
            name: form.name,
            email: form.email,
            eventCode: data.eventCode,
            eventName: data.eventName,
          })
        );
        router.push("/attendee/sort");
      } else {
        setError(data.err || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
      {/* Background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-sky-600/[0.06] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-600/[0.05] rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Photos</h1>
          <p className="text-white/40 text-sm">
            Enter your details and event code to get started
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="input-field !pl-11"
            />
          </div>

          <div className="relative">
            <Mail
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="input-field !pl-11"
            />
          </div>

          <div className="relative">
            <KeyRound
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Event Code (e.g. ABC123)"
              value={form.eventCode}
              onChange={(e) =>
                setForm({ ...form, eventCode: e.target.value.toUpperCase() })
              }
              required
              maxLength={6}
              className="input-field !pl-11 uppercase font-mono tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
            Access Photos
          </button>
        </form>

        <p className="text-center text-xs text-white/25 mt-6 px-4">
          Get your event code from the event organizer. Your data is used only for matching.
        </p>
      </div>
    </div>
  );
}
