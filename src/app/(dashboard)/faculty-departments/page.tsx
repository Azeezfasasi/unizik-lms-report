import Link from "next/link";
import { getFacultiesWithDepartments } from "@/lib/data/portal";

export default async function FacultyDepartmentsPage() {
  const { faculties } = await getFacultiesWithDepartments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Academic Structure</p>
          <h2 className="text-2xl font-semibold text-slate-900">Faculty and Department Management</h2>
        </div>
        <Link href="/faculty-departments/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add Faculty</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {faculties.map((faculty) => {
          const facultyId = faculty.id ?? String((faculty as { _id?: string | unknown })._id ?? "");
          return (
            <div key={facultyId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">{faculty.code}</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{faculty.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{faculty.description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">Dean</span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700">Dean: {faculty.dean}</p>
                <p className="mt-2 text-sm text-slate-600">Departments: {faculty.departments.join(", ")}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <Link href={`/faculty-departments/${facultyId}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600">View details</Link>
                <Link href={`/faculty-departments/${facultyId}/edit`} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Edit faculty</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
