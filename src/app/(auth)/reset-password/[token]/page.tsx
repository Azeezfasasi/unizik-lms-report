'use client';

import { useRouter, useParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
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
      body: JSON.stringify({ token: params.token, password }),
    });

    if (response.ok) {
      setMessage("Password reset successfully. Redirecting to sign in...");
      setTimeout(() => router.push("/login"), 1200);
      return;
    }

    setMessage("Unable to reset password right now.");
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Password recovery</p>
      <h1 className="mt-3 text-3xl font-semibold">Create a new password</h1>
      <p className="mt-2 text-sm text-slate-400">Enter a secure password to regain access to the portal.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">New password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white" />
        </div>
        <button type="submit" className="w-full rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950">Update password</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
    </div>
  );
}
