'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AcademicWeekGate } from "@/components/shared/AcademicWeekGate";
import { AcademicSessionSelect } from "@/components/shared/AcademicSessionSelect";

interface StudentOption {
  _id: string;
  fullName: string;
  matricNumber: string;
  email: string;
  facultyId?: string;
  curriculumId?: string;
}

interface FacultyOption {
  _id: string;
  name: string;
}

interface CurriculumOption {
  _id: string;
  programName: string;
}

interface CourseOption {
  _id: string;
  title: string;
  code: string;
}

const RATINGS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function NewStudentReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role?.toString().toUpperCase().trim();
  const isStudent = userRole === "STUDENT";
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState("FIRST");
  const [weekId, setWeekId] = useState("");
  const selectedStudent = students.find((student) => student._id === studentId);
  const studentDisplayName = isStudent
    ? session?.user?.name ?? selectedStudent?.fullName ?? ""
    : selectedStudent ? `${selectedStudent.fullName} - ${selectedStudent.matricNumber}` : "";
  const [studentMatchCount, setStudentMatchCount] = useState<number>(0);
  const [teachingQuality, setTeachingQuality] = useState(60);
  const [examPreparedness, setExamPreparedness] = useState(60);
  const [courseMaterialsRating, setCourseMaterialsRating] = useState(60);
  const [lectureFeedback, setLectureFeedback] = useState("");
  const [examFeedback, setExamFeedback] = useState("");
  const [instructorFeedback, setInstructorFeedback] = useState("");
  const [lmsPortalFeedback, setLmsPortalFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const studentsUrl = new URL("/api/students", window.location.origin);
        if (session?.user?.role === "STUDENT" && session.user.email) {
          studentsUrl.searchParams.set("email", session.user.email);
        }

        const [studentsRes, facultiesRes, curriculumsRes] = await Promise.all([
          fetch(studentsUrl.toString()),
          fetch("/api/faculties"),
          fetch("/api/curriculum"),
        ]);

        if (!studentsRes.ok || !facultiesRes.ok || !curriculumsRes.ok) {
          setMessage("Failed to load options.");
          return;
        }

        const studentsData = await studentsRes.json();
        const facultiesData = await facultiesRes.json();
        const curriculumsData = await curriculumsRes.json();

        const filteredStudents =
          isStudent && session?.user?.email
            ? (studentsData as StudentOption[]).filter((student) => student.email === session.user.email)
            : (studentsData as StudentOption[]);

        setStudents(filteredStudents);
        setStudentMatchCount(filteredStudents.length);
        setFaculties(facultiesData);
        setCurriculums(curriculumsData);

        const selectedStudent = filteredStudents[0] ?? null;
        setStudentId(selectedStudent?._id ?? "");
        setFacultyId(selectedStudent?.facultyId ?? facultiesData[0]?._id ?? "");
        setCurriculumId(selectedStudent?.curriculumId ?? curriculumsData[0]?._id ?? "");
      } catch {
        setMessage("Failed to load student report options.");
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, [session?.user?.email, session?.user?.role, isStudent]);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      if (!curriculumId) {
        setCourses([]);
        setCourseId("");
        return;
      }

      try {
        const response = await fetch(`/api/courses?curriculumId=${curriculumId}`);
        const data = await response.json();
        if (cancelled) return;
        const list: CourseOption[] = Array.isArray(data) ? data : [];
        setCourses(list);
        setCourseId((current) => (list.some((course) => course._id === current) ? current : list[0]?._id ?? ""));
      } catch {
        if (!cancelled) {
          setCourses([]);
          setCourseId("");
        }
      }
    }

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [curriculumId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!studentId || !facultyId || !curriculumId || !courseId) {
      setMessage("Choose a student, faculty, curriculum, and course before saving.");
      return;
    }

    if (!weekId) {
      setMessage("Select or create an academic week before submitting this report.");
      return;
    }

    setSubmitting(true);
    setMessage("Saving student report...");

    const bodyPayload: Record<string, unknown> = {
      studentId,
      facultyId,
      curriculumId,
      courseId,
      weekId,
      academicSession,
      semester,
      preparedBy: session?.user?.id,
      teachingQuality,
      examPreparedness,
      courseMaterialsRating,
      lectureFeedback,
      examFeedback,
      instructorFeedback,
      lmsPortalFeedback,
      notes,
      status,
      submittedAt: status === "SUBMITTED" ? new Date().toISOString() : undefined,
    };

    if (session?.user?.role === "STUDENT") {
      bodyPayload.studentId = studentId;
      bodyPayload.status = status;
      bodyPayload.submittedAt = status === "SUBMITTED" ? new Date().toISOString() : undefined;
    }

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    });

    const result = await response.json();
    if (response.ok && result._id) {
      router.push(`/dashboard/reports/${result._id}`);
      return;
    }

    setMessage(result.message ?? "Unable to save the student report.");
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Student Reporting</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Create Student Feedback Report</h1>
        <p className="mt-2 text-sm text-slate-500">Capture teaching, exam, course and instructor feedback in one professional report.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Student
            {isStudent ? (
              <input
                value={studentDisplayName || "Loading student..."}
                disabled
                className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700"
              />
            ) : (
              <select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              >
                {students.map((student) => (
                  <option key={student._id} value={student._id}>{student.fullName} — {student.matricNumber}</option>
                ))}
              </select>
            )}
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Faculty
            <select value={facultyId} onChange={(event) => setFacultyId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option value="">Choose a faculty</option>
              {faculties.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>{faculty.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Curriculum
            <select value={curriculumId} onChange={(event) => setCurriculumId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option value="">Choose a Curriculum</option>
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
              disabled={!curriculumId || courses.length === 0}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:cursor-wait disabled:text-slate-400"
            >
              <option value="">Choose a course</option>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.title} ({course.code})</option>
                ))
              ) : (
                <option value="">No courses available</option>
              )}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Academic Session
            <AcademicSessionSelect value={academicSession} onChange={setAcademicSession} autoSelectCurrent className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Semester
            <select value={semester} onChange={(event) => setSemester(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option value="FIRST">First</option>
              <option value="SECOND">Second</option>
            </select>
          </label>
        </div>

        <AcademicWeekGate
          curriculumId={curriculumId}
          courseId={courseId}
          academicSession={academicSession}
          semester={semester}
          weekId={weekId}
          onWeekChange={setWeekId}
        />

        {weekId ? (
        <>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Teaching quality</p>
            <p className="mt-1 text-sm text-slate-500">Rate how well lectures were delivered.</p>
            <select value={teachingQuality} onChange={(event) => setTeachingQuality(Number(event.target.value))} className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm">
              {RATINGS.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Exam preparedness</p>
            <p className="mt-1 text-sm text-slate-500">Rate how prepared the exam was.</p>
            <select value={examPreparedness} onChange={(event) => setExamPreparedness(Number(event.target.value))} className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm">
              {RATINGS.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Course materials</p>
            <p className="mt-1 text-sm text-slate-500">Rate course resources and syllabus coverage.</p>
            <select value={courseMaterialsRating} onChange={(event) => setCourseMaterialsRating(Number(event.target.value))} className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm">
              {RATINGS.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-700 lg:col-span-2">
            Lecture feedback
            <textarea value={lectureFeedback} onChange={(event) => setLectureFeedback(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 lg:col-span-1">
            Exam feedback
            <textarea value={examFeedback} onChange={(event) => setExamFeedback(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Supervisor feedback
            <textarea value={instructorFeedback} onChange={(event) => setInstructorFeedback(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Overall summary
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
        </div>

        <div className="grid gap-4">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            LMS Portal Feedback
            <textarea
              value={lmsPortalFeedback}
              onChange={(event) => setLmsPortalFeedback(event.target.value)}
              rows={4}
              placeholder="Share feedback on the LMS portal experience (usability, access issues, suggestions, etc.)"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr]">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              title={status === "DRAFT" ? "Draft: save your progress without submitting the report." : "Submitted: finalize and submit the report for review."}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="DRAFT" title="Save your progress without submitting the report.">DRAFT - (save your progress without submitting the report.)</option>
              <option value="SUBMITTED" title="Finalize and submit the report for review.">SUBMIT - (finalize and submit the report for review.)</option>
            </select>
          </label>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Prepared by</p>
            <p className="mt-2">{session?.user?.name ?? selectedStudent?.fullName ?? "Loading user..."}</p>
          </div>
        </div>
        </>
        ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            {isStudent && studentMatchCount > 1 ? (
              <p className="mt-2 text-sm font-medium text-amber-700">Multiple student records found for your account. Contact the administrator to resolve duplicates.</p>
            ) : null}
          </div>
          <button type="submit" disabled={loading || submitting || !studentId || !facultyId || !curriculumId || !courseId || !weekId || (isStudent && studentMatchCount !== 1)} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
            {submitting ? "Saving..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
