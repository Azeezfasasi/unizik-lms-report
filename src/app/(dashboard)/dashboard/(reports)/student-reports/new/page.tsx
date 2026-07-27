'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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

const RATINGS = [1, 2, 3, 4, 5];

export default function NewStudentReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role?.toString().toUpperCase().trim();
  const isStudent = userRole === "STUDENT";
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const selectedStudent = students.find((student) => student._id === studentId);
  const studentDisplayName = isStudent
    ? session?.user?.name ?? selectedStudent?.fullName ?? ""
    : selectedStudent ? `${selectedStudent.fullName} - ${selectedStudent.matricNumber}` : "";
  const [studentMatchCount, setStudentMatchCount] = useState<number>(0);
  const [teachingQuality, setTeachingQuality] = useState(3);
  const [examPreparedness, setExamPreparedness] = useState(3);
  const [courseMaterialsRating, setCourseMaterialsRating] = useState(3);
  const [lectureFeedback, setLectureFeedback] = useState("");
  const [examFeedback, setExamFeedback] = useState("");
  const [instructorFeedback, setInstructorFeedback] = useState("");
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!studentId || !facultyId || !curriculumId) {
      setMessage("Choose a student, faculty, and curriculum before saving.");
      return;
    }

    setSubmitting(true);
    setMessage("Saving student report...");

    const bodyPayload: Record<string, unknown> = {
      studentId,
      facultyId,
      curriculumId,
      preparedBy: session?.user?.id,
      teachingQuality,
      examPreparedness,
      courseMaterialsRating,
      lectureFeedback,
      examFeedback,
      instructorFeedback,
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
              {faculties.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>{faculty.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Course
            <select value={curriculumId} onChange={(event) => setCurriculumId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {curriculums.map((curriculum) => (
                <option key={curriculum._id} value={curriculum._id}>{curriculum.programName}</option>
              ))}
            </select>
          </label>
        </div>

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
            Instructor feedback
            <textarea value={instructorFeedback} onChange={(event) => setInstructorFeedback(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Overall summary
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr]">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
            </select>
          </label>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Prepared by</p>
            <p className="mt-2">{session?.user?.name ?? selectedStudent?.fullName ?? "Loading user..."}</p>
          </div>
        </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            {isStudent && studentMatchCount > 1 ? (
              <p className="mt-2 text-sm font-medium text-amber-700">Multiple student records found for your account. Contact the administrator to resolve duplicates.</p>
            ) : null}
          </div>
          <button type="submit" disabled={loading || submitting || !studentId || !facultyId || !curriculumId || (isStudent && studentMatchCount !== 1)} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
            {submitting ? "Saving..." : "Save student report"}
          </button>
        </div>
      </form>
    </div>
  );
}
