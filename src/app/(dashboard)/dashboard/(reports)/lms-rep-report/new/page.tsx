"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CourseOption {
  _id: string;
  title: string;
  code: string;
  curriculumId?: string;
}

interface LectureOption {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function NewLmsRepReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [lectures, setLectures] = useState<LectureOption[]>([]);
  const [courseId, setCourseId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState("FIRST");
  const [issues, setIssues] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(() => setCourses([]));
  }, []);

  function handleCourseChange(nextCourseId: string) {
    setCourseId(nextCourseId);
    setLectures([]);

    if (!nextCourseId) {
      setCurriculumId("");
      return;
    }

    const selectedCourse = courses.find((course) => course._id === nextCourseId);
    if (!selectedCourse) return;

    setCurriculumId(selectedCourse.curriculumId ?? "");

    if (selectedCourse.curriculumId) {
      fetch(`/api/lectures-calendar?curriculumId=${selectedCourse.curriculumId}`)
        .then((res) => res.json())
        .then((data) => setLectures(data))
        .catch(() => setLectures([]));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const payload = {
      courseId,
      curriculumId,
      submittedBy: session?.user?.id,
      academicSession,
      semester,
      issues,
    };

    const response = await fetch("/api/reports/lms-rep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const report = await response.json();
      router.push(`/dashboard/lms-rep-report/${report._id}`);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Create</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">New LMS Rep Report</h2>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Course
            <select value={courseId} onChange={(event) => handleCourseChange(event.target.value)} required className="w-full rounded-xl border border-slate-300 px-3 py-2">
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title} ({course.code})</option>
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
            Submitted By
            <input
              value={session?.user?.name ?? "Unknown user"}
              disabled
              className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500"
            />
          </label>

        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">Lecture schedule overview</h3>
          <div className="mt-3 space-y-2">
            {lectures.length === 0 ? (
              <p className="text-sm text-slate-500">Select a course to load its lectures.</p>
            ) : (
              lectures.map((lecture) => (
                <div key={lecture._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="font-medium">{lecture.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{new Date(lecture.startDate).toLocaleDateString()} - {new Date(lecture.endDate).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <label className="mt-6 block space-y-2 text-sm font-medium text-slate-700">
          Issues / remarks
          <textarea value={issues} onChange={(event) => setIssues(event.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
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
