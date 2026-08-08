"use client";

import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface BreakdownSlice {
  label: string;
  value: number;
}

// Fixed categorical order — colorblind-safe, validated with the palette checker.
const CATEGORICAL_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

function useTotal(slices: BreakdownSlice[]) {
  return useMemo(() => slices.reduce((sum, slice) => sum + slice.value, 0), [slices]);
}

function CustomTooltip({ active, payload, total }: { active?: boolean; payload?: { name: string; value: number }[]; total: number }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{entry.name}</p>
      <p className="mt-0.5 text-slate-500">
        {entry.value.toLocaleString()} ({pct}%)
      </p>
    </div>
  );
}

function AnalyticsPieCard({ title, description, slices }: { title: string; description: string; slices: BreakdownSlice[] }) {
  const total = useTotal(slices);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p>

      {total === 0 ? (
        <div className="mt-5 flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
          <p className="text-sm text-slate-400">No data available yet</p>
        </div>
      ) : (
        <div className="relative mt-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                cornerRadius={4}
                stroke="#ffffff"
                strokeWidth={2}
                labelLine={false}
                label={({ percent }) => (percent && percent >= 0.08 ? `${Math.round(percent * 100)}%` : "")}
              >
                {slices.map((slice, index) => (
                  <Cell key={slice.label} fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "#52514e", paddingTop: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-x-0 top-[104px] flex flex-col items-center">
            <span className="text-xl font-semibold text-slate-900">{total.toLocaleString()}</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Total</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalyticsPieCharts({
  reportsByType,
  usersByRole,
  studentsByFaculty,
}: {
  reportsByType: BreakdownSlice[];
  usersByRole: BreakdownSlice[];
  studentsByFaculty: BreakdownSlice[];
}) {
  return (
    <section className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      <AnalyticsPieCard title="Reports by Type" description="Distribution of all reports submitted across the portal." slices={reportsByType} />
      <AnalyticsPieCard title="Students by Faculty" description="How the student population is spread across faculties." slices={studentsByFaculty} />
      <AnalyticsPieCard title="Users by Role" description="Breakdown of portal accounts by assigned role." slices={usersByRole} />
    </section>
  );
}
