'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";

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

export default function EditStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [programLevel, setProgramLevel] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [message, setMessage] = useState("");
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);

  useEffect(() => {
    async function loadStudent() {
      const response = await fetch(`/api/students/${studentId}`);
      const data = await response.json();
      setMatricNumber(data.matricNumber || "");
      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setFacultyId(data.facultyId || "");
      setDepartmentId(data.departmentId || "");
      setCurriculumId(data.curriculumId || "");
      setProgramLevel(data.programLevel || "");
      setStatus(data.status || "ACTIVE");
    }

    async function loadLookups() {
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

        setFaculties(facultiesData.map((faculty: { _id: string; name: string }) => ({ id: faculty._id, name: faculty.name })));
        setDepartments(departmentsData.map((department: { _id: string; name: string; facultyId: string }) => ({ id: department._id, name: department.name, facultyId: department.facultyId })));
        setCurriculums(curriculumsData.map((curriculum: { _id: string; programName: string; departmentId: string }) => ({ id: curriculum._id, programName: curriculum.programName, departmentId: curriculum.departmentId })));
      } catch {
        // ignore fetch failure
      }
    }

    loadStudent();
    loadLookups();
  }, [studentId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Updating student...");

    const response = await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricNumber, fullName, email, facultyId, departmentId, curriculumId, programLevel }),
    });

    if (response.ok) {
      setMessage("Student updated successfully.");
      router.push(`/dashboard/students/${studentId}`);
      router.refresh();
      return;
    }

    setMessage("Unable to update student right now.");
  }

  async function handleStatusChange() {
    const nextStatus = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setMessage(`${status === "ACTIVE" ? "Suspending" : "Activating"} student...`);

    const response = await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (response.ok) {
      setStatus(nextStatus);
      setMessage(`Student ${nextStatus.toLowerCase()} successfully.`);
      router.refresh();
      return;
    }

    setMessage("Unable to update student status right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Student</p>
          <h2 className="text-2xl font-semibold text-slate-900">Edit student</h2>
          <p className="mt-2 text-sm text-slate-500">Manage student details, suspend or remove the student record.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : status === "SUSPENDED" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
            {status}
          </span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Registration number</label>
            <input value={matricNumber} onChange={(event) => setMatricNumber(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} readOnly className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
            <div className="relative">
              <select
                value={facultyId}
                onChange={(event) => setFacultyId(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              >
                <option value="">Select a faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
            <div className="relative">
              <select
                value={departmentId}
                onChange={(event) => setDepartmentId(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              >
                <option value="">Select a department</option>
                {departments
                  .filter((department) => department.facultyId === facultyId)
                  .map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Curriculum</label>
            <div className="relative">
              <select
                value={curriculumId}
                onChange={(event) => setCurriculumId(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              >
                <option value="">Select a curriculum</option>
                {curriculums
                  .filter((curriculum) => curriculum.departmentId === departmentId)
                  .map((curriculum) => (
                    <option key={curriculum.id} value={curriculum.id}>{curriculum.programName}</option>
                  ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Program level</label>
            <input value={programLevel} onChange={(event) => setProgramLevel(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save changes</button>
      </form>

      <div className="mt-6 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">Actions</h3>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleStatusChange()}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:bg-teal-50"
          >
            {status === "ACTIVE" ? "Suspend student" : "Activate student"}
          </button>
          <DeleteResourceButton deleteUrl={`/api/students/${studentId}`} resourceName="student" redirectTo="/dashboard/students" />
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
