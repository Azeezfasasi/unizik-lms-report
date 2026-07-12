import { notFound } from "next/navigation";
import { departments, getFacultyById } from "@/lib/mockData";

export default function FacultyDetailPage({ params }: { params: { facultyId: string } }) {
  const faculty = getFacultyById(params.facultyId);

  if (!faculty) {
    notFound();
  }

  const facultyDepartments = departments.filter((department) => department.facultyId === faculty.id);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Faculty Profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{faculty.name}</h2>
        <p className="mt-3 text-sm text-slate-600">{faculty.description}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
        <h3 className="text-lg font-semibold text-slate-900">Departments</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {facultyDepartments.map((department) => (
            <div key={department.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900">{department.name}</h4>
              <p className="mt-2 text-sm text-slate-600">HOD: {department.hod}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
