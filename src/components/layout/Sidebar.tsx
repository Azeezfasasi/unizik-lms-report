'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/components/layout/navLinks";
import { useEffect, useState } from "react";
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

  return (
    <>
      {open ? <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform md:static md:translate-x-0 md:flex ${
          open ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-slate-200 bg-slate-950 px-6 py-8 text-slate-100`}
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
                  className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                    <span className="flex-1">{link.label}</span>
                    {linkRoles[link.href] ? (
                      <span className="ml-3 inline-flex items-center rounded-full bg-slate-800/50 px-2 py-1 text-xs font-semibold text-slate-200">
                        {linkRoles[link.href]!.length === 1 ? linkRoles[link.href]![0] : `${linkRoles[link.href]!.length} roles`}
                      </span>
                    ) : null}
                </Link>
              );
            })}
        </nav>
      </aside>
    </>
  );
}
