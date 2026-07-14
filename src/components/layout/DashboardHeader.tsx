// import Image from "next/image";
// import Link from "next/link";
// import { useState } from "react";
// import { signOut, useSession } from "next-auth/react";

// const centerNav = [
//   { href: "#features", label: "Features" },
//   { href: "#reports", label: "Reports" },
// ];

// export function DashboardHeader() {
//   const [open, setOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const { data: session, status } = useSession();
//   const isAuthenticated = status === "authenticated";

//   const userName = session?.user?.name || "User";

//   return (
//     <header className="sticky top-0 z-50 bg-blue-100/95 backdrop-blur-md">
//       <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
//         <Link href="/" className="flex items-center gap-4">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">U</div>
//           <div className="hidden sm:block">
//             <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600">Unizik LMS Dashboard</p>
//           </div>
//         </Link>

//         <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-8">
//           {centerNav.map((item) => (
//             <a key={item.href} href={item.href} className="text-sm font-medium text-slate-700 hover:text-slate-900">
//               {item.label}
//             </a>
//           ))}
//         </nav>

//         <div className="flex items-center gap-3">
//           <div className="hidden md:flex md:items-center md:gap-3">
//             {isAuthenticated ? (
//               <div className="relative">
//                 <button
//                   type="button"
//                   onClick={() => setDropdownOpen(!dropdownOpen)}
//                   className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
//                 >
//                   <div className="relative h-8 w-8 rounded-full border border-slate-200 bg-slate-100">
//                     <Image
//                       src="/logo.svg"
//                       alt="UNIZIK logo"
//                       fill
//                       className="rounded-full"
//                     />
//                   </div>
//                   <span>{userName}</span>
//                 </button>

//                 {dropdownOpen ? (
//                   <div className="absolute right-0 mt-3 w-48 rounded-3xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/5">
//                     <Link
//                       href="/dashboard"
//                       onClick={() => setDropdownOpen(false)}
//                       className="block rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
//                     >
//                       Dashboard
//                     </Link>
//                     <Link
//                       href="/settings/profile"
//                       onClick={() => setDropdownOpen(false)}
//                       className="mt-1 block rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
//                     >
//                       Profile
//                     </Link>
//                     <button
//                       type="button"
//                       onClick={() => signOut({ callbackUrl: "/" })}
//                       className="mt-2 w-full rounded-2xl bg-slate-950 px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-slate-800"
//                     >
//                       Log out
//                     </button>
//                   </div>
//                 ) : null}
//               </div>
//             ) : (
//               <Link href="/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
//                 Login to portal
//               </Link>
//             )}
//           </div>
//           <button
//             type="button"
//             onClick={() => {
//               // trigger sidebar toggle via window event for the Sidebar component
//               window.dispatchEvent(new CustomEvent('toggleSidebar'));
//             }}
//             className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition md:hidden"
//             aria-label="Open navigation"
//           >
//             <span className="text-xl font-semibold">☰</span>
//           </button>
//         </div>
//       </div>

//       {open ? (
//         <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
//           <div className="space-y-2">
//             {centerNav.map((link) => (
//               <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
//                 {link.label}
//               </a>
//             ))}
//             {isAuthenticated ? (
//               <>
//                 <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
//                   Dashboard
//                 </Link>
//                 <Link href="/settings/profile" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
//                   Profile
//                 </Link>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setOpen(false);
//                     signOut({ callbackUrl: "/" });
//                   }}
//                   className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
//                 >
//                   Log out
//                 </button>
//               </>
//             ) : (
//               <Link href="/login" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
//                 Login to portal
//               </Link>
//             )}
//           </div>
//         </div>
//       ) : null}
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

const centerNav = [
  { href: "#features", label: "Features" },
  { href: "#reports", label: "Reports" },
];

export function DashboardHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  // Close the account dropdown on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-teal-400 to-teal-600 text-sm font-semibold text-white shadow-sm">
            U
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-900">Unizik LMS</p>
            <p className="text-[11px] font-medium leading-tight text-slate-500">Postgraduate portal</p>
          </div>
        </Link>

        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-8">
          {centerNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/10 text-[12px] font-semibold text-teal-700">
                    {userInitial}
                  </span>
                  <span className="max-w-30 truncate">{userName}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {dropdownOpen ? (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5">
                    <div className="mb-1 border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-[13px] font-semibold text-slate-900">{userName}</p>
                      <p className="truncate text-[11px] text-slate-500">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-700 transition hover:bg-slate-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4 text-slate-400">
                        <path d="M3 10.5L12 3l9 7.5v8.5a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-8.5Z" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link
                      href="/settings/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-700 transition hover:bg-slate-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4 text-slate-400">
                        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
                        <path d="M5.5 20.5a8.5 8.5 0 0 1 13 0" />
                      </svg>
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-slate-100 px-3 py-2 pt-2.5 text-left text-[13px] font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Login to portal
              </Link>
            )}
          </div>

          {/* Mobile: opens the persistent Sidebar drawer for all app navigation */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 md:hidden"
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {/* Mobile: quick access to the marketing anchors, kept separate from the Sidebar */}
          {centerNav.length > 0 ? (
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 sm:hidden"
              aria-label="Toggle page links"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
                <path d={mobileNavOpen ? "M6 6l12 12M18 6L6 18" : "M12 5v14M5 12h14"} />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
          <div className="space-y-1">
            {centerNav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
            {!isAuthenticated ? (
              <Link
                href="/login"
                onClick={() => setMobileNavOpen(false)}
                className="mt-1 block rounded-lg bg-slate-900 px-3 py-2.5 text-center text-[13px] font-semibold text-white"
              >
                Login to portal
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}