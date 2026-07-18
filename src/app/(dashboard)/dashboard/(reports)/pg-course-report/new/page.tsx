"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CurriculumOption {
  _id: string;
  programName: string;
}

interface CoordinatorSummary {
  totalStudents: number;
  totalCourses: number;
  lectureComplianceRate: number;
  examinerReportsSummary: {
    submitted: number;
    approved: number;
    pending: number;
  };
}

export default function NewCoordinatorReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [curriculumId, setCurriculumId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState("FIRST");
  const [recommendations, setRecommendations] = useState("");
  const [examTimetableStatus, setExamTimetableStatus] = useState("Pending release");
  const [summary, setSummary] = useState<CoordinatorSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/curriculum")
      .then((res) => res.json())
      .then((data) => setCurriculums(data))
      .catch(() => setCurriculums([]));
  }, []);

  useEffect(() => {
    if (!curriculumId || !academicSession) return;

    fetch(`/api/reports/coordinator/summary?curriculumId=${curriculumId}&academicSession=${academicSession}`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));
  }, [curriculumId, academicSession]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const payload = {
      curriculumId,
      preparedBy: session?.user?.id,
      academicSession,
      semester,
      totalStudents: summary?.totalStudents ?? 0,
      totalCourses: summary?.totalCourses ?? 0,
      lectureComplianceRate: summary?.lectureComplianceRate ?? 0,
      examinerReportsSummary: summary?.examinerReportsSummary ?? { submitted: 0, approved: 0, pending: 0 },
      examTimetableStatus,
      recommendations,
    };

    const response = await fetch("/api/reports/coordinator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) {
      const report = await response.json();
      router.push(`/dashboard/pg-course-report/${report._id}`);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Create</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">New PG Coordinator Report</h2>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Curriculum
            <select value={curriculumId} onChange={(event) => setCurriculumId(event.target.value)} required className="w-full rounded-xl border border-slate-300 px-3 py-2">
              <option value="">Select curriculum</option>
              {curriculums.map((curriculum) => (
                <option key={curriculum._id} value={curriculum._id}>{curriculum.programName}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Academic Session
            <input value={academicSession} onChange={(event) => setAcademicSession(event.target.value)} required className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="2025/2026" />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Semester
            <select value={semester} onChange={(event) => setSemester(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2">
              <option value="FIRST">First</option>
              <option value="SECOND">Second</option>
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Prepared By
            <input
              value={session?.user?.name ?? "Loading user..."}
              disabled
              className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500"
            />
          </label>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
          <h3 className="font-semibold text-slate-900">Auto-generated summary</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>Total Students: {summary?.totalStudents ?? 0}</div>
            <div>Total Courses: {summary?.totalCourses ?? 0}</div>
            <div>Compliance Rate: {summary?.lectureComplianceRate ?? 0}%</div>
            <div>Examiner Reports Pending: {summary?.examinerReportsSummary?.pending ?? 0}</div>
          </div>
        </div>

        <label className="mt-6 block space-y-2 text-sm font-medium text-slate-700">
          Exam Timetable Status
          <input value={examTimetableStatus} onChange={(event) => setExamTimetableStatus(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        </label>

        <label className="mt-6 block space-y-2 text-sm font-medium text-slate-700">
          Recommendations
          <textarea value={recommendations} onChange={(event) => setRecommendations(event.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        </label>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            {loading ? "Creating..." : "Create report"}
          </button>
        </div>
      </form>
    </div>
  );
}
