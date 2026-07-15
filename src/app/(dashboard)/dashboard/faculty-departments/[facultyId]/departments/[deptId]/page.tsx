'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function EditDepartmentPage({ params }: { params: Promise<{ facultyId: string; deptId: string }> }) {
  const { facultyId, deptId } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [hod, setHod] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDepartment() {
      const response = await fetch(`/api/departments/${deptId}`);
      const data = await response.json();
      setName(data.name || "");
      setHod(data.hod || "");
    }

    loadDepartment();
  }, [deptId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Updating department...");

    const response = await fetch(`/api/departments/${deptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hod }),
    });

    if (response.ok) {
      setMessage("Department updated successfully.");
      router.push(`/dashboard/faculty-departments/${facultyId}`);
      router.refresh();
      return;
    }

    setMessage("Unable to update department right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Department</p>
        <h2 className="text-2xl font-semibold text-slate-900">Edit department</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Department name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Head of Department</label>
          <input value={hod} onChange={(event) => setHod(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save changes</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
