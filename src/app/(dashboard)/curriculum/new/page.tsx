'use client';

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface DepartmentOption {
  id: string;
  name: string;
}

export default function NewCurriculumPage() {
  const router = useRouter();
  const [programName, setProgramName] = useState("");
  const [level, setLevel] = useState("MSc");
  const [version, setVersion] = useState("1.0");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDepartments() {
      try {
        const response = await fetch("/api/departments");
        if (!response.ok) return;
        const data = await response.json();
        setDepartments(data.map((department: { _id: string; name: string }) => ({
          id: department._id,
          name: department.name,
        })));
        if (data.length > 0) setDepartmentId(data[0]._id);
      } catch {
        // ignore load failure, user can still type a valid value
      }
    }

    loadDepartments();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Saving curriculum...");

    const response = await fetch("/api/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programName, level, version, departmentId }),
    });

    if (response.ok) {
      setMessage("Curriculum created successfully.");
      router.push("/curriculum");
      router.refresh();
      return;
    }

    setMessage("Unable to create curriculum right now.");
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Curriculum</p>
        <h2 className="text-2xl font-semibold text-slate-900">Create curriculum</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Program name</label>
          <input value={programName} onChange={(event) => setProgramName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="e.g. M.Sc Computer Science" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Level</label>
            <input value={level} onChange={(event) => setLevel(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Version</label>
            <input value={version} onChange={(event) => setVersion(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
          <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
            {departments.length > 0 ? (
              departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))
            ) : (
              <option value="">Select a department</option>
            )}
          </select>
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save curriculum</button>
      </form>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
