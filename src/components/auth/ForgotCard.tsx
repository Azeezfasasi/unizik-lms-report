// "use client";

// import Link from "next/link";
// import { FormEvent, useState } from "react";

// export default function ForgotCard() {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");

//   async function handleSubmit(event: FormEvent) {
//     event.preventDefault();
//     setMessageTone("info");
//     setMessage("Sending reset link...");

//     try {
//       const response = await fetch("/api/auth/forgot-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       const data = await response.json();

//       if (response.ok) {
//         setMessageTone("success");
//         setMessage(data.message || "Reset instructions sent.");
//         return;
//       }

//       setMessageTone("error");
//       setMessage(data.message || "Unable to issue reset request.");
//     } catch {
//       setMessageTone("error");
//       setMessage("Unable to issue reset request. Please try again.");
//     }
//   }

//   return (
//     <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
//       <div className="mb-6">
//         <div className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-500">Unizik LMS</div>
//         <h2 className="mt-4 text-3xl font-semibold text-slate-950">Reset your password</h2>
//         <p className="mt-3 text-sm leading-6 text-slate-500">We&apos;ll send a reset link to your registered email address.</p>
//       </div>

//       <form className="space-y-4" onSubmit={handleSubmit}>
//         <div>
//           <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
//             placeholder="name@unizik.edu.ng"
//           />
//         </div>

//         <button type="submit" className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800">
//           Send reset link
//         </button>
//       </form>

//       {message ? (
//         <p
//           role="status"
//           aria-live="polite"
//           className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${messageTone === "error"
//             ? "border-rose-200 bg-rose-50 text-rose-700"
//             : messageTone === "success"
//               ? "border-emerald-200 bg-emerald-50 text-emerald-700"
//               : "border-slate-200 bg-slate-50 text-slate-600"}`}
//         >
//           {message}
//         </p>
//       ) : null}

//       <div className="mt-6 text-sm text-slate-600">
//         <Link href="/login" className="font-semibold text-slate-950 hover:text-teal-500">Back to sign in</Link>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

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

export default function ForgotCard() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setSubmitting(true);
    setMessageTone("info");
    setMessage("Sending reset link...");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessageTone("success");
        setMessage(data.message || "Reset instructions sent.");
        setSent(true);
        return;
      }

      setMessageTone("error");
      setMessage(data.message || "Unable to issue reset request.");
    } catch {
      setMessageTone("error");
      setMessage("Unable to issue reset request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-500">Unizik LMS</div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Reset your password</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">We&apos;ll send a reset link to your registered email address.</p>
      </div>

      {sent ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg viewBox="0 0 16 16" fill="none" className="h-6 w-6 text-emerald-600">
              <path d="M2 4.5L8 9L14 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold text-emerald-800">Check your inbox</p>
          <p className="mt-1 text-sm text-emerald-700">
            If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
          >
            Didn&apos;t get it? Send again
          </button>
        </div>
      ) : (
        <>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 ${
                  error
                    ? "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100"
                    : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
                }`}
                placeholder="name@unizik.edu.ng"
                autoComplete="email"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "email-error" : undefined}
              />
              <FieldError id="email-error" message={error} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? (
                <>
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 animate-spin">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.3" />
                    <path d="M14.5 8a6.5 6.5 0 00-6.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          {message && messageTone === "error" ? (
            <p role="status" aria-live="polite" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {message}
            </p>
          ) : null}
        </>
      )}

      <div className="mt-6 flex items-center gap-1.5 text-sm text-slate-600">
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path d="M9.5 3.5L5 8L9.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Link href="/login" className="font-semibold text-slate-950 hover:text-teal-500">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}