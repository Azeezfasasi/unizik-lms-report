"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotCard() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessageTone("info");
    setMessage("Sending reset link...");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessageTone("success");
        setMessage(data.message || "Reset instructions sent.");
        return;
      }

      setMessageTone("error");
      setMessage(data.message || "Unable to issue reset request.");
    } catch {
      setMessageTone("error");
      setMessage("Unable to issue reset request. Please try again.");
    }
  }

  return (
    <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-500">Unizik LMS</div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Reset your password</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">We&apos;ll send a reset link to your registered email address.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            placeholder="name@unizik.edu.ng"
          />
        </div>

        <button type="submit" className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800">
          Send reset link
        </button>
      </form>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${messageTone === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : messageTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-600"}`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-6 text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-slate-950 hover:text-teal-500">Back to sign in</Link>
      </div>
    </div>
  );
}
