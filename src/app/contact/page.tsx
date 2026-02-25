"use client";

import React, { useState } from "react";
import { Send, Loader2, CheckCircle, Mail, User, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
      <div className="relative z-10 w-full max-w-lg">
        {success ? (
          <div className="text-center animate-slide-up">
            <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Message Sent!</h1>
            <p className="text-white/50 mb-6">
              We&apos;ll get back to you as soon as possible.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({ name: "", email: "", subject: "", message: "" });
              }}
              className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Get in Touch
              </h1>
              <p className="text-white/50">
                Have a question or feedback? We&apos;d love to hear from you.
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
                <MessageSquare
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="input-field !pl-11"
                />
              </div>

              <textarea
                placeholder="Your message..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="input-field resize-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send Message
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}