'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  userId: string;
}

export default function UserActions({ userId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (response.ok) {
        router.refresh();
      } else {
        setError("Failed to delete.");
        setConfirming(false);
      }
    } catch {
      setError("Unable to delete right now.");
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? (
            <>
              <Spinner className="h-3 w-3" />
              Deleting…
            </>
          ) : (
            "Yes"
          )}
        </button>
        <button
          onClick={() => { setConfirming(false); setError(""); }}
          disabled={deleting}
          className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          No
        </button>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/dashboard/users/${userId}`}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
      >
        Edit
      </Link>
      <button
        onClick={() => setConfirming(true)}
        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
