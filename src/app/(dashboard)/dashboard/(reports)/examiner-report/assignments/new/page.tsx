'use client';

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AcademicSessionSelect } from "@/components/shared/AcademicSessionSelect";

interface FacultyOption {
  id: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  name: string;
  facultyId: string;
}

interface CourseOption {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  curriculumId?: string;
}

interface LecturerOption {
  id: string;
  name: string;
  role: string;
}

const SEMESTERS = ["FIRST", "SECOND"] as const;

export default function NewTeachingAssignmentPage() {
  const router = useRouter();
  const [lecturerId, setLecturerId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState<(typeof SEMESTERS)[number]>("FIRST");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [lecturers, setLecturers] = useState<LecturerOption[]>([]);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [usersResponse, facultiesResponse, departmentsResponse, curriculumsResponse, coursesResponse] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/faculties"),
          fetch("/api/departments"),
          fetch("/api/curriculum"),
          fetch("/api/courses"),
        ]);

        if (
          !usersResponse.ok ||
          !facultiesResponse.ok ||
          !departmentsResponse.ok ||
          !curriculumsResponse.ok ||
          !coursesResponse.ok
        ) {
          return;
        }

        const usersData = await usersResponse.json();
        const facultiesData = await facultiesResponse.json();
        const departmentsData = await departmentsResponse.json();
        const curriculumsData = await curriculumsResponse.json();
        const coursesData = await coursesResponse.json();

        const lecturerOptions: LecturerOption[] = usersData
          .filter((user: { role: string }) => ["EXAMINER", "ADMIN", "FACULTY_OFFICER"].includes(user.role))
          .map((user: { _id: string; name: string; role: string }) => ({
            id: user._id,
            name: user.name,
            role: user.role,
          }));

        const facultyOptions = facultiesData.map((faculty: { _id: string; name: string }) => ({
          id: faculty._id,
          name: faculty.name,
        }));

        const departmentOptions: DepartmentOption[] = departmentsData.map((department: { _id: string; name: string; facultyId: string }) => ({
          id: department._id,
          name: department.name,
          facultyId: department.facultyId,
        }));

        const curriculumDepartmentMap = new Map(
          curriculumsData.map((curriculum: { _id: string; departmentId: string }) => [curriculum._id, curriculum.departmentId])
        );

        const courseOptions: CourseOption[] = coursesData.map((course: { _id: string; title: string; code: string; departmentId?: string; curriculumId?: string }) => ({
          id: course._id,
          title: course.title,
          code: course.code,
          curriculumId: course.curriculumId,
          departmentId: course.departmentId ?? curriculumDepartmentMap.get(course.curriculumId ?? "") ?? "",
        }));

        setLecturers(lecturerOptions);
        setFaculties(facultyOptions);
        setDepartments(departmentOptions);
        setCourses(courseOptions);

        const defaultFacultyId = facultyOptions[0]?.id ?? "";
        const defaultDepartmentId = departmentOptions.filter((department) => department.facultyId === defaultFacultyId)[0]?.id ?? "";
        const defaultCourseId = courseOptions.filter((course) => course.departmentId === defaultDepartmentId)[0]?.id ?? "";

        setLecturerId(lecturerOptions[0]?.id ?? "");
        setFacultyId(defaultFacultyId);
        setDepartmentId(defaultDepartmentId);
        setCourseId(defaultCourseId);
      } catch {
        // ignore fetch failure; user can still submit once options load
      } finally {
        setOptionsLoading(false);
      }
    }

    loadOptions();
  }, []);

  function handleFacultyChange(value: string) {
    const nextDepartmentId = departments.filter((department) => department.facultyId === value)[0]?.id ?? "";
    const nextCourseId = courses.filter((course) => course.departmentId === nextDepartmentId)[0]?.id ?? "";

    setFacultyId(value);
    setDepartmentId(nextDepartmentId);
    setCourseId(nextCourseId);
  }

  function handleDepartmentChange(value: string) {
    const nextCourseId = courses.filter((course) => course.departmentId === value)[0]?.id ?? "";

    setDepartmentId(value);
    setCourseId(nextCourseId);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!lecturerId || !courseId || !academicSession.trim()) {
      setMessage("Please choose a lecturer, course, and academic session before saving.");
      return;
    }

    setSubmitting(true);
    setMessage("Saving assignment...");

    const response = await fetch("/api/teaching-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lecturerId, courseId, academicSession, semester }),
    });

    setSubmitting(false);

    if (response.ok) {
      setMessage("Teaching assignment created successfully.");
      router.push("/dashboard/examiner-report/assignments");
      router.refresh();
      return;
    }

    const errorBody = await response.json().catch(() => null);
    setMessage(errorBody?.message ?? "Unable to create teaching assignment right now.");
  }

  const filteredDepartments = useMemo(
    () => departments.filter((department) => department.facultyId === facultyId),
    [departments, facultyId]
  );

  const filteredCourses = useMemo(
    () => courses.filter((course) => course.departmentId === departmentId),
    [courses, departmentId]
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Teaching assignment</p>
          <h2 className="text-2xl font-semibold text-slate-900">Assign expected submission</h2>
        </div>
        <Link
          href="/dashboard/examiner-report/assignments"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Back
        </Link>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Lecturer</label>
          <select
            value={lecturerId}
            disabled={optionsLoading}
            onChange={(event) => setLecturerId(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:cursor-wait disabled:text-slate-400"
          >
            {lecturers.length > 0 ? (
              lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name} ({lecturer.role})
                </option>
              ))
            ) : (
              <option value="">{optionsLoading ? "Loading lecturers..." : "No lecturers available"}</option>
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:cursor-wait disabled:text-slate-400"
            >
              {faculties.length > 0 ? (
                faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))
              ) : (
                <option value="">{optionsLoading ? "Loading faculties..." : "No faculties available"}</option>
              )}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
            <select
              value={departmentId}
              disabled={optionsLoading}
              onChange={(event) => handleDepartmentChange(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:cursor-wait disabled:text-slate-400"
            >
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))
              ) : (
                <option value="">{optionsLoading ? "Loading departments..." : "No departments available"}</option>
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
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:cursor-wait disabled:text-slate-400"
          >
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.code})
                </option>
              ))
            ) : (
              <option value="">{optionsLoading ? "Loading courses..." : "No courses available"}</option>
            )}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Academic session</label>
            <AcademicSessionSelect
              value={academicSession}
              onChange={setAcademicSession}
              autoSelectCurrent
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Semester</label>
            <select
              value={semester}
              onChange={(event) => setSemester(event.target.value as (typeof SEMESTERS)[number])}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              {SEMESTERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || optionsLoading}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? "Saving..." : "Save assignment"}
        </button>
      </form>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
