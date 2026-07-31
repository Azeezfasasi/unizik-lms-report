"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PercentageRating } from "@/components/shared/PercentageRating";
import { AcademicSessionSelect } from "@/components/shared/AcademicSessionSelect";
import { CircleArrowLeft } from "lucide-react";

interface CourseOption {
  _id: string;
  title: string;
  code: string;
  curriculumId?: string;
}

export default function EditLmsRepReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseId, setCourseId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState("FIRST");
  const [portalReadiness, setPortalReadiness] = useState("PARTIALLY_READY");
  const [lecturerTrainingRating, setLecturerTrainingRating] = useState(60);
  const [generalComments, setGeneralComments] = useState("");
  const [issues, setIssues] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesRes, reportRes] = await Promise.all([
          fetch("/api/courses"),
          fetch(`/api/reports/lms-rep/${id}`),
        ]);

        if (!coursesRes.ok || !reportRes.ok) {
          setError("Unable to load report data.");
          return;
        }

        const [coursesData, reportData] = await Promise.all([coursesRes.json(), reportRes.json()]);
        setCourses(coursesData);
        const courseIdValue =
          typeof reportData.courseId === "object" && reportData.courseId !== null && "_id" in reportData.courseId
            ? reportData.courseId._id
            : reportData.courseId;
        setCourseId(courseIdValue);
        setCurriculumId(reportData.curriculumId);
        setAcademicSession(reportData.academicSession);
        setSemester(reportData.semester);
        setPortalReadiness(reportData.portalReadinessForQuizAndExam ?? "PARTIALLY_READY");
        setLecturerTrainingRating(reportData.lecturerTrainingRating ?? 60);
        setGeneralComments(reportData.generalComments ?? "");
        setIssues(reportData.issues ?? "");
      } catch {
        setError("Unable to load report data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/reports/lms-rep/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          curriculumId,
          academicSession,
          semester,
          portalReadinessForQuizAndExam: portalReadiness,
          lecturerTrainingRating,
          generalComments,
          issues,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message || "Unable to update the LMS rep report.");
        return;
      }

      setMessage("Report updated successfully.");
      router.push(`/dashboard/lms-rep-report/${id}`);
    } catch {
      setError("Unable to update the LMS rep report.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading report…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Edit report</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Update LMS Rep Report</h2>
        </div>
        <Link href={`/dashboard/lms-rep-report/${id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600">
          <CircleArrowLeft className="h-4 w-4" />
          Back to report
        </Link>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Course
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" required>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title} ({course.code})</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Academic session
            <AcademicSessionSelect value={academicSession} onChange={setAcademicSession} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Semester
            <select value={semester} onChange={(event) => setSemester(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2">
              <option value="FIRST">First</option>
              <option value="SECOND">Second</option>
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Portal readiness
            <select value={portalReadiness} onChange={(event) => setPortalReadiness(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2">
              <option value="NOT_READY">Not ready</option>
              <option value="PARTIALLY_READY">Partially ready</option>
              <option value="READY">Ready</option>
            </select>
          </label>

          <PercentageRating label="Lecturer training effectiveness" value={lecturerTrainingRating} onChange={setLecturerTrainingRating} />
        </div>

        <label className="block text-sm font-medium text-slate-700">
          General comments
          <textarea value={generalComments} onChange={(event) => setGeneralComments(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Issues
          <textarea value={issues} onChange={(event) => setIssues(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900" />
        </label>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push(`/dashboard/lms-rep-report/${id}`)} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
