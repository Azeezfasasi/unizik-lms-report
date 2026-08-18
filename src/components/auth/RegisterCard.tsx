"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";

interface FacultyOption {
  id: string;
  name: string;
}

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

export default function RegisterCard() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [faculty, setFaculty] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");

  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [facultiesError, setFacultiesError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFaculties() {
      setFacultiesLoading(true);
      setFacultiesError(false);
      try {
        const response = await fetch("/api/faculties");
        if (!response.ok) throw new Error("Request failed");
        const data = await response.json();
        if (cancelled) return;

        const options: FacultyOption[] = data.map((item: { _id: string; name: string }) => ({
          id: item._id,
          name: item.name,
        }));
        setFaculties(options);
      } catch {
        if (!cancelled) setFacultiesError(true);
      } finally {
        if (!cancelled) setFacultiesLoading(false);
      }
    }

    loadFaculties();
    return () => {
      cancelled = true;
    };
  }, []);

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!faculty) {
      nextErrors.faculty = "Select your faculty.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password && confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
    setMessage("Creating your account...");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          faculty,
          password,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessageTone("success");
        setMessage(data.message || "Account created. Check your email to activate.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setMessageTone("error");
      setMessage(data.message || "Unable to create account right now.");
    } catch {
      setSubmitting(false);
      setMessageTone("error");
      setMessage("Unable to create account right now. Please try again.");
    }
  }

  return (
    <div className="w-full rounded-4xl border border-slate-200 bg-white p-4 lg:p-8 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-500">Unizik LMS</div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Create an account</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Register to start using the portal.</p>
      </div>

      {facultiesError ? (
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="mt-0.5 h-4 w-4 shrink-0">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          Couldn&apos;t load the faculty list. Try refreshing the page.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Full name</label>
          <input
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setErrors((current) => ({ ...current, fullName: "" }));
            }}
            disabled={submitting}
            className={`w-full rounded-[20px] border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 disabled:text-slate-400 ${
              errors.fullName
                ? "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
            }`}
            placeholder="Full name"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullname-error" : undefined}
          />
          <FieldError id="fullname-error" message={errors.fullName} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((current) => ({ ...current, email: "" }));
            }}
            disabled={submitting}
            className={`w-full rounded-[20px] border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 disabled:text-slate-400 ${
              errors.email
                ? "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
            }`}
            placeholder="E.g. name@unizik.edu.ng"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Faculty</label>
          <div className="relative">
            <select
              value={faculty}
              onChange={(e) => {
                setFaculty(e.target.value);
                setErrors((current) => ({ ...current, faculty: "" }));
              }}
              disabled={submitting || facultiesLoading || faculties.length === 0}
              className={`w-full appearance-none rounded-[20px] border bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:ring-4 disabled:text-slate-400 ${
                errors.faculty
                  ? "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
              }`}
              aria-invalid={Boolean(errors.faculty)}
              aria-describedby={errors.faculty ? "faculty-error" : undefined}
            >
              <option value="">
                {facultiesLoading ? "Loading faculties…" : "Select your faculty"}
              </option>
              {faculties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <FieldError id="faculty-error" message={errors.faculty} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((current) => ({ ...current, password: "" }));
              }}
              disabled={submitting}
              className={`w-full rounded-[20px] border bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:ring-4 disabled:text-slate-400 ${
                errors.password
                  ? "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
              }`}
              placeholder="Create a password"
              autoComplete="new-password"
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

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Confirm password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((current) => ({ ...current, confirmPassword: "" }));
            }}
            disabled={submitting}
            className={`w-full rounded-[20px] border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 disabled:text-slate-400 ${
              errors.confirmPassword
                ? "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
            }`}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          />
          <FieldError id="confirm-password-error" message={errors.confirmPassword} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" />
              Creating your account...
            </>
          ) : (
            "Create account"
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
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-slate-950 hover:text-teal-500">
          Log in
        </Link>
      </div>
    </div>
  );
}