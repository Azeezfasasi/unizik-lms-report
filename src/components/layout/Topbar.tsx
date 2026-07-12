"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks } from "@/components/layout/navLinks";

export function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-teal-600">Monitoring Portal</p>
          <h1 className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">University Reporting Workspace</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/settings/profile" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600">
              Profile
            </Link>
            <Link href="/offline" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
              Offline Status
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 lg:hidden"
            aria-label="Open navigation"
          >
            <span className="text-xl font-semibold">☰</span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 sm:hidden">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
