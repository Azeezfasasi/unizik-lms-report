"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const METRICS = [
  ["studentLectureResponse", "Students respond to lectures"],
  ["studentAssignmentResponse", "Students respond to assignments"],
  ["studentQuizResponse", "Students respond to quizzes"],
  ["studentCourseworkResponse", "Students respond to course work"],
  ["weeklySyllabusCovered", "Lecturer's weekly syllabus covered"],
  ["courseMaterialsReleased", "Course materials released"],
  ["examReadiness", "Exam readiness"],
  ["supervisorActiveness", "Supervisor's activeness"],
  ["studentProgression", "Student progression"],
] as const;

type Decision = { status: "PENDING" | "APPROVED" | "REJECTED"; comment: string };
type Decisions = Record<(typeof METRICS)[number][0], Decision>;

const initialDecisions = Object.fromEntries(METRICS.map(([key]) => [key, { status: "PENDING", comment: "" }])) as Decisions;

export function DeanReportActions({ coordinatorReportId }: { coordinatorReportId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role?.toUpperCase();
  const [decisions, setDecisions] = useState<Decisions>(initialDecisions);
  const [overallStatus, setOverallStatus] = useState<Decision["status"]>("PENDING");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!coordinatorReportId || !["ADMIN", "DEAN", "SUB_DEAN"].includes(role ?? "")) return;
    fetch(`/api/reports/dean?coordinatorReportId=${coordinatorReportId}`)
      .then((response) => response.json())
      .then((reports) => {
        const report = reports?.[0];
        if (!report) return;
        setOverallStatus(report.overallStatus ?? "PENDING");
        setDecisions((current) => Object.fromEntries(METRICS.map(([key]) => [key, { status: report[key]?.status ?? current[key].status, comment: report[key]?.comment ?? current[key].comment }])) as Decisions);
      })
      .catch(() => undefined);
  }, [coordinatorReportId, role]);

  if (!["ADMIN", "DEAN", "SUB_DEAN"].includes(role ?? "")) return null;

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/reports/dean", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinatorReportId, decisions, overallStatus }),
    });
    setMessage(response.ok ? "Dean report saved." : (await response.json().catch(() => ({}))).message ?? "Unable to save Dean report.");
    setSaving(false);
    if (response.ok) router.refresh();
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Dean / Sub-Dean report</h3>
        <p className="mt-1 text-sm text-slate-600">Record a separate decision for every HOD or PG Coordinator response.</p>
      </div>
      <div className="mt-4 space-y-3">
        {METRICS.map(([key, label]) => (
          <div key={key} className="grid gap-2 rounded-xl border border-indigo-100 bg-white p-3 sm:grid-cols-[1fr_9rem_1fr] sm:items-center">
            <span className="text-sm font-medium text-slate-800">{label}</span>
            <select value={decisions[key].status} onChange={(event) => setDecisions((current) => ({ ...current, [key]: { ...current[key], status: event.target.value as Decision["status"] } }))} className="rounded-lg border border-slate-300 px-2 py-2 text-sm">
              <option value="PENDING">Pending</option><option value="APPROVED">Approve</option><option value="REJECTED">Reject</option>
            </select>
            <input value={decisions[key].comment} onChange={(event) => setDecisions((current) => ({ ...current, [key]: { ...current[key], comment: event.target.value } }))} placeholder="Comment (optional)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Overall status
          <select value={overallStatus} onChange={(event) => setOverallStatus(event.target.value as Decision["status"])} className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"><option value="PENDING">Pending</option><option value="APPROVED">Approve</option><option value="REJECTED">Reject</option></select>
        </label>
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Dean report"}</button>
      </div>
      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}