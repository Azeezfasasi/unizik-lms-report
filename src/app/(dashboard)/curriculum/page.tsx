import Link from "next/link";
import { getCurriculumsWithDepartment } from "@/lib/data/portal";

export default async function CurriculumPage() {
  const curriculums = await getCurriculumsWithDepartment();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Academic Planning</p>
          <h2 className="text-2xl font-semibold text-slate-900">Curriculum Library</h2>
        </div>
        <Link href="/curriculum/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Create curriculum</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {curriculums.map((curriculum) => (
          <div key={curriculum.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">{curriculum.level}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{curriculum.programName}</h3>
                <p className="mt-2 text-sm text-slate-600">{curriculum.department?.name ?? "Department"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">v{curriculum.version}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/curriculum/${curriculum.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600">Open curriculum</Link>
              <Link href={`/curriculum/${curriculum.id}/edit`} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Edit details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
