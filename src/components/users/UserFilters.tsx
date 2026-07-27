"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "FACULTY_OFFICER", label: "Faculty officer" },
  { value: "EXAMINER", label: "Examiner" },
  { value: "STUDENT", label: "Student" },
  { value: "LMS_REP", label: "LMS rep" },
  { value: "PG_COORDINATOR", label: "PG coordinator" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "DIRECTOR", label: "Director" },
];

export function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams({ q: value }), 300);
  }

  const currentRole = searchParams.get("role") ?? "all";
  const hasActiveFilters = Boolean(searchParams.get("q")) || currentRole !== "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      <div className="relative sm:w-56">
        <select
          value={currentRole}
          onChange={(e) => updateParams({ role: e.target.value === "all" ? "" : e.target.value })}
          className="w-full appearance-none rounded-full border border-slate-300 bg-white py-2.5 pl-4 pr-9 text-sm text-slate-900 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
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

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push(pathname);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
