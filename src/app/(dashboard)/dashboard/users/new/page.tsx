'use client';

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface FacultyOption {
  id: string;
  name: string;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "Full administrative access across all faculties and departments.",
  FACULTY_OFFICER: "Manages students, examiners, and reports within an assigned faculty.",
  EXAMINER: "Submits and reviews examiner reports for assigned courses.",
  STUDENT: "Read-only access to their own academic records.",
};

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

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const [facultyId, setFacultyId] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);

  useEffect(() => {
    async function loadFaculties() {
      try {
        const response = await fetch("/api/faculties");
        if (!response.ok) return;

        const data = await response.json();
        const facultyOptions: FacultyOption[] = data.map((faculty: { _id: string; name: string }) => ({
          id: faculty._id,
          name: faculty.name,
        }));

        setFaculties(facultyOptions);
      } catch {
        // ignore fetch failure; faculty stays optional
      } finally {
        setOptionsLoading(false);
      }
    }

    loadFaculties();
  }, []);

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!role) {
      nextErrors.role = "Select a role.";
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
    setMessage("Creating user...");

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        facultyId: facultyId || undefined,
      }),
    });

    setSubmitting(false);

    if (response.ok) {
      setMessageTone("success");
      setMessage("User created successfully.");
      router.push("/dashboard/users");
      router.refresh();
      return;
    }

    setMessageTone("error");
    setMessage("Unable to create user right now.");
  }

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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">User</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Create user account</h2>
              <p className="mt-1 text-sm text-slate-500">Set up portal access for a new account.</p>
            </div>
            <Link
              href="/dashboard/users"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <path d="M9.5 3.5L5 8L9.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to users
            </Link>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit} noValidate>
            <section>
              <SectionHeading eyebrow="Step 1" title="Account" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <RequiredLabel>Name</RequiredLabel>
                  <input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setErrors((current) => ({ ...current, name: "" }));
                    }}
                    className={`${baseInput} ${errors.name ? errInput : okInput}`}
                    placeholder="Ada Okafor"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  <FieldError id="name-error" message={errors.name} />
                </div>
                <div>
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
              </div>

              <div className="mt-4">
                <RequiredLabel>Password</RequiredLabel>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((current) => ({ ...current, password: "" }));
                    }}
                    className={`${baseInput} ${errors.password ? errInput : okInput} pr-11`}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                        <path
                          d="M2 2L14 14M6.6 6.7a2 2 0 002.7 2.7M4 4.3C2.5 5.3 1.5 6.6 1 8c1.2 3 4 5 7 5 1.1 0 2.1-.3 3-.7M9.5 3.2C10 3.1 10.5 3 11 3c3 0 5.8 2 7 5-.4 1-1 1.9-1.7 2.7"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                        <path
                          d="M1 8c1.2-3 4-5 7-5s5.8 2 7 5c-1.2 3-4 5-7 5s-5.8-2-7-5z"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    )}
                  </button>
                </div>
                <FieldError id="password-error" message={errors.password} />
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Step 2" title="Access" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <RequiredLabel>Role</RequiredLabel>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(event) => {
                        setRole(event.target.value);
                        setErrors((current) => ({ ...current, role: "" }));
                      }}
                      className={`${baseInput} ${errors.role ? errInput : okInput} appearance-none pr-10`}
                      aria-invalid={Boolean(errors.role)}
                      aria-describedby={errors.role ? "role-error" : "role-description"}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="FACULTY_OFFICER">Faculty officer</option>
                      <option value="EXAMINER">Examiner</option>
                      <option value="STUDENT">Student</option>
                      <option value="LMS_REP">LMS Rep</option>
                      <option value="PG_COORDINATOR">PG Coordinator</option>
                    </select>
                    <SelectChevron />
                  </div>
                  {errors.role ? (
                    <FieldError id="role-error" message={errors.role} />
                  ) : (
                    <p id="role-description" className="mt-1.5 text-xs text-slate-500">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
                  <div className="relative">
                    <select
                      value={facultyId}
                      disabled={optionsLoading}
                      onChange={(event) => setFacultyId(event.target.value)}
                      className={`${baseInput} ${okInput} appearance-none pr-10 disabled:cursor-wait disabled:text-slate-400`}
                    >
                      <option value="">{optionsLoading ? "Loading faculties..." : "No faculty"}</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Optional — required only for faculty-scoped roles.</p>
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
                href="/dashboard/users"
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
                    Creating user...
                  </>
                ) : (
                  "Create user"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}