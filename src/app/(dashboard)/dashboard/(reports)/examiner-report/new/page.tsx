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
const EXAM_TYPES = ["CA", "EXAM", "MAKEUP", "RESIT"] as const;

function scoreBand(numericScore: number) {
  if (Number.isNaN(numericScore)) {
    return { label: "—", text: "text-slate-500", chip: "bg-slate-100 text-slate-600" };
  }
  if (numericScore >= 75) {
    return { label: "Excellent", text: "text-emerald-700", chip: "bg-emerald-50 text-emerald-700" };
  }
  if (numericScore >= 60) {
    return { label: "Satisfactory", text: "text-amber-700", chip: "bg-amber-50 text-amber-700" };
  }
  return { label: "Needs improvement", text: "text-rose-700", chip: "bg-rose-50 text-rose-700" };
}

function SelectChevron() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.8" fill="currentColor" />
      </svg>
      {message}
    </p>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <span className="h-px flex-1 bg-slate-100" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{eyebrow}</span>
    </div>
  );
}


export default function NewExaminerReportPage() {
  const router = useRouter();
  const [isExternalExaminer, setIsExternalExaminer] = useState(false);
  const [lecturerId, setLecturerId] = useState("");
  const [externalExaminerName, setExternalExaminerName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState<(typeof SEMESTERS)[number]>("FIRST");
  const [examType, setExamType] = useState<(typeof EXAM_TYPES)[number]>("EXAM");
  const [questionPaperUrl, setQuestionPaperUrl] = useState("");
  const [markingSchemeUrl, setMarkingSchemeUrl] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("");
  const [comments, setComments] = useState("");
  const [malpracticeFlagged, setMalpracticeFlagged] = useState(false);
  const [moderatorComments, setModeratorComments] = useState("");
  const [complianceNotes, setComplianceNotes] = useState("");
  const [score, setScore] = useState("80");
  const [submittedAt, setSubmittedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");
  const [errors, setErrors] = useState<Record<string, string>>({});
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
        // ignore fetch failure; user can still enter values manually if needed
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

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (isExternalExaminer) {
      if (!externalExaminerName.trim()) {
        nextErrors.externalExaminerName = "External examiner name is required.";
      }
    } else if (!lecturerId) {
      nextErrors.lecturerId = "Select the lecturer who set the questions.";
    }

    if (!facultyId) nextErrors.facultyId = "Select a faculty.";
    if (!departmentId) nextErrors.departmentId = "Select a department.";
    if (!courseId) nextErrors.courseId = "Select a course.";
    if (!academicSession.trim()) nextErrors.academicSession = "Academic session is required.";

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
    setIsExternalExaminer(false);
    setLecturerId(lecturers[0]?.id ?? "");
    setExternalExaminerName("");
    setFacultyId(faculties[0]?.id ?? "");
    const defaultDepartmentId = departments.filter((department) => department.facultyId === faculties[0]?.id)[0]?.id ?? "";
    setDepartmentId(defaultDepartmentId);
    setCourseId(courses.filter((course) => course.departmentId === defaultDepartmentId)[0]?.id ?? "");
    setAcademicSession("");
    setSemester("FIRST");
    setExamType("EXAM");
    setQuestionPaperUrl("");
    setMarkingSchemeUrl("");
    setNumberOfQuestions("");
    setComments("");
    setMalpracticeFlagged(false);
    setModeratorComments("");
    setComplianceNotes("");
    setScore("80");
    setSubmittedAt(new Date().toISOString().slice(0, 10));
    setErrors({});
    setMessage("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessageTone("error");
      setMessage("Please fix the highlighted fields before saving.");
      return;
    }

    setSubmitting(true);
    setMessageTone("info");
    setMessage("Saving report...");

    const response = await fetch("/api/examiner-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lecturerId: isExternalExaminer ? undefined : lecturerId,
        externalExaminerName: isExternalExaminer ? externalExaminerName : undefined,
        facultyId,
        departmentId,
        courseId,
        academicSession,
        semester,
        examType,
        questionPaperUrl: questionPaperUrl || undefined,
        markingSchemeUrl: markingSchemeUrl || undefined,
        numberOfQuestions: numberOfQuestions ? Number(numberOfQuestions) : undefined,
        comments,
        malpracticeFlagged,
        moderatorComments: moderatorComments || undefined,
        complianceNotes: complianceNotes || undefined,
        score: Number(score),
        status: "SUBMITTED",
        submittedAt: new Date(submittedAt).toISOString(),
      }),
    });

    setSubmitting(false);

    if (response.ok) {
      setMessageTone("success");
      setMessage("Examiner report created successfully.");
      router.push("/dashboard/examiner-report");
      router.refresh();
      return;
    }

    const errorBody = await response.json().catch(() => null);
    setMessageTone("error");
    setMessage(errorBody?.message ?? "Unable to create examiner report right now.");
  }

  const filteredDepartments = useMemo(
    () => departments.filter((department) => department.facultyId === facultyId),
    [departments, facultyId]
  );

  const filteredCourses = useMemo(
    () => courses.filter((course) => course.departmentId === departmentId),
    [courses, departmentId]
  );

  const numericScore = Number(score);
  const band = scoreBand(numericScore);

  const baseInput =
    "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4";
  const okInput = "border-slate-300 focus:border-teal-500 focus:ring-teal-500/15";
  const errInput = "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/15";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-linear-to-r from-teal-500 via-teal-400 to-emerald-400" />

        <div className="p-5 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">Examiner report</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Create new report</h2>
              <p className="mt-1 text-sm text-slate-500">Record an examiner&apos;s evaluation for a course.</p>
            </div>
            <Link
              href="/dashboard/examiner-report"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <path d="M9.5 3.5L5 8L9.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to reports
            </Link>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit} noValidate>
            <section>
              <SectionHeading eyebrow="Step 1" title="Examiner" />

              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isExternalExaminer}
                  onChange={(event) => {
                    setIsExternalExaminer(event.target.checked);
                    setErrors((current) => ({ ...current, lecturerId: "", externalExaminerName: "" }));
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30"
                />
                External / guest examiner (no portal account)
              </label>

              {isExternalExaminer ? (
                <>
                  <label className="mb-2 block text-sm font-medium text-slate-700">External examiner name</label>
                  <input
                    value={externalExaminerName}
                    onChange={(event) => {
                      setExternalExaminerName(event.target.value);
                      setErrors((current) => ({ ...current, externalExaminerName: "" }));
                    }}
                    className={`${baseInput} ${errors.externalExaminerName ? errInput : okInput}`}
                    placeholder="Dr. S. Ibrahim (external)"
                  />
                  <FieldError message={errors.externalExaminerName} />
                </>
              ) : (
                <>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Lecturer</label>
                  <div className="relative">
                    <select
                      value={lecturerId}
                      disabled={optionsLoading}
                      onChange={(event) => {
                        setLecturerId(event.target.value);
                        setErrors((current) => ({ ...current, lecturerId: "" }));
                      }}
                      className={`${baseInput} ${errors.lecturerId ? errInput : okInput} appearance-none pr-10 disabled:cursor-wait disabled:text-slate-400`}
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
                    <SelectChevron />
                  </div>
                  <FieldError message={errors.lecturerId} />
                </>
              )}
            </section>

            <section>
              <SectionHeading eyebrow="Step 2" title="Course assignment" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
                  <div className="relative">
                    <select
                      value={facultyId}
                      disabled={optionsLoading}
                      onChange={(event) => {
                        handleFacultyChange(event.target.value);
                        setErrors((current) => ({ ...current, facultyId: "", departmentId: "", courseId: "" }));
                      }}
                      className={`${baseInput} ${errors.facultyId ? errInput : okInput} appearance-none pr-10 disabled:cursor-wait disabled:text-slate-400`}
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
                    <SelectChevron />
                  </div>
                  <FieldError message={errors.facultyId} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
                  <div className="relative">
                    <select
                      value={departmentId}
                      disabled={optionsLoading}
                      onChange={(event) => {
                        handleDepartmentChange(event.target.value);
                        setErrors((current) => ({ ...current, departmentId: "", courseId: "" }));
                      }}
                      className={`${baseInput} ${errors.departmentId ? errInput : okInput} appearance-none pr-10 disabled:cursor-wait disabled:text-slate-400`}
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
                    <SelectChevron />
                  </div>
                  <FieldError message={errors.departmentId} />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
                <div className="relative">
                  <select
                    value={courseId}
                    disabled={optionsLoading}
                    onChange={(event) => {
                      setCourseId(event.target.value);
                      setErrors((current) => ({ ...current, courseId: "" }));
                    }}
                    className={`${baseInput} ${errors.courseId ? errInput : okInput} appearance-none pr-10 disabled:cursor-wait disabled:text-slate-400`}
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
                  <SelectChevron />
                </div>
                <FieldError message={errors.courseId} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Academic session</label>
                  <div className="relative">
                    <AcademicSessionSelect
                      value={academicSession}
                      onChange={(value) => {
                        setAcademicSession(value);
                        setErrors((current) => ({ ...current, academicSession: "" }));
                      }}
                      autoSelectCurrent
                      className={`${baseInput} ${errors.academicSession ? errInput : okInput} appearance-none pr-10`}
                    />
                    <SelectChevron />
                  </div>
                  <FieldError message={errors.academicSession} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Semester</label>
                  <div className="relative">
                    <select
                      value={semester}
                      onChange={(event) => setSemester(event.target.value as (typeof SEMESTERS)[number])}
                      className={`${baseInput} ${okInput} appearance-none pr-10`}
                    >
                      {SEMESTERS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Exam type</label>
                  <div className="relative">
                    <select
                      value={examType}
                      onChange={(event) => setExamType(event.target.value as (typeof EXAM_TYPES)[number])}
                      className={`${baseInput} ${okInput} appearance-none pr-10`}
                    >
                      {EXAM_TYPES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Step 3" title="Question artifacts" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Question paper URL</label>
                  <input
                    value={questionPaperUrl}
                    onChange={(event) => setQuestionPaperUrl(event.target.value)}
                    className={`${baseInput} ${okInput}`}
                    placeholder="/documents/question-paper.pdf"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Marking scheme URL
                    <span className="ml-1.5 text-xs font-normal text-slate-400">(answer key — access restricted)</span>
                  </label>
                  <input
                    value={markingSchemeUrl}
                    onChange={(event) => setMarkingSchemeUrl(event.target.value)}
                    className={`${baseInput} ${okInput}`}
                    placeholder="/documents/marking-scheme.pdf"
                  />
                </div>
              </div>
              <div className="mt-4 sm:w-1/2 sm:pr-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Number of questions</label>
                <input
                  type="number"
                  min="0"
                  value={numberOfQuestions}
                  onChange={(event) => setNumberOfQuestions(event.target.value)}
                  className={`${baseInput} ${okInput}`}
                  placeholder="e.g. 5"
                />
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Step 4" title="Evaluation" />

              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">Comments</label>
                <textarea
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  className={`${baseInput} ${okInput} resize-none`}
                  rows={4}
                  placeholder="Your evaluation and recommended improvements"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    id="malpracticeFlagged"
                    type="checkbox"
                    checked={malpracticeFlagged}
                    onChange={(event) => setMalpracticeFlagged(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30"
                  />
                  <label htmlFor="malpracticeFlagged" className="text-sm font-medium text-slate-700">
                    Malpractice flagged
                  </label>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Moderator comments</label>
                  <textarea
                    value={moderatorComments}
                    onChange={(event) => setModeratorComments(event.target.value)}
                    className={`${baseInput} ${okInput} resize-none`}
                    rows={4}
                    placeholder="Notes from the moderator or review officer"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">Compliance notes</label>
                <textarea
                  value={complianceNotes}
                  onChange={(event) => setComplianceNotes(event.target.value)}
                  className={`${baseInput} ${okInput} resize-none`}
                  rows={4}
                  placeholder="Compliance observations or follow-up actions"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Score</label>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${band.chip}`}>{band.label}</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Number.isNaN(numericScore) ? 0 : numericScore}
                        onChange={(event) => {
                          setScore(event.target.value);
                          setErrors((current) => ({ ...current, score: "" }));
                        }}
                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          onChange={(event) => {
                            setScore(event.target.value);
                            setErrors((current) => ({ ...current, score: "" }));
                          }}
                          className={`w-16 rounded-xl border px-2 py-1.5 text-center text-sm font-semibold ${band.text} ${errors.score ? errInput : okInput} focus:outline-none focus:ring-4`}
                        />
                        <span className="text-sm font-medium text-slate-400">/100</span>
                      </div>
                    </div>
                  </div>
                  <FieldError message={errors.score} />
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
                    className={`${baseInput} ${errors.submittedAt ? errInput : okInput}`}
                  />
                  <FieldError message={errors.submittedAt} />
                </div>
              </div>
            </section>

            {message ? (
              <div
                role="status"
                className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
                  messageTone === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : messageTone === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.8" fill="currentColor" />
                </svg>
                <span>{message}</span>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 animate-spin">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.3" />
                      <path d="M14.5 8a6.5 6.5 0 00-6.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    Saving report...
                  </>
                ) : (
                  "Submit report"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
