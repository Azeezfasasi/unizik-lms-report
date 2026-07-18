"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

const centerNav = [
  { href: "#features", label: "Features" },
  { href: "#faculties", label: "Faculties" },
  { href: "#reports", label: "Reports" },
  { href: "#support", label: "Support" },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

export function Topbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function toggleMobileMenu() {
    setOpen((current) => !current);
    // Also notify any separate Sidebar component that listens for this.
    window.dispatchEvent(new CustomEvent("toggleSidebar"));
  }

  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-white/95 backdrop-blur-md transition-colors data-[scrolled=true]:border-slate-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-semibold text-slate-900">
            <Image src="/images/unizik.png" alt="Unizik Logo" width={56} height={56} className="object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600">Unizik LMS Portal</p>
          </div>
        </Link>

        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-8">
          {centerNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-700 transition hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex md:items-center md:gap-3">
            {status === "loading" ? (
              <div className="h-10 w-28 animate-pulse rounded-full bg-slate-100" />
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((current) => !current)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {userImage && !imageError ? (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      <Image
                        src={userImage}
                        alt=""
                        fill
                        className="rounded-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                      {initials(userName)}
                    </span>
                  )}
                  <span className="max-w-40 truncate">{userName}</span>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {dropdownOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-48 rounded-3xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/5"
                  >
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="block rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/settings/profile"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="mt-1 block rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      Profile
                    </Link>
                    <div className="my-2 h-px bg-slate-100" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full rounded-2xl bg-slate-950 px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
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

          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path
                d={open ? "M5 5L15 15M15 5L5 15" : "M4 6H16M4 10H16M4 14H16"}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            {centerNav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="my-3 h-px bg-slate-100" />

          {status === "loading" ? (
            <div className="h-11 w-full animate-pulse rounded-2xl bg-slate-100" />
          ) : isAuthenticated ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-2">
                {userImage && !imageError ? (
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    <Image src={userImage} alt="" fill className="rounded-full object-cover" onError={() => setImageError(true)} />
                  </div>
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                    {initials(userName)}
                  </span>
                )}
                <span className="truncate text-sm font-semibold text-slate-900">{userName}</span>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                href="/settings/profile"
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Login to portal
            </Link>
          )}
        </div>
      ) : null}
    </header>
  );
}