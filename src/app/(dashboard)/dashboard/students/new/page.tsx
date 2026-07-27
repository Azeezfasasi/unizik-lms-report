'use client';

import Link from "next/link";
import { useState, useEffect, useMemo, FormEvent } from "react";
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

interface CurriculumOption {
  id: string;
  programName: string;
  departmentId: string;
}

const PROGRAM_LEVEL_SUGGESTIONS = ["ND", "HND", "BSc", "MSc", "PGD", "PhD"];

function SelectChevron() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.8" fill="currentColor" />
      </svg>
      {message}
    </p>
  );
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children} <span className="text-rose-500">*</span>
    </label>
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

export default function NewStudentPage() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [programLevel, setProgramLevel] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [facultiesResponse, departmentsResponse, curriculumsResponse] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/departments"),
          fetch("/api/curriculum"),
        ]);

        if (!facultiesResponse.ok || !departmentsResponse.ok || !curriculumsResponse.ok) {
          return;
        }

        const facultiesData = await facultiesResponse.json();
        const departmentsData = await departmentsResponse.json();
        const curriculumsData = await curriculumsResponse.json();

        const facultyOptions: FacultyOption[] = facultiesData.map((faculty: { _id: string; name: string }) => ({
          id: faculty._id,
          name: faculty.name,
        }));

        const departmentOptions: DepartmentOption[] = departmentsData.map((department: { _id: string; name: string; facultyId: string }) => ({
          id: department._id,
          name: department.name,
          facultyId: department.facultyId,
        }));

        const curriculumOptions: CurriculumOption[] = curriculumsData.map((curriculum: { _id: string; programName: string; departmentId: string }) => ({
          id: curriculum._id,
          programName: curriculum.programName,
          departmentId: curriculum.departmentId,
        }));

        setFaculties(facultyOptions);
        setDepartments(departmentOptions);
        setCurriculums(curriculumOptions);

        const defaultFacultyId = facultyOptions[0]?.id ?? "";
        const defaultDepartmentId = departmentOptions.filter((department) => department.facultyId === defaultFacultyId)[0]?.id ?? "";
        const defaultCurriculumId = curriculumOptions.filter((curriculum) => curriculum.departmentId === defaultDepartmentId)[0]?.id ?? "";

        setFacultyId(defaultFacultyId);
        setDepartmentId(defaultDepartmentId);
        setCurriculumId(defaultCurriculumId);
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
    const nextCurriculumId = curriculums.filter((curriculum) => curriculum.departmentId === nextDepartmentId)[0]?.id ?? "";

    setFacultyId(value);
    setDepartmentId(nextDepartmentId);
    setCurriculumId(nextCurriculumId);
  }

  function handleDepartmentChange(value: string) {
    const nextCurriculumId = curriculums.filter((curriculum) => curriculum.departmentId === value)[0]?.id ?? "";

    setDepartmentId(value);
    setCurriculumId(nextCurriculumId);
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!matricNumber.trim()) {
      nextErrors.matricNumber = "Matric number is required.";
    }

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!facultyId) {
      nextErrors.facultyId = "Select a faculty.";
    }

    if (!departmentId) {
      nextErrors.departmentId = "Select a department.";
    }

    if (!curriculumId) {
      nextErrors.curriculumId = "Select a curriculum.";
    }

    if (!programLevel.trim()) {
      nextErrors.programLevel = "Program level is required.";
    }

    return nextErrors;
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
    setMessage("Creating student...");

    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matricNumber: matricNumber.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        facultyId,
        departmentId,
        curriculumId,
        programLevel: programLevel.trim(),
      }),
    });

    setSubmitting(false);

    if (response.ok) {
      setMessageTone("success");
      setMessage("Student created successfully.");
      router.push("/dashboard/students");
      router.refresh();
      return;
    }

    setMessageTone("error");
    setMessage("Unable to create student right now.");
  }

  const filteredDepartments = useMemo(
    () => departments.filter((department) => department.facultyId === facultyId),
    [departments, facultyId]
  );

  const filteredCurriculums = useMemo(
    () => curriculums.filter((curriculum) => curriculum.departmentId === departmentId),
    [curriculums, departmentId]
  );

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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">Student</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Add new student</h2>
              <p className="mt-1 text-sm text-slate-500">Enroll a student and assign their programme.</p>
            </div>
            <Link
              href="/dashboard/students"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <path d="M9.5 3.5L5 8L9.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to students
            </Link>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit} noValidate>
            <section>
              <SectionHeading eyebrow="Step 1" title="Student details" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <RequiredLabel>Registration number</RequiredLabel>
                  <input
                    value={matricNumber}
                    onChange={(event) => {
                      setMatricNumber(event.target.value);
                      setErrors((current) => ({ ...current, matricNumber: "" }));
                    }}
                    className={`${baseInput} ${errors.matricNumber ? errInput : okInput}`}
                    placeholder="2026/001"
                    aria-invalid={Boolean(errors.matricNumber)}
                    aria-describedby={errors.matricNumber ? "matricNumber-error" : undefined}
                  />
                  <FieldError id="matricNumber-error" message={errors.matricNumber} />
                </div>
                <div>
                  <RequiredLabel>Full name</RequiredLabel>
                  <input
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setErrors((current) => ({ ...current, fullName: "" }));
                    }}
                    className={`${baseInput} ${errors.fullName ? errInput : okInput}`}
                    placeholder="Ada Okafor"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  />
                  <FieldError id="fullName-error" message={errors.fullName} />
                </div>
              </div>

              <div className="mt-4">
                <RequiredLabel>Email</RequiredLabel>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((current) => ({ ...current, email: "" }));
                  }}
                  className={`${baseInput} ${errors.email ? errInput : okInput}`}
                  placeholder="ada.okafor@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                <FieldError id="email-error" message={errors.email} />
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Step 2" title="Programme" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <RequiredLabel>Faculty</RequiredLabel>
                  <div className="relative">
                    <select
                      value={facultyId}
                      disabled={optionsLoading}
                      onChange={(event) => {
                        handleFacultyChange(event.target.value);
                        setErrors((current) => ({ ...current, facultyId: "", departmentId: "", curriculumId: "" }));
                      }}
                      className={`${baseInput} ${errors.facultyId ? errInput : okInput} appearance-none pr-10 disabled:cursor-wait disabled:text-slate-400`}
                      aria-invalid={Boolean(errors.facultyId)}
                      aria-describedby={errors.facultyId ? "facultyId-error" : undefined}
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
                  <FieldError id="facultyId-error" message={errors.facultyId} />
                </div>
                <div>
                  <RequiredLabel>Department</RequiredLabel>
                  <div className="relative">
                    <select
                      value={departmentId}
                      disabled={optionsLoading}
                      onChange={(event) => {
                        handleDepartmentChange(event.target.value);
                        setErrors((current) => ({ ...current, departmentId: "", curriculumId: "" }));
                      }}
                      className={`${baseInput} ${errors.departmentId ? errInput : okInput} appearance-none pr-10 disabled:cursor-wait disabled:text-slate-400`}
                      aria-invalid={Boolean(errors.departmentId)}
                      aria-describedby={errors.departmentId ? "departmentId-error" : undefined}
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
                  <FieldError id="departmentId-error" message={errors.departmentId} />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <RequiredLabel>Curriculum</RequiredLabel>
                  <div className="relative">
                    <select
                      value={curriculumId}
                      disabled={optionsLoading}
                      onChange={(event) => {
                        setCurriculumId(event.target.value);
                        setErrors((current) => ({ ...current, curriculumId: "" }));
                      }}
                      className={`${baseInput} ${errors.curriculumId ? errInput : okInput} appearance-none pr-10 disabled:cursor-wait disabled:text-slate-400`}
                      aria-invalid={Boolean(errors.curriculumId)}
                      aria-describedby={errors.curriculumId ? "curriculumId-error" : undefined}
                    >
                      {filteredCurriculums.length > 0 ? (
                        filteredCurriculums.map((curriculum) => (
                          <option key={curriculum.id} value={curriculum.id}>
                            {curriculum.programName}
                          </option>
                        ))
                      ) : (
                        <option value="">{optionsLoading ? "Loading curricula..." : "No curricula available"}</option>
                      )}
                    </select>
                    <SelectChevron />
                  </div>
                  <FieldError id="curriculumId-error" message={errors.curriculumId} />
                </div>
                <div>
                  <RequiredLabel>Program level</RequiredLabel>
                  <input
                    list="program-level-suggestions"
                    value={programLevel}
                    onChange={(event) => {
                      setProgramLevel(event.target.value);
                      setErrors((current) => ({ ...current, programLevel: "" }));
                    }}
                    className={`${baseInput} ${errors.programLevel ? errInput : okInput}`}
                    placeholder="MSc"
                    aria-invalid={Boolean(errors.programLevel)}
                    aria-describedby={errors.programLevel ? "programLevel-error" : undefined}
                  />
                  <datalist id="program-level-suggestions">
                    {PROGRAM_LEVEL_SUGGESTIONS.map((level) => (
                      <option key={level} value={level} />
                    ))}
                  </datalist>
                  <FieldError id="programLevel-error" message={errors.programLevel} />
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
              <Link
                href="/dashboard/students"
                className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 animate-spin">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.3" />
                      <path d="M14.5 8a6.5 6.5 0 00-6.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    Creating student...
                  </>
                ) : (
                  "Create student"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}