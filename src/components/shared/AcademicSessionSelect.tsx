"use client";

import { useEffect, useState } from "react";

interface AcademicSessionOption {
  _id: string;
  name: string;
  isCurrent?: boolean;
}

export function AcademicSessionSelect({
  value,
  onChange,
  required = true,
  autoSelectCurrent = false,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoSelectCurrent?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [sessions, setSessions] = useState<AcademicSessionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        const response = await fetch("/api/academic-sessions");
        const data = await response.json();
        if (cancelled) return;
        setSessions(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!autoSelectCurrent || value || sessions.length === 0) return;
    const preferred = sessions.find((session) => session.isCurrent) ?? sessions[0];
    if (preferred) onChange(preferred.name);
  }, [autoSelectCurrent, value, sessions, onChange]);

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={loading}
      className={className ?? "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"}
    >
      <option value="">{loading ? "Loading sessions…" : placeholder ?? (required ? "Select academic session" : "All sessions")}</option>
      {sessions.map((session) => (
        <option key={session._id} value={session.name}>
          {session.name}
          {session.isCurrent ? " (Current)" : ""}
        </option>
      ))}
    </select>
  );
}
