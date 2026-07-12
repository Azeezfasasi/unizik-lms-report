"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ResetCard({ token }: { token?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 6 || password !== confirmPassword) {
      setMessage("Please enter a matching password with at least 6 characters.");
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (response.ok) {
      setMessage("Password reset successfully. Redirecting to sign in...");
      setTimeout(() => router.push("/login"), 1200);
      return;
    }

    setMessage("Unable to reset password right now.");
  }

  return (
    <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-500">Unizik LMS</div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Create a new password</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Enter a secure password to regain access to the portal.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <button type="submit" className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800">
          Update password
        </button>
      </form>

      {message ? <p className="mt-5 text-sm text-slate-600">{message}</p> : null}

      <div className="mt-6 text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-slate-950 hover:text-teal-500">Back to sign in</Link>
      </div>
    </div>
  );
}
