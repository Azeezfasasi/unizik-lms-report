"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AcademicSessionSelect } from "@/components/shared/AcademicSessionSelect";
import { Spinner } from "@/components/ui/Spinner";

interface CurriculumOption {
  _id: string;
  programName: string;
}

interface CourseOption {
  _id: string;
  title: string;
  code: string;
}

interface AcademicWeekOption {
  _id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  label?: string;
}

export default function NewWeeklyEffectivenessReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [curriculumId, setCurriculumId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState("FIRST");
  const [weeks, setWeeks] = useState<AcademicWeekOption[]>([]);
  const [generalComments, setGeneralComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/curriculum")
      .then((res) => res.json())
      .then((data) => setCurriculums(data))
      .catch(() => setCurriculums([]));
  }, []);

  useEffect(() => {
    if (!curriculumId) {
      return;
    }

    fetch(`/api/courses?curriculumId=${curriculumId}`)
      .then((res) => res.json())
      .then((data) => {
        const nextCourses: CourseOption[] = Array.isArray(data)
          ? data.map((course: { _id: string; title: string; code: string }) => ({ _id: course._id, title: course.title, code: course.code }))
          : [];
        setCourses(nextCourses);
        setCourseId((currentCourseId) =>
          currentCourseId && nextCourses.some((course) => course._id === currentCourseId) ? currentCourseId : ""
        );
      })
      .catch(() => {
        setCourses([]);
        setCourseId("");
      });
  }, [curriculumId]);

  useEffect(() => {
    if (!curriculumId || !courseId || !academicSession) {
      return;
    }

    const params = new URLSearchParams({ curriculumId, courseId, academicSession, semester });
    fetch(`/api/academic-weeks?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setWeeks(Array.isArray(data) ? data : []))
      .catch(() => setWeeks([]));
  }, [curriculumId, courseId, academicSession, semester]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!weeks.length) {
      setError("No academic weeks found for this curriculum, course, session, and semester. Add weeks first.");
      return;
    }

    setLoading(true);

    const payload = {
      curriculumId,
      courseId,
      preparedBy: session?.user?.id,
      academicSession,
      semester,
      generalComments,
    };

    const response = await fetch("/api/reports/weekly-effectiveness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (response.ok) {
      const report = await response.json();
      router.push(`/dashboard/weekly-effectiveness-report/${report._id}/edit`);
      return;
    }

    setError("Unable to create the weekly effectiveness report.");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Create</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">New Weekly Effectiveness Report</h2>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Curriculum
            <select
              value={curriculumId}
              onChange={(event) => {
                setCurriculumId(event.target.value);
                setCourseId("");
              }}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="">Select curriculum</option>
              {curriculums.map((curriculum) => (
                <option key={curriculum._id} value={curriculum._id}>{curriculum.programName}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Course
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
              disabled={!courses.length}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title} ({course.code})</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Academic Session
            <AcademicSessionSelect value={academicSession} onChange={setAcademicSession} autoSelectCurrent className="w-full rounded-xl border border-slate-300 px-3 py-2" />
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
          <h3 className="font-semibold text-slate-900">Academic weeks found</h3>
          {weeks.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              No weeks defined yet for this curriculum, course, session, and semester. Go to Academic Weeks to add the PG Coordinator&apos;s weekly calendar first.
            </p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {weeks.map((week) => (
                <li key={week._id}>
                  Week {week.weekNumber}{week.label ? ` — ${week.label}` : ""} ({new Date(week.startDate).toLocaleDateString()} – {new Date(week.endDate).toLocaleDateString()})
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="mt-6 block space-y-2 text-sm font-medium text-slate-700">
          General comments
          <textarea value={generalComments} onChange={(event) => setGeneralComments(event.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Add any additional context for this report." />
        </label>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading || !weeks.length} className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400">
            {loading ? (
              <>
                <Spinner className="h-3.5 w-3.5" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
