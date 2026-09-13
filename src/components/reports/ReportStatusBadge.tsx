const TONE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING: "bg-violet-100 text-violet-700",
  SUBMITTED: "bg-sky-100 text-sky-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  REVISION_REQUESTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function ReportStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
