"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AcademicSessionSelect } from "@/components/shared/AcademicSessionSelect";
import { Spinner } from "@/components/ui/Spinner";

interface FacultyOption {
  _id: string;
  name: string;
}

interface DepartmentOption {
  _id: string;
  name: string;
  facultyId?: string;
}

interface CurriculumOption {
  _id: string;
  programName: string;
  departmentId?: string;
}

interface StudentOption {
  _id: string;
  fullName: string;
  matricNumber: string;
  curriculumId?: string;
}

const SEMESTERS = ["FIRST", "SECOND"] as const;

export default function NewSupervisorReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState<typeof SEMESTERS[number]>("FIRST");
  const [projectTitle, setProjectTitle] = useState("");
  const [milestone, setMilestone] = useState("");
  const [progressSummary, setProgressSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [facultiesRes, departmentsRes, curriculumsRes] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/departments"),
          fetch("/api/curriculum"),
        ]);

        if (!facultiesRes.ok || !departmentsRes.ok || !curriculumsRes.ok) {
          setMessage("Unable to load reporting options.");
          return;
        }

        const facultiesData = await facultiesRes.json();
        const departmentsData = await departmentsRes.json();
        const curriculumsData = await curriculumsRes.json();
        setFaculties(facultiesData);
        setDepartments(departmentsData);
        setCurriculums(curriculumsData);
        setFacultyId(facultiesData[0]?._id ?? "");
        setDepartmentId(departmentsData[0]?._id ?? "");
      } catch {
        setMessage("Unable to load reporting options.");
      }
    }

    loadOptions();
  }, []);

  const filteredCurriculums = useMemo(
    () => curriculums.filter((curriculum) => curriculum.departmentId === departmentId),
    [curriculums, departmentId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      if (!departmentId) {
        setStudents([]);
        setStudentId("");
        return;
      }

      try {
        const response = await fetch(`/api/students?departmentId=${departmentId}`);
        const data = await response.json();
        if (cancelled) return;
        const list: StudentOption[] = Array.isArray(data)
          ? data.filter((student) => !curriculumId || student.curriculumId === curriculumId)
          : [];
        setStudents(list);
        setStudentId((current) => (list.some((student) => student._id === current) ? current : ""));
      } catch {
        if (!cancelled) {
          setStudents([]);
          setStudentId("");
        }
      }
    }

    loadStudents();
    return () => {
      cancelled = true;
    };
  }, [departmentId, curriculumId]);

  function handleDepartmentChange(nextDepartmentId: string) {
    setDepartmentId(nextDepartmentId);
    setCurriculumId("");
    setStudentId("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!curriculumId) {
      setMessage("Select a curriculum before submitting this report.");
      return;
    }

    if (!projectTitle.trim() || !milestone.trim() || !progressSummary.trim()) {
      setMessage("Provide the project or thesis title, milestone, and progress summary.");
      return;
    }

    setLoading(true);

    const payload = {
      facultyId,
      departmentId,
      curriculumId,
      studentId: studentId || undefined,
      academicSession,
      semester,
      projectTitle,
      milestone,
      progressSummary,
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
        <p className="mt-2 text-sm text-slate-500">Submit a Project or Thesis supervision progress report.</p>
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
            <select value={departmentId} onChange={(event) => handleDepartmentChange(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {departments.map((department) => (
                <option key={department._id} value={department._id}>{department.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Curriculum
            <select
              value={curriculumId}
              onChange={(event) => setCurriculumId(event.target.value)}
              disabled={!filteredCurriculums.length}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="">Select curriculum</option>
              {filteredCurriculums.map((curriculum) => (
                <option key={curriculum._id} value={curriculum._id}>{curriculum.programName}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Student (optional)
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)} disabled={!curriculumId || students.length === 0} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:text-slate-400">
              <option value="">Select student</option>
              {students.map((student) => <option key={student._id} value={student._id}>{student.fullName} ({student.matricNumber})</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Academic session
            <AcademicSessionSelect
              value={academicSession}
              onChange={setAcademicSession}
              autoSelectCurrent
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
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Project or Thesis title
            <input required value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Current milestone
            <input required value={milestone} onChange={(event) => setMilestone(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Proposal, literature review, data collection..." />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Progress summary
            <textarea required rows={5} value={progressSummary} onChange={(event) => setProgressSummary(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
        </div>

        {message ? <p className="mt-4 text-sm text-rose-600">{message}</p> : null}

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading || !curriculumId || !projectTitle.trim() || !milestone.trim() || !progressSummary.trim()} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Saving...
              </>
            ) : (
              "Submit supervisor report"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
