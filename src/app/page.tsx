import Link from "next/link";
// import { Topbar } from "@/components/layout/Topbar";

const features = [
  { title: "Faculty and departments", description: "Organize the full academic structure" },
  { title: "Lectures and exam timetable", description: "Keep every schedule in sync" },
  { title: "Export to PDF or Excel", description: "One-tap general reports" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* <Topbar /> */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">Postgraduate school</span>
            <h1 className="mt-6 text-4xl font-bold leading-tight">One portal for postgraduate reporting</h1>
            <p className="mt-4 max-w-lg text-base text-slate-600">Manage faculties, curriculum, lecture calendars, and examination timetables, then generate and export general reports in a click.</p>

            <div className="mt-8 flex items-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">Get started</Link>
              <Link href="#features" className="inline-flex items-center rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700">See how it works</Link>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">General report preview</h3>
                <button className="text-slate-400">📄</button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">Curriculum<br/><span className="font-semibold">M.Sc CS</span></div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">Exams<br/><span className="font-semibold">6 scheduled</span></div>
              </div>

              <div className="mt-6 h-28 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-semibold">18</p>
              <p className="text-sm text-slate-500">Faculties</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">126</p>
              <p className="text-sm text-slate-500">Departments</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">4.2k</p>
              <p className="text-sm text-slate-500">Reports filed</p>
            </div>
          </div>
        </div>

        <section id="features" className="mt-10 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-3 h-10 w-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">🏫</div>
              <h4 className="text-base font-semibold">{f.title}</h4>
              <p className="mt-2 text-sm text-slate-500">{f.description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
