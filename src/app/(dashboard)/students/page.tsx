import Link from "next/link";
import { getStudents, StudentItem } from "@/lib/data/portal";

export default async function StudentsPage() {
  const students: StudentItem[] = await getStudents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Student Directory</p>
          <h2 className="text-2xl font-semibold text-slate-900">Programme Students</h2>
        </div>
        <Link href="/students/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          New student
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {students.map((student) => (
          <div key={student.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">{student.fullName}</h3>
            <p className="mt-2 text-sm text-slate-600">{student.matricNumber}</p>
            <p className="mt-2 text-sm text-slate-600">{student.email}</p>
            <p className="mt-2 text-sm text-slate-600">{student.programLevel}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
