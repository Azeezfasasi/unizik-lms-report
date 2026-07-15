'use client';

import { useState, FormEvent, use } from "react";
import { useRouter } from "next/navigation";

export default function NewDepartmentPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [hod, setHod] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Creating department...");

    const response = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hod, facultyId }),
    });

    if (response.ok) {
      setMessage("Department created successfully.");
      router.push(`/dashboard/faculty-departments/${facultyId}`);
      router.refresh();
      return;
    }

    setMessage("Unable to create department right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Department</p>
        <h2 className="text-2xl font-semibold text-slate-900">Add department</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Department name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Computer Science" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Head of Department</label>
          <input value={hod} onChange={(event) => setHod(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Dr. Emeka Uche" />
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Create department</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
