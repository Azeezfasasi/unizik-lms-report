// "use client";

// import React from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";

// function IconPlus() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
//       <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }

// function IconReport() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
//       <path d="M21 15V8a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//       <path d="M7 10h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }

// export default function DashboardHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
//   const pathname = usePathname() || "/dashboard";
//   const parts = pathname === "/" ? ["dashboard"] : pathname.split("/").filter(Boolean);
//   const { data: session } = useSession();

//   return (
//     <header className="sticky top-14 z-20 bg-white/90 backdrop-blur-md">
//       <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
//         <div className="flex items-center gap-4">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">U</div>
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600">Dashboard</p>
//             <h2 className="mt-1 text-lg font-semibold text-slate-900">{title ?? "UNIZIK Postgraduate LMS Reporting Portal"}</h2>
//             {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
//           </div>
//         </div>

//         <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-6">
//           <ol className="flex items-center gap-3 text-sm text-slate-500">
//             <li>
//               <Link href="/dashboard" className="text-slate-400 hover:text-slate-600">Home</Link>
//             </li>
//             {parts.map((p, i) => (
//               <li key={i} className="flex items-center gap-2">
//                 <span className="text-slate-300">/</span>
//                 <Link href={`/${parts.slice(0, i + 1).join("/")}`} className="capitalize text-slate-600 hover:text-slate-800">
//                   {p.replace(/-/g, " ")}
//                 </Link>
//               </li>
//             ))}
//           </ol>
//         </nav>

//         <div className="flex items-center gap-3">
//           <Link href="/curriculum" className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50">
//             <IconPlus />
//             New curriculum
//           </Link>
//           <Link href="/reports" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
//             <IconReport />
//             Review reports
//           </Link>

//           {session ? (
//             <div className="relative">
//               <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="ml-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900">
//                 <div className="relative h-8 w-8 rounded-full border border-slate-200 bg-slate-100 overflow-hidden">
//                   <Image src="/logo.svg" alt="logo" fill className="object-cover" />
//                 </div>
//                 <span className="hidden sm:inline">{session.user?.name ?? 'User'}</span>
//               </button>
//             </div>
//           ) : (
//             <Link href="/login" className="ml-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">Login</Link>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

const centerNav = [
  { href: "#features", label: "Features" },
  { href: "#faculties", label: "Faculties" },
  { href: "#reports", label: "Reports" },
  { href: "#support", label: "Support" },
];

export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const userName = session?.user?.name || "User";

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">U</div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600">Unizik LMS Dashboard</p>
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
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="relative h-8 w-8 rounded-full border border-slate-200 bg-slate-100">
                    <Image
                      src="/logo.svg"
                      alt="UNIZIK logo"
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <span>{userName}</span>
                </button>

                {dropdownOpen ? (
                  <div className="absolute right-0 mt-3 w-48 rounded-3xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/5">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/settings/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="mt-1 block rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-2 w-full rounded-2xl bg-slate-950 px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link href="/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                Login to portal
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              // trigger sidebar toggle via window event for the Sidebar component
              window.dispatchEvent(new CustomEvent('toggleSidebar'));
            }}
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
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Dashboard
                </Link>
                <Link href="/settings/profile" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Login to portal
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
