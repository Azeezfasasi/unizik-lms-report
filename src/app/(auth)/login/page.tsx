'use client';

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Signing you in...");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage("Unable to sign in. Check your email, password and account status.");
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Secure sign-in</p>
      <h1 className="mt-3 text-3xl font-semibold">Sign in to the portal</h1>
      <p className="mt-2 text-sm text-slate-400">Use a registered, active account to access the dashboard and protected reporting tools.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0" placeholder="name@unizik.edu.ng" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0" placeholder="Enter your password" />
        </div>

        <button type="submit" className="w-full rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400">Sign in</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between text-sm text-slate-400">
        <Link href="/forgot-password" className="hover:text-teal-300">Forgot password?</Link>
        <Link href="/" className="hover:text-teal-300">Return home</Link>
      </div>
    </div>
  );
}
