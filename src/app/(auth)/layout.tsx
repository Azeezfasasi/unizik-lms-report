export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.22),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] px-4 py-10 text-white">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-[0_32px_120px_rgba(2,8,23,0.45)] backdrop-blur-xl">
        <div className="grid min-h-[700px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-between bg-slate-950/70 p-8 sm:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-300">UNIZIK Postgraduate</p>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Academic reporting, streamlined for faculty and administration.</h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">Secure sign-in, reset workflows, and role-based reporting all live in one polished workspace designed for modern postgraduate operations.</p>
            </div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Why it works</p>
              <ul className="mt-3 space-y-2 text-slate-300">
                <li>• Active-user access only</li>
                <li>• Email-based password recovery</li>
                <li>• Dynamic dashboard and reporting tools</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-center p-8 sm:p-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
