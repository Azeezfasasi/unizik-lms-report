"use client";

export function PercentageRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <div className="flex items-center gap-4 rounded-2xl border border-slate-300 bg-white px-4 py-3">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full"
        />
        <span className="min-w-12 text-right text-sm font-semibold text-slate-900">{value}%</span>
      </div>
    </label>
  );
}
