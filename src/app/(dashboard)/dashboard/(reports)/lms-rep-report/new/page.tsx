"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PercentageRating } from "@/components/shared/PercentageRating";
import { AcademicWeekGate } from "@/components/shared/AcademicWeekGate";
import { AcademicSessionSelect } from "@/components/shared/AcademicSessionSelect";
import { Spinner } from "@/components/ui/Spinner";

interface FacultyOption {
  _id: string;
  name: string;
}

interface DepartmentOption {
  _id: string;
  name: string;
  facultyId: string;
}

interface CurriculumOption {
  _id: string;
  programName: string;
  departmentId: string;
}

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
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [lectures, setLectures] = useState<LectureOption[]>([]);
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState("FIRST");
  const [weekId, setWeekId] = useState("");
  const [portalReadiness, setPortalReadiness] = useState("PARTIALLY_READY");
  const [lecturerTrainingRating, setLecturerTrainingRating] = useState(60);
  const [generalComments, setGeneralComments] = useState("");
  const [issues, setIssues] = useState("");
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [facultiesResponse, departmentsResponse, curriculumsResponse, coursesResponse] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/departments"),
          fetch("/api/curriculum"),
          fetch("/api/courses"),
        ]);

        if (!facultiesResponse.ok || !departmentsResponse.ok || !curriculumsResponse.ok || !coursesResponse.ok) {
          return;
        }

        const facultiesData = await facultiesResponse.json();
        const departmentsData = await departmentsResponse.json();
        const curriculumsData = await curriculumsResponse.json();
        const coursesData = await coursesResponse.json();

        setFaculties(facultiesData);
        setDepartments(departmentsData);
        setCurriculums(curriculumsData);
        setCourses(coursesData);
      } catch {
        setFaculties([]);
        setDepartments([]);
        setCurriculums([]);
        setCourses([]);
      } finally {
        setOptionsLoading(false);
      }
    }

    loadOptions();
  }, []);

  const filteredDepartments = useMemo(
    () => departments.filter((department) => department.facultyId === facultyId),
    [departments, facultyId]
  );

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const curriculum = curriculums.find((item) => item._id === course.curriculumId);
        return curriculum?.departmentId === departmentId;
      }),
    [courses, curriculums, departmentId]
  );

  function handleFacultyChange(nextFacultyId: string) {
    setFacultyId(nextFacultyId);
    setDepartmentId("");
    setCourseId("");
    setCurriculumId("");
  }

  function handleDepartmentChange(nextDepartmentId: string) {
    setDepartmentId(nextDepartmentId);
    setCourseId("");
    setCurriculumId("");
  }

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
    setMessage("");

    if (!weekId) {
      setMessage("Select or create an academic week before submitting this report.");
      return;
    }

    setLoading(true);

    const payload = {
      courseId,
      curriculumId,
      weekId,
      submittedBy: session?.user?.id,
      academicSession,
      semester,
      portalReadinessForQuizAndExam: portalReadiness,
      lecturerTrainingRating,
      generalComments,
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
      return;
    }

    const result = await response.json().catch(() => ({}));
    setMessage(result.message || "Unable to save the LMS rep report.");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Create</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">New LMS Rep Report</h2>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Faculty
            <select
              value={facultyId}
              onChange={(event) => handleFacultyChange(event.target.value)}
              required
              disabled={optionsLoading}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="">Select faculty</option>
              {faculties.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Department
            <select
              value={departmentId}
              onChange={(event) => handleDepartmentChange(event.target.value)}
              required
              disabled={!facultyId || optionsLoading}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="">Select department</option>
              {filteredDepartments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Course
            <select
              value={courseId}
              onChange={(event) => handleCourseChange(event.target.value)}
              required
              disabled={!departmentId || optionsLoading}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="">Select course</option>
              {filteredCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} ({course.code})
                </option>
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
            Submitted By
            <input
              value={session?.user?.name ?? "Unknown user"}
              disabled
              className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500"
            />
          </label>
        </div>

        <div className="mt-6">
          <AcademicWeekGate
            curriculumId={curriculumId}
            courseId={courseId}
            academicSession={academicSession}
            semester={semester}
            weekId={weekId}
            onWeekChange={setWeekId}
          />
        </div>

        {weekId ? (
          <>
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

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Portal readiness for quizzes & exams
                <select value={portalReadiness} onChange={(event) => setPortalReadiness(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2">
                  <option value="NOT_READY">Not ready</option>
                  <option value="PARTIALLY_READY">Partially ready</option>
                  <option value="READY">Ready</option>
                </select>
              </label>
              <PercentageRating label="Lecturer training effectiveness" value={lecturerTrainingRating} onChange={setLecturerTrainingRating} />
            </div>

            <label className="mt-6 block space-y-2 text-sm font-medium text-slate-700">
              General comments
              <textarea value={generalComments} onChange={(event) => setGeneralComments(event.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Use this field to summarize readiness and training notes." />
            </label>

            <label className="mt-6 block space-y-2 text-sm font-medium text-slate-700">
              Issues / remarks
              <textarea value={issues} onChange={(event) => setIssues(event.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
          </>
        ) : null}

        {message ? <p className="mt-6 text-sm text-rose-600">{message}</p> : null}

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading || !weekId} className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? (
              <>
                <Spinner className="h-3.5 w-3.5" />
                Submitting...
              </>
            ) : (
              "Submit report"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
