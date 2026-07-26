"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PercentageRating } from "@/components/shared/PercentageRating";

interface FacultyOption {
  _id: string;
  name: string;
}

interface DepartmentOption {
  _id: string;
  name: string;
}

const SEMESTERS = ["FIRST", "SECOND"] as const;

function defaultAcademicSession() {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}/${year + 1}`;
}

function normalizeAcademicSession(value: string) {
  const trimmed = value.trim();
  if (/^\d{4}$/.test(trimmed)) {
    const year = Number(trimmed);
    return `${year}/${year + 1}`;
  }
  if (/^\d{4}[-/]\d{4}$/.test(trimmed)) {
    return trimmed.replace("-", "/");
  }
  return trimmed;
}

export default function NewSupervisorReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [academicSession, setAcademicSession] = useState(defaultAcademicSession());
  const [semester, setSemester] = useState<typeof SEMESTERS[number]>("FIRST");
  const [lectureResponse, setLectureResponse] = useState(80);
  const [assignmentResponse, setAssignmentResponse] = useState(80);
  const [quizResponse, setQuizResponse] = useState(80);
  const [courseworkResponse, setCourseworkResponse] = useState(80);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [facultiesRes, departmentsRes] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/departments"),
        ]);

        if (!facultiesRes.ok || !departmentsRes.ok) {
          setMessage("Unable to load reporting options.");
          return;
        }

        const facultiesData = await facultiesRes.json();
        const departmentsData = await departmentsRes.json();
        setFaculties(facultiesData);
        setDepartments(departmentsData);
        setFacultyId(facultiesData[0]?._id ?? "");
        setDepartmentId(departmentsData[0]?._id ?? "");
      } catch {
        setMessage("Unable to load reporting options.");
      }
    }

    loadOptions();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      facultyId,
      departmentId,
      academicSession: normalizeAcademicSession(academicSession),
      semester,
      studentResponseToLecturesPct: lectureResponse,
      studentResponseToAssignmentsPct: assignmentResponse,
      studentResponseToQuizPct: quizResponse,
      studentResponseToCourseworkPct: courseworkResponse,
      comments,
      status: "SUBMITTED",
    };

    const response = await fetch("/api/reports/supervisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = await response.json();
      setMessage(result.message || "Unable to save supervisor report.");
      setLoading(false);
      return;
    }

    const report = await response.json();
    router.push(`/dashboard/supervisor-report/${report._id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Supervisor report</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">New Supervisor Review</h1>
        <p className="mt-2 text-sm text-slate-500">Submit department-level student response and workload quality metrics.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Faculty
            <select value={facultyId} onChange={(event) => setFacultyId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {faculties.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>{faculty.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Department
            <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {departments.map((department) => (
                <option key={department._id} value={department._id}>{department.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Academic session
            <input
              value={academicSession}
              onChange={(event) => setAcademicSession(event.target.value)}
              required
              placeholder="2025/2026"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Semester
            <select value={semester} onChange={(event) => setSemester(event.target.value as typeof SEMESTERS[number])} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {SEMESTERS.map((value) => (
                <option key={value} value={value}>{value === "FIRST" ? "First" : "Second"}</option>
              ))}
            </select>
          </label>

          <div className="space-y-2 text-sm font-medium text-slate-700">
            <span>Submitted by</span>
            <input
              value={session?.user?.name ?? "Loading..."}
              disabled
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-600"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <PercentageRating label="Student response to lectures" value={lectureResponse} onChange={setLectureResponse} />
          <PercentageRating label="Student response to assignments" value={assignmentResponse} onChange={setAssignmentResponse} />
          <PercentageRating label="Student response to quizzes" value={quizResponse} onChange={setQuizResponse} />
          <PercentageRating label="Student response to coursework" value={courseworkResponse} onChange={setCourseworkResponse} />
        </div>

        <label className="mt-6 block space-y-2 text-sm font-medium text-slate-700">
          Additional comments
          <textarea
            rows={5}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Provide qualitative context for the ratings."
          />
        </label>

        {message ? <p className="mt-4 text-sm text-rose-600">{message}</p> : null}

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Saving..." : "Submit supervisor report"}
          </button>
        </div>
      </form>
    </div>
  );
}
