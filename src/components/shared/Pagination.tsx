"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  return (
    <nav className="flex items-center justify-between border-t border-slate-100 pt-4" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
          currentPage === 1
            ? "pointer-events-none border-slate-100 text-slate-300"
            : "border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </Link>

      <div className="hidden items-center gap-1 sm:flex">
        {visiblePages.map((page, i) => {
          const prevPage = visiblePages[i - 1];
          const showEllipsis = Boolean(prevPage) && page - prevPage > 1;
          return (
            <span key={page} className="flex items-center gap-1">
              {showEllipsis ? <span className="px-1.5 text-sm text-slate-400">…</span> : null}
              <Link
                href={hrefFor(page)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                  page === currentPage ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </Link>
            </span>
          );
        })}
      </div>

      <span className="text-sm text-slate-500 sm:hidden">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={hrefFor(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
          currentPage === totalPages
            ? "pointer-events-none border-slate-100 text-slate-300"
            : "border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600"
        }`}
      >
        <span className="hidden sm:inline">Next</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
    </nav>
  );
}
