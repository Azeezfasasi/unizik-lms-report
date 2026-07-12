'use client';

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewReportPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("student-001");
  const [facultyId, setFacultyId] = useState("fac-001");
  const [curriculumId, setCurriculumId] = useState("cur-001");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Saving report...");

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, facultyId, curriculumId, notes, status }),
    });

    if (response.ok) {
      setMessage("Report saved successfully.");
      router.push("/reports");
      router.refresh();
      return;
    }

    setMessage("Unable to create report right now.");
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Reports</p>
        <h2 className="text-2xl font-semibold text-slate-900">Create report</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Student ID</label>
            <input value={studentId} onChange={(event) => setStudentId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Faculty ID</label>
            <input value={facultyId} onChange={(event) => setFacultyId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Curriculum ID</label>
            <input value={curriculumId} onChange={(event) => setCurriculumId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save report</button>
      </form>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
