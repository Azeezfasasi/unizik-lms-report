'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function EditFacultyPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [dean, setDean] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadFaculty() {
      const response = await fetch(`/api/faculties/${facultyId}`);
      const data = await response.json();
      setName(data.name || "");
      setCode(data.code || "");
      setDean(data.dean || "");
      setDescription(data.description || "");
    }

    loadFaculty();
  }, [facultyId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Updating faculty...");

    const response = await fetch(`/api/faculties/${facultyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, dean, description }),
    });

    if (response.ok) {
      setMessage("Faculty updated successfully.");
      router.push(`/faculty-departments/${facultyId}`);
      router.refresh();
      return;
    }

    setMessage("Unable to update faculty right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Faculty</p>
        <h2 className="text-2xl font-semibold text-slate-900">Edit faculty</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Code</label>
          <input value={code} onChange={(event) => setCode(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Dean</label>
          <input value={dean} onChange={(event) => setDean(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" rows={4} />
        </div>

        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save changes</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
