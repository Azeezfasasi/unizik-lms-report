'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/components/layout/navLinks";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 px-6 py-8 text-slate-100 lg:flex">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">UNIZIK LMS</p>
        <h2 className="mt-2 text-2xl font-semibold">Postgraduate Portal</h2>
        <p className="mt-2 text-sm text-slate-400">Academic reporting, review workflow, and export-ready summaries.</p>
      </div>
      <nav className="space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
