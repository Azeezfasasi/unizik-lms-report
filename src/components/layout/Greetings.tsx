"use client";

import { useMemo } from "react";

interface GreetingsProps {
  name?: string;
}

const getTimeGreeting = (hour: number) => {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Greetings({ name }: GreetingsProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return getTimeGreeting(hour);
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Welcome</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
        {greeting}{name ? ` ${name}` : ""}, <span className="text-[17px] md:text-[20px]">welcome to your dashboard</span>.
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Use this space to create feedback reports, view submitted reports, and download your submitted report.
      </p>
    </div>
  );
}
