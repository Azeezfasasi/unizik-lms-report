'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface FacultyOption {
  id: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  name: string;
  facultyId: string;
}

function SelectChevron() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function EditUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [associateProvostField, setAssociateProvostField] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const availableDepartments = departments.filter((department) => department.facultyId === facultyId);

  useEffect(() => {
    async function loadData() {
      try {
        const [userResponse, facultiesResponse, departmentsResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch("/api/faculties"),
          fetch("/api/departments"),
        ]);
        const [data, facultiesData, departmentsData] = await Promise.all([
          userResponse.json(),
          facultiesResponse.json(),
          departmentsResponse.json(),
        ]);

        setName(data.name || "");
        setEmail(data.email || "");
        setRole(data.role || "STUDENT");
        setFacultyId(data.facultyId ? String(data.facultyId) : "");
        setDepartmentId(data.departmentId ? String(data.departmentId) : "");
        setAssociateProvostField(data.associateProvostField || "");
        setFaculties(facultiesData.map((faculty: { _id: string; name: string }) => ({ id: faculty._id, name: faculty.name })));
        setDepartments(departmentsData.map((department: { _id: string; name: string; facultyId: string }) => ({
          id: department._id,
          name: department.name,
          facultyId: String(department.facultyId),
        })));
      } finally {
        setOptionsLoading(false);
      }
    }

    loadData();
  }, [userId]);

  function handleFacultyChange(value: string) {
    setFacultyId(value);
    if (!departments.some((department) => department.id === departmentId && department.facultyId === value)) {
      setDepartmentId("");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("Updating user...");

    try {
      const payload: Record<string, string> = { name, email, role, facultyId, departmentId, associateProvostField };
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
        router.push("/dashboard/users");
        router.refresh();
        return;
      }

      setMessage("Unable to update user right now.");
    } finally {
      setSubmitting(false);
    }
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
              <option value="LMS_REP">LMS REP</option>
              <option value="PG_COORDINATOR">PG COORDINATOR</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="DIRECTOR">DIRECTOR</option>
              <option value="HOD">HOD</option>
              <option value="DEAN">DEAN</option>
              <option value="SUB_DEAN">SUB_DEAN</option>
              <option value="ASSOCIATE_PROVOST">ASSOCIATE_PROVOST</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
          <div className="relative">
            <select value={facultyId} onChange={(event) => handleFacultyChange(event.target.value)} disabled={optionsLoading} className="w-full appearance-none rounded-2xl border border-slate-300 px-4 py-3 pr-10 text-sm disabled:cursor-wait disabled:text-slate-400">
              <option value="">{optionsLoading ? "Loading faculties..." : "No faculty"}</option>
              {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
            </select>
            <SelectChevron />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
            <div className="relative">
              <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} disabled={optionsLoading || !facultyId} className="w-full appearance-none rounded-2xl border border-slate-300 px-4 py-3 pr-10 text-sm disabled:cursor-wait disabled:text-slate-400">
                <option value="">{optionsLoading ? "Loading departments..." : !facultyId ? "Select a faculty first" : availableDepartments.length ? "No department" : "No departments available"}</option>
                {availableDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select>
              <SelectChevron />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Associate Provost field</label>
            <select value={associateProvostField} onChange={(event) => setAssociateProvostField(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option value="">No field</option>
              <option value="HEALTH">HEALTH</option>
              <option value="SCIENCES">SCIENCES</option>
              <option value="HUMANITIES">HUMANITIES</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" />
              Saving...
            </>
          ) : (
            "Save user"
          )}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
