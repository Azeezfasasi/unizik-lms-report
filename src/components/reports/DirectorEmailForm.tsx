"use client";

import { useState } from "react";

export function DirectorEmailForm({ academicSession, semester }: { academicSession: string; semester?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"" | "sending" | "sent" | "error">("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const response = await fetch("/api/reports/director/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        academicSession,
        semester,
        format: "PDF",
        subject: `Director summary for ${academicSession}${semester ? ` ${semester} semester` : ""}`,
        htmlContent: `<p>Hi ${name},</p><p>The director summary for ${academicSession}${semester ? ` ${semester} semester` : ""} is ready for review.</p>`,
      }),
    });

    if (response.ok) {
      setStatus("sent");
      return;
    }

    const data = await response.json().catch(() => null);
    setErrorMessage(data?.message || "Unable to send the summary email.");
    setStatus("error");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto]">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Recipient name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Recipient email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="flex flex-col justify-end gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {status === "sending" ? "Sending…" : "Send summary"}
        </button>
        {status === "sent" ? (
          <p className="text-sm font-medium text-emerald-700">Summary email queued successfully.</p>
        ) : status === "error" ? (
          <p className="text-sm font-medium text-red-700">
            {errorMessage || "Unable to send the summary email."}
          </p>
        ) : null}
      </div>
    </form>
  );
}
