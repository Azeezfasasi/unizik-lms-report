'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function EditUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [facultyId, setFacultyId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setName(data.name || "");
      setEmail(data.email || "");
      setRole(data.role || "STUDENT");
      setFacultyId(data.facultyId || "");
    }

    loadUser();
  }, [userId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Updating user...");

    const payload: Record<string, string> = { name, email, role, facultyId };
    if (password.trim()) {
      payload.password = password;
    }

    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setMessage("User updated successfully.");
      router.push(`/users/${userId}`);
      router.refresh();
      return;
    }

    setMessage("Unable to update user right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">User</p>
        <h2 className="text-2xl font-semibold text-slate-900">Edit user</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Leave blank to keep current password" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option value="ADMIN">ADMIN</option>
              <option value="FACULTY_OFFICER">FACULTY_OFFICER</option>
              <option value="EXAMINER">EXAMINER</option>
              <option value="STUDENT">STUDENT</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Faculty ID</label>
          <input value={facultyId} onChange={(event) => setFacultyId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Optional" />
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save user</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
