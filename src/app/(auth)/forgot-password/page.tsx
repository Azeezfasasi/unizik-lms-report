'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setMessage(data.message || "Reset request received.");
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Password recovery</p>
      <h1 className="mt-3 text-3xl font-semibold">Reset your access</h1>
      <p className="mt-2 text-sm text-slate-400">Enter the email associated with your portal account and we will send recovery instructions.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0" placeholder="name@unizik.edu.ng" />
        </div>

        <button type="submit" className="w-full rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400">Send reset link</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}

      <div className="mt-6 text-sm text-slate-400">
        <Link href="/login" className="hover:text-teal-300">Back to sign in</Link>
      </div>
    </div>
  );
}
