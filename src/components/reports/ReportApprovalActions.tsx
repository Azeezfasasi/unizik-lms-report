'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

interface Props {
  reportId: string;
  status?: string;
  reportType?: "EXAMINER" | "LMS_REP" | "STUDENT";
}

const ACTIONABLE_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"];

export default function ReportApprovalActions({ reportId, status, reportType = "EXAMINER" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusLabel = status?.replace(/_/g, " ") ?? "Unknown";
  const canAct = status ? ACTIONABLE_STATUSES.includes(status) : false;

  const apiBase =
    reportType === "LMS_REP"
      ? "/api/reports/lms-rep"
      : reportType === "STUDENT"
      ? "/api/reports"
      : "/api/examiner-reports";

  async function updateStatus(nextStatus: "APPROVED" | "REJECTED") {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, statusComment: `${nextStatus.toLowerCase()} by admin` }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      router.refresh();
    } catch {
      setError("Unable to update report status right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ReportStatusBadge status={statusLabel} />
        {canAct ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            action required
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateStatus("APPROVED")}
          disabled={!canAct || loading}
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => updateStatus("REJECTED")}
          disabled={!canAct || loading}
          className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
        >
          Reject
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
