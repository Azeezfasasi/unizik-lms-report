"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface AuditLogItem {
  _id: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  category: string;
  status: "SUCCESS" | "FAILURE";
  description: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "AUTH", label: "Authentication" },
  { value: "USER", label: "Users" },
  { value: "STUDENT", label: "Students" },
  { value: "REPORT", label: "Reports" },
  { value: "ACADEMIC_STRUCTURE", label: "Academic structure" },
  { value: "SCHEDULING", label: "Scheduling" },
  { value: "NOTIFICATION", label: "Notifications" },
];

function categoryLabel(value: string) {
  return CATEGORIES.find((item) => item.value === value)?.label ?? value;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    loadLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLogs(nextPage: number) {
    setLoading(true);
    setMessage("");

    const params = new URLSearchParams({ page: String(nextPage), limit: "25" });
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    try {
      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setMessage(result.message || "Unable to load audit logs.");
        setLogs([]);
        return;
      }

      const data = await response.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setPage(data.page ?? 1);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setMessage("Unable to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  function handleApplyFilters(event: React.FormEvent) {
    event.preventDefault();
    loadLogs(1);
  }

  function handleResetFilters() {
    setCategory("");
    setStatus("");
    setSearch("");
    setFrom("");
    setTo("");
    setPage(1);
    setTimeout(() => loadLogs(1), 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Administration</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Audit &amp; activity logs</h2>
          <p className="mt-1 text-sm text-slate-500">
            Every login, failed login, password reset, and record change performed on the portal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadLogs(page)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? <Spinner className="h-3.5 w-3.5" /> : null}
          Refresh
        </button>
      </div>

      <form onSubmit={handleApplyFilters} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-6">
        <label className="space-y-2 text-sm font-medium text-slate-700 lg:col-span-2">
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email, or description"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          From
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          To
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </label>

        <div className="flex items-end gap-2 lg:col-span-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? <Spinner className="h-3.5 w-3.5" /> : null}
            Apply filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>

      {message ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">Activity</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{total} log{total === 1 ? "" : "s"} found</h3>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-4">Time</th>
                <th className="pb-2 pr-4">User</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">IP address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="h-3.5 w-3.5" />
                      Loading logs…
                    </span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-500">No activity found for this filter.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-50 align-top">
                    <td className="py-2.5 pr-4 whitespace-nowrap text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-slate-900">{log.userName || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{log.userEmail}{log.userRole ? ` · ${log.userRole}` : ""}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{categoryLabel(log.category)}</td>
                    <td className="py-2.5 pr-4 text-slate-700">{log.description}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={
                          log.status === "SUCCESS"
                            ? "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700"
                        }
                      >
                        {log.status === "SUCCESS" ? "Success" : "Failure"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-slate-500">{log.ipAddress || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => loadLogs(page - 1)}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={loading || page >= pages}
              onClick={() => loadLogs(page + 1)}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
