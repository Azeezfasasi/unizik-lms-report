import Link from "next/link";

export default function RegisterPendingPage() {
  return (
    <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-8 w-8 text-teal-600">
            <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12.5" />
            <path d="M2 6l10 7 10-7" />
            <path d="M17 17a4 4 0 1 0 8 0 4 4 0 0 0-8 0" />
            <path d="M19.5 17.5l1 1 2-2" />
          </svg>
        </span>

        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-500">Account created</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">Check your email</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            We&apos;ve sent an activation link to your email address. Click the link in the email to activate your
            account before you can log in.
          </p>
        </div>

        <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-left text-sm text-amber-800">
          <p className="font-semibold">Didn&apos;t receive the email?</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-amber-700">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
          </ul>
        </div>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800"
          >
            Go to login
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            Register a different account
          </Link>
        </div>
      </div>
    </div>
  );
}
