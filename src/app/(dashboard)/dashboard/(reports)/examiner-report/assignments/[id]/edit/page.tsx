'use client';

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AcademicSessionSelect } from "@/components/shared/AcademicSessionSelect";
import { Spinner } from "@/components/ui/Spinner";

interface FacultyOption { id: string; name: string; }
interface DepartmentOption { id: string; name: string; facultyId: string; }
interface CourseOption { id: string; title: string; code: string; departmentId: string; curriculumId?: string; }
interface LecturerOption { id: string; name: string; role: string; }

const SEMESTERS = ["FIRST", "SECOND"] as const;

export default function EditTeachingAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [lecturerId, setLecturerId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState<(typeof SEMESTERS)[number]>("FIRST");

  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");
  const [submitting, setSubmitting] = useState(false);

  const [lecturers, setLecturers] = useState<LecturerOption[]>([]);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [assignmentRes, usersRes, facultiesRes, departmentsRes, curriculumsRes, coursesRes] = await Promise.all([
          fetch(`/api/teaching-assignments/${id}`),
          fetch("/api/users"),
          fetch("/api/faculties"),
          fetch("/api/departments"),
          fetch("/api/curriculum"),
          fetch("/api/courses"),
        ]);

        if (!assignmentRes.ok) { setNotFound(true); return; }

        const [assignment, usersData, facultiesData, departmentsData, curriculumsData, coursesData] = await Promise.all([
          assignmentRes.json(),
          usersRes.ok ? usersRes.json() : [],
          facultiesRes.ok ? facultiesRes.json() : [],
          departmentsRes.ok ? departmentsRes.json() : [],
          curriculumsRes.ok ? curriculumsRes.json() : [],
          coursesRes.ok ? coursesRes.json() : [],
        ]);

        const lecturerOptions: LecturerOption[] = usersData
          .filter((u: { role: string }) => ["EXAMINER", "ADMIN", "FACULTY_OFFICER"].includes(u.role))
          .map((u: { _id: string; name: string; role: string }) => ({ id: u._id, name: u.name, role: u.role }));

        const facultyOptions: FacultyOption[] = facultiesData.map(
          (f: { _id: string; name: string }) => ({ id: f._id, name: f.name })
        );

        const departmentOptions: DepartmentOption[] = departmentsData.map(
          (d: { _id: string; name: string; facultyId: string }) => ({ id: d._id, name: d.name, facultyId: d.facultyId })
        );

        const curriculumDepartmentMap = new Map(
          curriculumsData.map((c: { _id: string; departmentId: string }) => [c._id, c.departmentId])
        );

        const courseOptions: CourseOption[] = coursesData.map(
          (c: { _id: string; title: string; code: string; departmentId?: string; curriculumId?: string }) => ({
            id: c._id,
            title: c.title,
            code: c.code,
            curriculumId: c.curriculumId,
            departmentId: c.departmentId ?? curriculumDepartmentMap.get(c.curriculumId ?? "") ?? "",
          })
        );

        setLecturers(lecturerOptions);
        setFaculties(facultyOptions);
        setDepartments(departmentOptions);
        setCourses(courseOptions);

        // Pre-populate from existing assignment
        const existingLecturerId =
          typeof assignment.lecturerId === "object" && assignment.lecturerId !== null
            ? String(assignment.lecturerId._id ?? "")
            : String(assignment.lecturerId ?? "");
        setLecturerId(existingLecturerId);

        const existingCourseId = String(assignment.courseId ?? "");
        setCourseId(existingCourseId);

        // Derive department and faculty from the course
        const matchedCourse = courseOptions.find((c) => c.id === existingCourseId);
        const existingDeptId = matchedCourse?.departmentId ?? "";
        setDepartmentId(existingDeptId);

        const matchedDept = departmentOptions.find((d) => d.id === existingDeptId);
        setFacultyId(matchedDept?.facultyId ?? facultyOptions[0]?.id ?? "");

        setAcademicSession(assignment.academicSession ?? "");
        setSemester(assignment.semester ?? "FIRST");
      } catch {
        setNotFound(true);
      } finally {
        setPageLoading(false);
        setOptionsLoading(false);
      }
    }

    loadData();
  }, [id]);

  function handleFacultyChange(value: string) {
    const nextDeptId = departments.find((d) => d.facultyId === value)?.id ?? "";
    const nextCourseId = courses.find((c) => c.departmentId === nextDeptId)?.id ?? "";
    setFacultyId(value);
    setDepartmentId(nextDeptId);
    setCourseId(nextCourseId);
  }

  function handleDepartmentChange(value: string) {
    const nextCourseId = courses.find((c) => c.departmentId === value)?.id ?? "";
    setDepartmentId(value);
    setCourseId(nextCourseId);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!lecturerId || !courseId || !academicSession.trim()) {
      setMessageTone("error");
      setMessage("Please choose a lecturer, course, and academic session before saving.");
      return;
    }

    setSubmitting(true);
    setMessageTone("info");
    setMessage("Saving changes…");

    const response = await fetch(`/api/teaching-assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lecturerId, courseId, academicSession, semester }),
    });

    setSubmitting(false);

    if (response.ok) {
      setMessageTone("success");
      setMessage("Assignment updated successfully.");
      router.push("/dashboard/examiner-report/assignments");
      router.refresh();
      return;
    }

    const errorBody = await response.json().catch(() => null);
    setMessageTone("error");
    setMessage(errorBody?.message ?? "Unable to save changes right now.");
  }

  const filteredDepartments = useMemo(
    () => departments.filter((d) => d.facultyId === facultyId),
    [departments, facultyId]
  );

  const filteredCourses = useMemo(
    () => courses.filter((c) => c.departmentId === departmentId),
    [courses, departmentId]
  );

  const selectClass =
    "w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-wait disabled:text-slate-400";
  const inputClass =
    "w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

  if (pageLoading) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-sm text-slate-500">
        <Spinner className="h-4 w-4" />
        Loading assignment…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-semibold text-slate-700">Assignment not found</p>
        <Link href="/dashboard/examiner-report/assignments" className="text-sm font-medium text-teal-600 hover:underline">
          Back to assignments
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Teaching assignment</p>
          <h2 className="text-2xl font-semibold text-slate-900">Edit assignment</h2>
        </div>
        <Link
          href="/dashboard/examiner-report/assignments"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back
        </Link>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Lecturer</label>
          <select
            value={lecturerId}
            disabled={optionsLoading}
            onChange={(event) => setLecturerId(event.target.value)}
            className={selectClass}
          >
            {lecturers.length > 0 ? (
              lecturers.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.role})</option>
              ))
            ) : (
              <option value="">{optionsLoading ? "Loading lecturers…" : "No lecturers available"}</option>
            )}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
            <select
              value={facultyId}
              disabled={optionsLoading}
              onChange={(event) => handleFacultyChange(event.target.value)}
              className={selectClass}
            >
              {faculties.length > 0 ? (
                faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)
              ) : (
                <option value="">{optionsLoading ? "Loading faculties…" : "No faculties available"}</option>
              )}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
            <select
              value={departmentId}
              disabled={optionsLoading}
              onChange={(event) => handleDepartmentChange(event.target.value)}
              className={selectClass}
            >
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)
              ) : (
                <option value="">{optionsLoading ? "Loading departments…" : "No departments for this faculty"}</option>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
          <select
            value={courseId}
            disabled={optionsLoading}
            onChange={(event) => setCourseId(event.target.value)}
            className={selectClass}
          >
            {filteredCourses.length > 0 ? (
              filteredCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
              ))
            ) : (
              <option value="">{optionsLoading ? "Loading courses…" : "No courses for this department"}</option>
            )}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Academic session</label>
            <AcademicSessionSelect value={academicSession} onChange={setAcademicSession} className={inputClass} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Semester</label>
            <select
              value={semester}
              onChange={(event) => setSemester(event.target.value as (typeof SEMESTERS)[number])}
              className={selectClass}
            >
              {SEMESTERS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              messageTone === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : messageTone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/examiner-report/assignments"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || optionsLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
