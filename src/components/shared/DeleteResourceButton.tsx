'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  deleteUrl: string;
  resourceName: string;
  redirectTo?: string;
}

export default function DeleteResourceButton({ deleteUrl, resourceName, redirectTo }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(deleteUrl, { method: "DELETE" });
      if (response.ok) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
        return;
      }

      setError(`Failed to delete ${resourceName}.`);
      setConfirming(false);
    } catch {
      setError(`Unable to delete ${resourceName} right now.`);
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50 cursor-pointer"
      >
        Delete
      </button>
    );
  }

  return (
    <Modal
      open={confirming}
      onClose={() => {
        setConfirming(false);
        setError("");
      }}
      title={`Delete ${resourceName}?`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Delete this {resourceName}?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 cursor-pointer"
        >
          {deleting ? (
            <>
              <Spinner className="h-3.5 w-3.5" />
              Deleting…
            </>
          ) : (
            "Yes, delete"
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setError("");
          }}
          disabled={deleting}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
        >
          Cancel
        </button>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>
    </Modal>
  );
}
