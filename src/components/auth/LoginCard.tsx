"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessageTone("info");
    setMessage("Signing you in...");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.ok) {
        setMessageTone("success");
        setMessage("Signed in successfully. Redirecting...");
        // navigate immediately — use callbackUrl or fallback to dashboard
        try {
          await router.push(result?.url ?? "/dashboard");
        } catch {
          window.location.href = result?.url ?? "/dashboard";
        }
        return;
      }

      setMessageTone("error");
      setMessage(result?.error === "CredentialsSignin"
        ? "Invalid email or password."
        : "Unable to sign in. Check your email, password and account status.");
      return;
    } catch {
      setMessageTone("error");
      setMessage("Unable to sign in. Please try again.");
      return;
    }
  }

  return (
    <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-500">Unizik LMS</div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Log in to your account</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Enter your details to access the portal.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            placeholder="name@unizik.edu.ng"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <Link href="/forgot-password" className="hover:text-teal-500">Forgot password?</Link>
        </div>

        <button type="submit" className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800">
          Log in
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
        Don&apos;t have an account? <Link href="/register" className="font-semibold text-slate-950 hover:text-teal-500">Register</Link>
      </div>
    </div>
  );
}
