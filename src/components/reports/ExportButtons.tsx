"use client";

const FORMATS = [
  { key: "pdf", label: "PDF" },
  { key: "docx", label: "Word" },
  { key: "xlsx", label: "Excel" },
];

export function ExportButtons({
  type,
  id,
}: {
  type: "student" | "lms-rep" | "coordinator" | "examiner";
  id: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.map((format) => (
        <a
          key={format.key}
          href={`/api/export/${format.key}/${type}/${id}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          {format.label}
        </a>
      ))}
    </div>
  );
}
