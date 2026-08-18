"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.8" fill="currentColor" />
      </svg>
      {message}
    </p>
  );
}

export default function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessageTone("error");
      setMessage("Please fix the highlighted fields before continuing.");
      return;
    }

    setSubmitting(true);
    setMessageTone("info");
    setMessage("Signing you in...");

    try {
      const callbackUrl = `${window.location.origin}/dashboard`;
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        setMessageTone("success");
        setMessage("Signed in successfully. Redirecting...");
        const destination = result?.url ?? callbackUrl;
        await router.push(destination);
        if (window.location.pathname !== new URL(destination).pathname) {
          window.location.href = destination;
        }
        return;
      }

      setSubmitting(false);
      setMessageTone("error");
      setMessage(
        result?.error === "CredentialsSignin"
          ? "Invalid email or password."
          : "Unable to sign in. Check your email, password and account status."
      );
      return;
    } catch {
      setSubmitting(false);
      setMessageTone("error");
      setMessage("Unable to sign in. Please try again.");
      return;
    }
  }

  return (
    <div className="w-full rounded-4xl border border-slate-200 bg-white p-4 lg:p-8 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">U</div>
        <div className="mt-4 text-sm font-semibold uppercase tracking-[0.35em] text-teal-500">Unizik LMS</div>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">Log in to your account</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Enter your details to access the portal.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((current) => ({ ...current, email: "" }));
            }}
            className={`w-full rounded-[20px] border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 ${
              errors.email
                ? "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
            }`}
            placeholder="name@unizik.edu.ng"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-600">Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-slate-500 hover:text-teal-500">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((current) => ({ ...current, password: "" }));
              }}
              className={`w-full rounded-[20px] border bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:ring-4 ${
                errors.password
                  ? "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path
                    d="M2 2L14 14M6.6 6.7a2 2 0 002.7 2.7M4 4.3C2.5 5.3 1.5 6.6 1 8c1.2 3 4 5 7 5 1.1 0 2.1-.3 3-.7M9.5 3.2C10 3.1 10.5 3 11 3c3 0 5.8 2 7 5-.4 1-1 1.9-1.7 2.7"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path
                    d="M1 8c1.2-3 4-5 7-5s5.8 2 7 5c-1.2 3-4 5-7 5s-5.8-2-7-5z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              )}
            </button>
          </div>
          <FieldError id="password-error" message={errors.password} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" />
              Signing you in...
            </>
          ) : (
            "Log in"
          )}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            messageTone === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : messageTone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-6 text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-slate-950 hover:text-teal-500">
          Register
        </Link>
      </div>
    </div>
  );
}