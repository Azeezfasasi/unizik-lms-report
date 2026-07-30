"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PercentageRating } from "@/components/shared/PercentageRating";
import { CircleArrowLeft } from "lucide-react";

interface WeeklyEntry {
  weekId: string | { _id?: string; weekNumber?: number; startDate?: string; endDate?: string; label?: string };
  lecturerEffectivenessRating: number;
  studentEffectivenessRating: number;
  remarks?: string;
}

export default function EditWeeklyEffectivenessReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState("DRAFT");
  const [weeklyEntries, setWeeklyEntries] = useState<WeeklyEntry[]>([]);
  const [generalComments, setGeneralComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/reports/weekly-effectiveness/${id}`);
        if (!response.ok) {
          setError("Unable to load report data.");
          return;
        }

        const data = await response.json();
        setStatus(data.status ?? "DRAFT");
        setWeeklyEntries(Array.isArray(data.weeklyEntries) ? data.weeklyEntries : []);
        setGeneralComments(data.generalComments ?? "");
      } catch {
        setError("Unable to load report data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function getWeekLabel(weekId: WeeklyEntry["weekId"]) {
    if (typeof weekId === "object" && weekId !== null) {
      return `Week ${weekId.weekNumber ?? "?"}${weekId.label ? ` — ${weekId.label}` : ""}`;
    }
    return "Week";
  }

  function updateEntry(index: number, patch: Partial<WeeklyEntry>) {
    setWeeklyEntries((entries) => entries.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/reports/weekly-effectiveness/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyEntries: weeklyEntries.map((entry) => ({
            weekId: typeof entry.weekId === "object" ? entry.weekId?._id : entry.weekId,
            lecturerEffectivenessRating: entry.lecturerEffectivenessRating,
            studentEffectivenessRating: entry.studentEffectivenessRating,
            remarks: entry.remarks ?? "",
          })),
          generalComments,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message || "Unable to update the report.");
        return;
      }

      setMessage("Report updated successfully.");
    } catch {
      setError("Unable to update the report.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitReport() {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/reports/weekly-effectiveness/${id}/submit`, { method: "POST" });
      if (!response.ok) {
        setError("Unable to submit the report.");
        return;
      }

      router.push(`/dashboard/weekly-effectiveness-report/${id}`);
    } catch {
      setError("Unable to submit the report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading report…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Edit report</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Update Weekly Effectiveness Report</h2>
        </div>
        <Link href={`/dashboard/weekly-effectiveness-report/${id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600">
          <CircleArrowLeft className="h-4 w-4" />
          Back to report
        </Link>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {weeklyEntries.length === 0 ? (
            <p className="text-sm text-slate-500">No academic weeks are linked to this report.</p>
          ) : (
            weeklyEntries.map((entry, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{getWeekLabel(entry.weekId)}</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <PercentageRating
                    label="Lecturer effectiveness"
                    value={entry.lecturerEffectivenessRating}
                    onChange={(value) => updateEntry(index, { lecturerEffectivenessRating: value })}
                  />
                  <PercentageRating
                    label="Student effectiveness"
                    value={entry.studentEffectivenessRating}
                    onChange={(value) => updateEntry(index, { studentEffectivenessRating: value })}
                  />
                </div>
                <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
                  Remarks
                  <textarea
                    value={entry.remarks ?? ""}
                    onChange={(event) => updateEntry(index, { remarks: event.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Notes on lecturer delivery or student participation for this week."
                  />
                </label>
              </div>
            ))
          )}
        </div>

        <label className="block text-sm font-medium text-slate-700">
          General comments
          <textarea value={generalComments} onChange={(event) => setGeneralComments(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900" />
        </label>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => router.push(`/dashboard/weekly-effectiveness-report/${id}`)} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
          {status !== "SUBMITTED" ? (
            <button
              type="button"
              onClick={handleSubmitReport}
              disabled={submitting}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
