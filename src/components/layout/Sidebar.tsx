'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/components/layout/navLinks";
import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const persisted = typeof window !== 'undefined' ? localStorage.getItem('sidebarOpen') : null;
      return persisted === 'true';
    } catch {
      return false;
    }
  });
  const { data: session } = useSession();
  const userRole = session?.user?.role as string | undefined;

  const linkRoles: Record<string, string[] | undefined> = {
    "/users": ["ADMIN"],
    "/faculty-departments": ["ADMIN", "FACULTY_OFFICER"],
    "/curriculum": ["ADMIN", "FACULTY_OFFICER", "EXAMINER"],
    "/examiner-report": ["ADMIN", "EXAMINER"],
    "/student-reports": ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "STUDENT"],
    "/reports": ["ADMIN", "FACULTY_OFFICER"],
    "/students": ["ADMIN", "FACULTY_OFFICER"],
    "/settings": ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "STUDENT"],
  };

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    const onToggle = () => setOpen((v) => !v);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };

    window.addEventListener('openSidebar', onOpen as EventListener);
    window.addEventListener('closeSidebar', onClose as EventListener);
    window.addEventListener('toggleSidebar', onToggle as EventListener);
    window.addEventListener('keydown', onKey as EventListener);

    return () => {
      window.removeEventListener('openSidebar', onOpen as EventListener);
      window.removeEventListener('closeSidebar', onClose as EventListener);
      window.removeEventListener('toggleSidebar', onToggle as EventListener);
      window.removeEventListener('keydown', onKey as EventListener);
    };
  }, []);

  // persist open state
  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', open ? 'true' : 'false');
    } catch {
      // ignore write failures
    }
  }, [open]);

  const iconMap: Record<string, ReactNode> = {
    home: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M3 10.5L12 3l9 7.5v8.5a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-8.5Z" />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
        <path d="M9 21V9h6v12" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
        <path d="M6 4v18" />
        <path d="M18 6H6" />
      </svg>
    ),
    clipboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M9 2h6a2 2 0 0 1 2 2v2H7V4a2 2 0 0 1 2-2Z" />
        <path d="M7 6h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M4 19h16" />
        <path d="M8 15v4" />
        <path d="M12 11v8" />
        <path d="M16 7v12" />
      </svg>
    ),
    archive: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M4 7h16" />
        <path d="M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7" />
        <path d="M9 11h6" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M7 20v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
        <path d="M17 8a3 3 0 1 1 3 3" />
      </svg>
    ),
    "user-circle": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
        <path d="M5.5 20.5a8.5 8.5 0 0 1 13 0" />
      </svg>
    ),
    cog: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M12 15.5a3.5 3.5 0 1 0-3.5-3.5 3.5 3.5 0 0 0 3.5 3.5Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  };

  return (
    <>
      {open ? <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform md:static md:translate-x-0 md:flex ${
          open ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-slate-200 bg-slate-950 px-2 lg:px-3 py-8 text-slate-100`}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">UNIZIK LMS</p>
            <h2 className="mt-2 text-2xl font-semibold">Postgraduate Portal</h2>
            <p className="mt-2 text-sm text-slate-400">Academic reporting, review workflow, and export-ready summaries.</p>
            {userRole ? (
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-teal-600/10 px-2 py-1 text-xs font-semibold text-teal-700">{userRole}</span>
                <span className="text-xs text-slate-400">Signed in</span>
              </div>
            ) : null}
          </div>
          <button className="md:hidden ml-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800" onClick={() => setOpen(false)} aria-label="Close sidebar">✕</button>
        </div>

        <nav className="space-y-2">
          {navLinks
            .filter((link) => {
              const roles = linkRoles[link.href];
              if (!roles) return true;
              if (!userRole) return false;
              return roles.includes(userRole);
            })
            .map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-300">{iconMap[link.icon ?? "home"]}</span>
                  <span className="flex-1">{link.label}</span>
                </Link>
              );
            })}
        </nav>
      </aside>
    </>
  );
}
