'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/components/layout/navLinks";
import { useEffect, useState, type ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { Summary } from "lucide-react";

function normalizeRole(value?: string) {
  return value?.normalize("NFKC").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

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
  const userRole = normalizeRole(session?.user?.role?.toString());
  const userName = session?.user?.name ?? "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  // Optional section groupings — falls back gracefully if a href isn't listed here.
  const sectionMap: Record<string, string> = {
    "/dashboard": "Overview",
    "/": "Overview",
    "/dashboard/faculty-departments": "Academics",
    "/dashboard/curriculum": "Academics",
    "/dashboard/examiner-report": "Reporting",
    "/dashboard/lms-rep-report": "Reporting",
    "/dashboard/lectures-calendar": "Academics",
    "/dashboard/student-reports": "Reporting",
    "/dashboard/reports": "Reporting",
    "/dashboard/students": "Administration",
    "/dashboard/pg-course-report": "Reporting",
    "/dashboard/reports/approvals": "Reporting",
    "/dashboard/users": "Administration",
    "/dashboard/audit-logs": "Administration",
    "/dashboard/settings/profile": "General",
    "/dashboard/supervisor-report": "Reporting",
    "/dashboard/academic-sessions": "Academics",
    "/dashboard/academic-weeks": "Academics",
    "/dashboard/director": "Reporting",
    "/dashboard/weekly-effectiveness-report": "Reporting",
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

  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', open ? 'true' : 'false');
    } catch {
      // ignore write failures
    }
  }, [open]);

  const iconMap: Record<string, ReactNode> = {
    home: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M3 10.5L12 3l9 7.5v8.5a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-8.5Z" />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
        <path d="M9 21V9h6v12" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
        <path d="M6 4v18" />
        <path d="M18 6H6" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
      </svg>
    ),
    clipboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M9 2h6a2 2 0 0 1 2 2v2H7V4a2 2 0 0 1 2-2Z" />
        <path d="M7 6h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M4 19h16" />
        <path d="M8 15v4" />
        <path d="M12 11v8" />
        <path d="M16 7v12" />
      </svg>
    ),
    archive: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M4 7h16" />
        <path d="M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7" />
        <path d="M9 11h6" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M7 20v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
        <path d="M17 8a3 3 0 1 1 3 3" />
      </svg>
    ),
    "user-circle": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
        <path d="M5.5 20.5a8.5 8.5 0 0 1 13 0" />
      </svg>
    ),
    cog: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M12 15.5a3.5 3.5 0 1 0-3.5-3.5 3.5 3.5 0 0 0 3.5 3.5Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
    summary: (
      <Summary className="w-4 h-4" />
    ),
  };

  const visibleLinks = navLinks.filter((link) => {
    const roles = link.roles;
    if (!roles) return true;
    if (!userRole) return false;
    return roles.some((role) => normalizeRole(role) === userRole);
  });

  // Group links by section while preserving original order within each group.
  const grouped = visibleLinks.reduce<Record<string, typeof visibleLinks>>((acc, link) => {
    const section = sectionMap[link.href] ?? "General";
    acc[section] = acc[section] ? [...acc[section], link] : [link];
    return acc;
  }, {});

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-[1px] md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-68 transform flex-col border-r border-slate-800/60 bg-slate-950 transition-transform duration-200 ease-out md:static md:translate-x-0 h-screen ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-teal-400 to-teal-600 text-sm font-semibold text-white shadow-sm">
              U
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-tight text-white">Unizik LMS</p>
              <p className="text-[11px] leading-tight text-slate-500">Postgraduate portal</p>
            </div>
          </div>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Role badge */}
        {userRole ? (
          <div className="px-5 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-[11px] font-medium tracking-wide text-teal-400">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              {userRole.replace("_", " ")}
            </span>
          </div>
        ) : null}

        {/* Nav — scrolls independently so it never collides with the footer */}
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3.5 space-y-5
           scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {Object.entries(grouped).map(([section, links]) => (
            <div key={section}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                {section}
              </p>
              <div className="space-y-0.5">
                {links.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-teal-500/10 text-teal-300"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                      }`}
                    >
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-4 w-0.75 -translate-y-1/2 rounded-r-full bg-teal-400" />
                      ) : null}
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                          isActive ? "bg-teal-500/15 text-teal-300" : "text-slate-500 group-hover:text-slate-200"
                        }`}
                      >
                        {iconMap[link.icon ?? "home"]}
                      </span>
                      <span className="flex-1 truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile footer */}
        <div className="border-t border-slate-800/60 p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-900/60 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-[12px] font-semibold text-teal-300">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-slate-100">{userName}</p>
              <p className="truncate text-[10.5px] text-slate-500">{userRole ?? "Signed out"}</p>
            </div>
            <button
              onClick={() => signOut()}
              aria-label="Sign out"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}