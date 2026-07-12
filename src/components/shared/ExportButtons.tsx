import Link from "next/link";

interface ExportButtonsProps {
  reportId: string;
}

export function ExportButtons({ reportId }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href={`/api/export/pdf/${reportId}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        Export PDF
      </Link>
      <Link href={`/api/export/excel/${reportId}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600">
        Export Excel
      </Link>
    </div>
  );
}
