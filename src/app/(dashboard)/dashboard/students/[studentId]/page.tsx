'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

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
  const [message, setMessage] = useState("");

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
    }

    loadStudent();
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
      router.push(`/students/${studentId}`);
      router.refresh();
      return;
    }

    setMessage("Unable to update student right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Student</p>
        <h2 className="text-2xl font-semibold text-slate-900">Edit student</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Matric number</label>
            <input value={matricNumber} onChange={(event) => setMatricNumber(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Faculty ID</label>
            <input value={facultyId} onChange={(event) => setFacultyId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department ID</label>
            <input value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Curriculum ID</label>
            <input value={curriculumId} onChange={(event) => setCurriculumId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Program level</label>
            <input value={programLevel} onChange={(event) => setProgramLevel(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save changes</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
