'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "error";

export default function NewFacultyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [dean, setDean] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = status === "submitting";
  const canSubmit = name.trim().length > 0 && code.trim().length > 0 && !isSubmitting;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/faculties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, dean, description }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      router.push("/faculty-departments");
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Unable to create faculty right now. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/faculty-departments"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Back to faculties
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3 sm:mb-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
              <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
              <path d="M9 21V9h6v12" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600">Faculty</p>
            <h2 className="mt-0.5 text-xl font-semibold text-slate-900 sm:text-2xl">Create new faculty</h2>
            <p className="mt-1 text-sm text-slate-500">Add a new faculty to the academic structure.</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
            <div>
              <label htmlFor="faculty-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="faculty-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="Faculty of Sciences"
              />
            </div>
            <div>
              <label htmlFor="faculty-code" className="mb-1.5 block text-sm font-medium text-slate-700">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                id="faculty-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                disabled={isSubmitting}
                required
                maxLength={8}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="FOS"
              />
            </div>
          </div>

          <div>
            <label htmlFor="faculty-dean" className="mb-1.5 block text-sm font-medium text-slate-700">
              Dean
            </label>
            <input
              id="faculty-dean"
              value={dean}
              onChange={(event) => setDean(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="Prof. Ada Okafor"
            />
          </div>

          <div>
            <label htmlFor="faculty-description" className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="faculty-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              className="w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="Describe the faculty."
              rows={4}
            />
          </div>

          {status === "error" ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="mt-0.5 h-4 w-4 shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/faculty-departments"
              className="rounded-full border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create faculty"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}