"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface Department {
  id: string;
  name: string;
  hod?: string;
}

export function DepartmentSearchList({
  departments,
  facultyId,
}: {
  departments: Department[];
  facultyId: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return departments;
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(normalized) || (dept.hod ?? "").toLowerCase().includes(normalized)
    );
  }, [departments, query]);

  return (
    <div>
      <div className="relative mb-4">
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search departments by name or HOD..."
          className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((department) => (
            <div
              key={department.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-teal-200"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[12px] font-semibold text-slate-600 shadow-sm">
                  {department.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-slate-900">{department.name}</h4>
                  <p className="mt-0.5 truncate text-xs text-slate-500">HOD: {department.hod || "Not assigned"}</p>
                </div>
              </div>
              <Link
                href={`/dashboard/faculty-departments/${facultyId}/departments/${department.id}`}
                className="shrink-0 rounded-full bg-teal-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-teal-700"
              >
                Manage
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">No departments match your search</p>
          <p className="mt-1 text-xs text-slate-400">Try a different name or HOD.</p>
        </div>
      )}
    </div>
  );
}
