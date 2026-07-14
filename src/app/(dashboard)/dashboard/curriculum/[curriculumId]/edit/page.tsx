'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState } from "react";

type LoadStatus = "loading" | "loaded" | "load-error";
type SaveStatus = "idle" | "submitting" | "error";

export default function EditCurriculumPage({ params }: { params: Promise<{ curriculumId: string }> }) {
  const { curriculumId } = use(params);
  const router = useRouter();
  const [programName, setProgramName] = useState("");
  const [level, setLevel] = useState("");
  const [version, setVersion] = useState("");
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = saveStatus === "submitting";
  const canSubmit = programName.trim().length > 0 && level.trim().length > 0 && !isSubmitting;

  useEffect(() => {
    let cancelled = false;

    async function loadCurriculum() {
      setLoadStatus("loading");
      try {
        const response = await fetch(`/api/curriculum/${curriculumId}`);
        if (!response.ok) throw new Error("Request failed");
        const data = await response.json();
        if (cancelled) return;

        setProgramName(data.programName ?? "");
        setLevel(data.level ?? "");
        setVersion(data.version ?? "");
        setLoadStatus("loaded");
      } catch {
        if (!cancelled) setLoadStatus("load-error");
      }
    }

    loadCurriculum();
    return () => {
      cancelled = true;
    };
  }, [curriculumId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSaveStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/curriculum/${curriculumId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programName, level, version }),
      });

      if (!response.ok) throw new Error("Request failed");

      router.push(`/curriculum/${curriculumId}`);
      router.refresh();
    } catch {
      setSaveStatus("error");
      setErrorMessage("Unable to update curriculum right now. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/dashboard/curriculum/${curriculumId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Back to curriculum
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3 sm:mb-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-teal-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
              <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
              <path d="M6 4v18" />
              <path d="M18 6H6" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600">Curriculum</p>
            <h2 className="mt-0.5 text-xl font-semibold text-slate-900 sm:text-2xl">Edit curriculum</h2>
            <p className="mt-1 text-sm text-slate-500">Update the program details below.</p>
          </div>
        </div>

        {loadStatus === "loading" ? (
          <div className="space-y-5">
            <div className="h-11.5 animate-pulse rounded-xl bg-slate-100" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="h-11.5 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-11.5 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="h-11.5 w-40 animate-pulse rounded-full bg-slate-100" />
          </div>
        ) : loadStatus === "load-error" ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="mt-0.5 h-4 w-4 shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              Unable to load this curriculum. It may have been removed, or there was a connection issue.
            </div>
            <Link
              href={`/dashboard/curriculum/${curriculumId}`}
              className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              Return to curriculum
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="program-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Program name <span className="text-red-500">*</span>
              </label>
              <input
                id="program-name"
                value={programName}
                onChange={(event) => setProgramName(event.target.value)}
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="M.Sc Computer Science"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="level" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Level <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="level"
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="" disabled>
                      Select level
                    </option>
                    <option value="PGD">PGD</option>
                    <option value="MSc">MSc</option>
                    <option value="PhD">PhD</option>
                  </select>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
              <div>
                <label htmlFor="version" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Version
                </label>
                <input
                  id="version"
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="1.0"
                />
              </div>
            </div>

            {saveStatus === "error" ? (
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
                href={`/dashboard/curriculum/${curriculumId}`}
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
                    Updating...
                  </>
                ) : (
                  "Update curriculum"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}