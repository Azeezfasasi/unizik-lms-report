"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Discussion = {
  _id: string;
  message: string;
  createdAt: string;
  authorId?: { name?: string; role?: string };
};

export function ReportDiscussionPanel({ reportType, reportId }: { reportType: string; reportId: string }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<Discussion[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDiscussion = useCallback(async () => {
    const response = await fetch(`/api/reports/discussions/${reportType}/${reportId}`);
    if (response.ok) setItems(await response.json());
  }, [reportType, reportId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDiscussion(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDiscussion]);

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    const response = await fetch(`/api/reports/discussions/${reportType}/${reportId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Unable to add comment.");
    } else {
      setMessage("");
      await loadDiscussion();
    }
    setLoading(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Report discussion</h3>
        <p className="mt-1 text-sm text-slate-500">Use this thread for review questions, revision instructions, and responses.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => (
          <div key={item._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{item.authorId?.name || "Portal user"}</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.message}</p>
          </div>
        )) : <p className="text-sm text-slate-500">No discussion messages yet.</p>}
      </div>
      {session?.user ? (
        <form onSubmit={submitComment} className="mt-5 space-y-3">
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Add a review comment" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <div className="flex items-center justify-between gap-3">
            {error ? <p className="text-sm text-rose-600">{error}</p> : <span />}
            <button type="submit" disabled={loading || !message.trim()} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}