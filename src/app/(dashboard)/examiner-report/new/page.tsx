'use client';

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function NewExaminerReportPage() {
  const router = useRouter();
  const [examinerName, setExaminerName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [comments, setComments] = useState("");
  const [score, setScore] = useState("80");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submittedAt, setSubmittedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

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

        const facultyOptions = facultiesData.map((faculty: { _id: string; name: string }) => ({
          id: faculty._id,
          name: faculty.name,
        }));

        const departmentOptions: DepartmentOption[] = departmentsData.map((department: { _id: string; name: string; facultyId: string }) => ({
          id: department._id,
          name: department.name,
          facultyId: department.facultyId,
        }));

        const curriculumDepartmentMap = new Map(curriculumsData.map((curriculum: { _id: string; departmentId: string }) => [curriculum._id, curriculum.departmentId]));

        const courseOptions: CourseOption[] = coursesData.map((course: { _id: string; title: string; code: string; departmentId?: string; curriculumId?: string }) => ({
          id: course._id,
          title: course.title,
          code: course.code,
          curriculumId: course.curriculumId,
          departmentId: course.departmentId ?? curriculumDepartmentMap.get(course.curriculumId ?? "") ?? "",
        }));

        setFaculties(facultyOptions);
        setDepartments(departmentOptions);
        setCourses(courseOptions);

        const defaultFacultyId = facultyOptions[0]?.id ?? "";
        const defaultDepartmentId = departmentOptions.filter((department) => department.facultyId === defaultFacultyId)[0]?.id ?? "";
        const defaultCourseId = courseOptions.filter((course) => course.departmentId === defaultDepartmentId)[0]?.id ?? "";

        setFacultyId(defaultFacultyId);
        setDepartmentId(defaultDepartmentId);
        setCourseId(defaultCourseId);
      } catch {
        // ignore fetch failure; user can still enter values manually if needed
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

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!examinerName.trim()) {
      nextErrors.examinerName = "Examiner name is required.";
    }

    if (!facultyId) {
      nextErrors.facultyId = "Select a faculty.";
    }

    if (!departmentId) {
      nextErrors.departmentId = "Select a department.";
    }

    if (!courseId) {
      nextErrors.courseId = "Select a course.";
    }

    const numericScore = Number(score);
    if (score.trim() === "" || Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      nextErrors.score = "Score must be a number between 0 and 100.";
    }

    if (!submittedAt) {
      nextErrors.submittedAt = "Submitted date is required.";
    }

    return nextErrors;
  }

  function resetForm() {
    setExaminerName("");
    setFacultyId(faculties[0]?.id ?? "");
    const defaultDepartmentId = departments.filter((department) => department.facultyId === faculties[0]?.id)[0]?.id ?? "";
    setDepartmentId(defaultDepartmentId);
    setCourseId(courses.filter((course) => course.departmentId === defaultDepartmentId)[0]?.id ?? "");
    setComments("");
    setScore("80");
    setAttachmentUrl("");
    setSubmittedAt(new Date().toISOString().slice(0, 10));
    setErrors({});
    setMessage("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage("Please fix the highlighted fields before saving.");
      return;
    }

    setSubmitting(true);
    setMessage("Saving report...");

    const response = await fetch("/api/examiner-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examinerName,
        facultyId,
        departmentId,
        courseId,
        comments,
        score: Number(score),
        attachmentUrl,
        submittedAt: new Date(submittedAt).toISOString(),
      }),
    });

    setSubmitting(false);

    if (response.ok) {
      setMessage("Examiner report created successfully.");
      router.push("/examiner-report");
      router.refresh();
      return;
    }

    setMessage("Unable to create examiner report right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Examiner report</p>
          <h2 className="text-2xl font-semibold text-slate-900">Create new report</h2>
        </div>
        <Link href="/examiner-report" className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          Back to reports
        </Link>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Examiner name</label>
          <input
            value={examinerName}
            onChange={(event) => {
              setExaminerName(event.target.value);
              setErrors((current) => ({ ...current, examinerName: "" }));
            }}
            className={`w-full rounded-2xl border px-4 py-3 text-sm ${errors.examinerName ? "border-rose-500 bg-rose-50" : "border-slate-300"}`}
            placeholder="Dr. S. Ibrahim"
            required
          />
          {errors.examinerName ? <p className="mt-2 text-sm text-rose-600">{errors.examinerName}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
            <select
              value={facultyId}
              onChange={(event) => {
                handleFacultyChange(event.target.value);
                setErrors((current) => ({ ...current, facultyId: "", departmentId: "", courseId: "" }));
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-sm ${errors.facultyId ? "border-rose-500 bg-rose-50" : "border-slate-300"}`}
            >
              {faculties.length > 0 ? (
                faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))
              ) : (
                <option value="">Loading faculties...</option>
              )}
            </select>
            {errors.facultyId ? <p className="mt-2 text-sm text-rose-600">{errors.facultyId}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
            <select
              value={departmentId}
              onChange={(event) => {
                handleDepartmentChange(event.target.value);
                setErrors((current) => ({ ...current, departmentId: "", courseId: "" }));
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-sm ${errors.departmentId ? "border-rose-500 bg-rose-50" : "border-slate-300"}`}
            >
              {departments.filter((department) => department.facultyId === facultyId).length > 0 ? (
                departments
                  .filter((department) => department.facultyId === facultyId)
                  .map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))
              ) : (
                <option value="">No departments available</option>
              )}
            </select>
            {errors.departmentId ? <p className="mt-2 text-sm text-rose-600">{errors.departmentId}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
          <select
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setErrors((current) => ({ ...current, courseId: "" }));
            }}
            className={`w-full rounded-2xl border px-4 py-3 text-sm ${errors.courseId ? "border-rose-500 bg-rose-50" : "border-slate-300"}`}
          >
            {courses.filter((course) => course.departmentId === departmentId).length > 0 ? (
              courses
                .filter((course) => course.departmentId === departmentId)
                .map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.code})
                  </option>
                ))
            ) : (
              <option value="">No courses available</option>
            )}
          </select>
          {errors.courseId ? <p className="mt-2 text-sm text-rose-600">{errors.courseId}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Comments</label>
          <textarea
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            rows={4}
            placeholder="Your evaluation and recommended improvements"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Score</label>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(event) => {
                setScore(event.target.value);
                setErrors((current) => ({ ...current, score: "" }));
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-sm ${errors.score ? "border-rose-500 bg-rose-50" : "border-slate-300"}`}
            />
            {errors.score ? <p className="mt-2 text-sm text-rose-600">{errors.score}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Attachment URL</label>
            <input
              value={attachmentUrl}
              onChange={(event) => setAttachmentUrl(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="/documents/report.pdf"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Submitted date</label>
            <input
              type="date"
              value={submittedAt}
              onChange={(event) => {
                setSubmittedAt(event.target.value);
                setErrors((current) => ({ ...current, submittedAt: "" }));
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-sm ${errors.submittedAt ? "border-rose-500 bg-rose-50" : "border-slate-300"}`}
            />
            {errors.submittedAt ? <p className="mt-2 text-sm text-rose-600">{errors.submittedAt}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {submitting ? "Saving report..." : "Save report"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {message ? (
        <p className={`mt-4 text-sm ${Object.keys(errors).length > 0 ? "text-rose-600" : "text-slate-600"}`}>{message}</p>
      ) : null}
    </div>
  );
}
