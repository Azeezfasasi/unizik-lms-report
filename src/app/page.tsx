import Link from "next/link";

const roles = ["Admin", "Faculty officer", "PG coordinator", "Examiner", "LMS rep", "Supervisor", "Student"];

function FacultyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
      <path d="M9 21V9h6v12" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

function CurriculumIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
      <path d="M6 4v18" />
      <path d="M18 6H6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <circle cx="9" cy="8" r="3.25" />
      <path d="M2.75 20a6.25 6.25 0 0 1 12.5 0" strokeLinecap="round" />
      <path d="M16 4.5a3.25 3.25 0 0 1 0 6.4M18.75 20a5.75 5.75 0 0 0-3-5.05" strokeLinecap="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M7.5 9.5 12 15l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  {
    icon: <FacultyIcon />,
    title: "Faculty & department structure",
    description: "Organize faculties, departments, and reporting lines in a single academic hierarchy.",
  },
  {
    icon: <CurriculumIcon />,
    title: "Curriculum & courses",
    description: "Maintain programme curricula, course units, and semester assignments with version history.",
  },
  {
    icon: <CalendarIcon />,
    title: "Academic sessions & weeks",
    description: "Define the reporting calendar so every submission is tied to the right session and week.",
  },
  {
    icon: <ClockIcon />,
    title: "Lectures & exam timetables",
    description: "Track lecture schedules and examination timetables, and flag delivery status as it happens.",
  },
  {
    icon: <UsersIcon />,
    title: "Role-based reporting",
    description: "Purpose-built workflows for examiners, LMS reps, supervisors, and PG coordinators.",
  },
  {
    icon: <ExportIcon />,
    title: "Export in one click",
    description: "Generate share-ready reports as PDF, Word, or Excel straight from the dashboard.",
  },
];

const steps = [
  { title: "Set up your structure", description: "Add faculties, departments, curricula, and academic sessions." },
  { title: "Collect submissions", description: "Examiners, LMS reps, and supervisors file reports against each academic week." },
  { title: "Review & export", description: "Approve, track compliance, and export polished reports for the PG school." },
];

export default function HomePage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-linear-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                UNIZIK Postgraduate School
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                One portal for postgraduate reporting
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                Manage faculties, curricula, lecture calendars, and examination timetables, then collect
                role-based reports and export them in a click &mdash; all in one place built for the PG school.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Go to dashboard
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                    <path d="M6.5 3.5L11 8L6.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Explore features
                </Link>
              </div>

              <div className="mt-10 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Built for every role</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Weekly effectiveness report</p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">M.Sc Computer Science &middot; Week 6</h3>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Approved
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
                    <p className="text-xs text-slate-500">Academic session</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">2025/2026</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
                    <p className="text-xs text-slate-500">Exams scheduled</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">6 this session</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    { label: "Lecturer effectiveness", value: 88 },
                    { label: "Student engagement", value: 74 },
                    { label: "Content delivery", value: 92 },
                  ].map((row) => (
                    <div key={row.label} className="rounded-xl border border-slate-100 px-3.5 py-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">{row.label}</span>
                        <span className="font-semibold text-slate-900">{row.value}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-teal-500" style={{ width: `${row.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-500">Export as</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">PDF</span>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">Word</span>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">Excel</span>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Everything in one workspace</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Built to run postgraduate reporting end to end
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            From academic structure to export-ready reports, every step of the reporting workflow lives in one
            portal instead of scattered spreadsheets and email threads.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Three steps from setup to sign-off</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-slate-950 px-8 py-10 sm:flex-row sm:items-center sm:px-12">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Ready to streamline postgraduate reporting?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Sign in to your dashboard or contact your administrator for access.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Go to dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-white transition hover:border-slate-500"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>&copy; {new Date().getFullYear()} UNIZIK Postgraduate School. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="transition hover:text-slate-700">Login</Link>
            <Link href="#features" className="transition hover:text-slate-700">Features</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
