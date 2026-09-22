export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center lg:bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-5xl overflow-hidden rounded-4xl border border-white/10 bg-transparent lg:bg-white/10 shadow-[0_32px_120px_rgba(2,8,23,0.45)] backdrop-blur-xl"> 
        <div className="grid min-h-175 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden lg:flex flex-col justify-between rounded-4xl bg-slate-950/75 p-2 sm:p-10"> 
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-300">UNIZIK LMS</p>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Secure access for reporting and recovery.</h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">Use a single portal for login and password recovery with clear guidance and modern styling.</p>
            </div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">What you get</p>
              <ul className="mt-3 space-y-2 text-slate-300">
                <li>• Fast secure sign-in</li>
                <li>• Email-based password reset</li>
                <li>• Faculty-aware registration flow</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-center p-0 sm:p-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
