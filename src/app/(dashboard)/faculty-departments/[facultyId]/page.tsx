import Link from "next/link";
import { notFound } from "next/navigation";
import { getDepartmentsByFacultyId, getFacultyById } from "@/lib/data/portal";

export default async function FacultyDetailPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = await params;
  const faculty = await getFacultyById(facultyId);
  if (!faculty) {
    notFound();
  }

  const facultyDepartments = await getDepartmentsByFacultyId(facultyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Faculty Profile</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{faculty.name}</h2>
          <p className="mt-3 text-sm text-slate-600">{faculty.description}</p>
        </div>
        <Link href={`/faculty-departments/${facultyId}/departments/new`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Add department
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Faculty Code</p>
            <p className="mt-1 text-slate-900">{faculty.code}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Dean</p>
            <p className="mt-1 text-slate-900">{faculty.dean}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Departments</h3>
          <span className="text-sm text-slate-500">{facultyDepartments.length} departments</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {facultyDepartments.map((department) => (
            <div key={department.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900">{department.name}</h4>
                  <p className="mt-2 text-sm text-slate-600">HOD: {department.hod}</p>
                </div>
                <Link href={`/faculty-departments/${facultyId}/departments/${department.id}`} className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold uppercase text-white hover:bg-teal-700">
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
