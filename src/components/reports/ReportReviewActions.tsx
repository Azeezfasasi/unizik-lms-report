"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReportReviewActions({ reportType, reportId, status }: { reportType: string; reportId: string; status: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;
  const canReview = role === "ADMIN" || role === "DEAN" || role === "SUB_DEAN";
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!canReview || !["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"].includes(status)) return null;

  async function updateStatus(nextStatus: string) {
    if (["REJECTED", "REVISION_REQUESTED"].includes(nextStatus) && !comment.trim()) {
      setError("Add a comment before returning this report.");
      return;
    }
    setSaving(true);
    setError("");
    const response = await fetch(`/api/reports/review/${reportType}/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, comment }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Unable to update report status.");
    } else {
      setComment("");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h3 className="text-base font-semibold text-slate-900">Faculty review</h3>
      <p className="mt-1 text-sm text-slate-600">Dean and Sub-Dean accounts can approve or return this report.</p>
      <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} placeholder="Required for rejection or revision request" className="mt-4 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm" />
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => updateStatus("UNDER_REVIEW")} disabled={saving} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Start review</button>
        <button type="button" onClick={() => updateStatus("APPROVED")} disabled={saving} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button>
        <button type="button" onClick={() => updateStatus("REVISION_REQUESTED")} disabled={saving} className="rounded-full border border-amber-400 bg-white px-4 py-2 text-sm font-semibold text-amber-800 disabled:opacity-50">Request revision</button>
        <button type="button" onClick={() => updateStatus("REJECTED")} disabled={saving} className="rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">Reject</button>
      </div>
    </section>
  );
}