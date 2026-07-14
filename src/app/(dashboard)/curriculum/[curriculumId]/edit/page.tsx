'use client';

import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState } from "react";

export default function EditCurriculumPage({ params }: { params: Promise<{ curriculumId: string }> }) {
  const { curriculumId } = use(params);
  const router = useRouter();
  const [programName, setProgramName] = useState("");
  const [level, setLevel] = useState("");
  const [version, setVersion] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCurriculum() {
      const response = await fetch(`/api/curriculum/${curriculumId}`);
      const data = await response.json();
      setProgramName(data.programName ?? "");
      setLevel(data.level ?? "");
      setVersion(data.version ?? "");
    }

    loadCurriculum();
  }, [curriculumId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Updating curriculum...");

    const response = await fetch(`/api/curriculum/${curriculumId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programName, level, version }),
    });

    if (response.ok) {
      setMessage("Curriculum updated successfully.");
      router.push("/curriculum");
      router.refresh();
      return;
    }

    setMessage("Unable to update curriculum right now.");
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Curriculum</p>
        <h2 className="text-2xl font-semibold text-slate-900">Edit curriculum</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Program name</label>
          <input value={programName} onChange={(event) => setProgramName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
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
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Update curriculum</button>
      </form>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
