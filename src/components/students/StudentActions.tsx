"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import { Spinner } from "@/components/ui/Spinner";

interface StudentActionsProps {
  studentId: string;
  initialStatus?: string;
  redirectTo?: string;
}

export default function StudentActions({ studentId, initialStatus, redirectTo }: StudentActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus ?? "ACTIVE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isActive = status === "ACTIVE";
  const isSuspended = status === "SUSPENDED";
  const actionLabel = isActive ? "Suspend" : isSuspended ? "Activate" : "Update status";
  const nextStatus = isActive ? "SUSPENDED" : "ACTIVE";

  async function handleToggleStatus() {
    if (!isActive && !isSuspended) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setStatus(nextStatus);
      router.refresh();
    } catch {
      setError(`Unable to ${actionLabel.toLowerCase()} student right now.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleToggleStatus}
        disabled={saving || !isActive && !isSuspended}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <>
            <Spinner className="h-3.5 w-3.5" />
            {actionLabel}...
          </>
        ) : (
          actionLabel
        )}
      </button>
      <DeleteResourceButton
        deleteUrl={`/api/students/${studentId}`}
        resourceName="student"
        redirectTo={redirectTo}
      />
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
