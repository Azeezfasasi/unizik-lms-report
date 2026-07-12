"use client";

import Link from "next/link";
import { useState } from "react";

const centerNav = [
  { href: "#features", label: "Features" },
  { href: "#faculties", label: "Faculties" },
  { href: "#reports", label: "Reports" },
  { href: "#support", label: "Support" },
];

export function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">U</div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600">Unizik LMS</p>
          </div>
        </Link>

        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-8">
          {centerNav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-slate-700 hover:text-slate-900">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex md:items-center md:gap-3">
            <Link href="/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Login to portal
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition md:hidden"
            aria-label="Open navigation"
          >
            <span className="text-xl font-semibold">☰</span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-2">
            {centerNav.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                {link.label}
              </a>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Login to portal
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
