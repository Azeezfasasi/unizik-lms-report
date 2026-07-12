import Link from "next/link";

const features = [
  { title: "Faculty and departments", description: "Organize academic structure, owners, and department programmes." },
  { title: "Lectures & exam timetable", description: "Stay on top of course schedules and reporting milestones." },
  { title: "Export to PDF or Excel", description: "Generate one-tap summaries suitable for review or submission." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-teal-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-teal-300">
                Postgraduate School
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Postgraduate LMS Report Portal
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Track curriculum, lectures, exam timetables, and generate reports in one modern academic portal designed for both mobile and desktop.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/login" className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100">
                Login to portal
              </Link>
              <Link href="/dashboard" className="inline-flex justify-center rounded-full border border-slate-700 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-teal-500 hover:text-white">
                Learn more
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">{feature.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl sm:p-8">
            <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-6">
              <div className="flex items-center justify-between rounded-3xl bg-slate-900 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-teal-300">Unizik LMS</p>
                  <p className="mt-2 text-xl font-semibold text-white">Academic Reporting</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-slate-950">U</div>
              </div>

              <div className="mt-8 space-y-5">
                <div className="rounded-3xl bg-slate-900/95 p-5">
                  <p className="text-sm font-semibold text-teal-300">What you can do</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-400">
                    <li>• Monitor courses, reports, and academic workflows</li>
                    <li>• Manage faculty, departments, and curriculum details</li>
                    <li>• Export submission-ready PDF/Excel summaries</li>
                  </ul>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/95 p-4">
                    <p className="text-sm text-slate-400">Mobile-first layout</p>
                    <p className="mt-2 text-sm font-semibold text-white">Clean card stack for small screens</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/95 p-4">
                    <p className="text-sm text-slate-400">Action-ready</p>
                    <p className="mt-2 text-sm font-semibold text-white">Login, explore modules, and review data quickly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
