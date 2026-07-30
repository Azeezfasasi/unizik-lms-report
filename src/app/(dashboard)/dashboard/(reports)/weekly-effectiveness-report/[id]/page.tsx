import { connectDB } from "@/lib/db/connectDB";
import WeeklyEffectivenessReport from "@/models/WeeklyEffectivenessReport";
import "@/models/AcademicWeek";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { ExportButtons } from "@/components/reports/ExportButtons";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CircleArrowLeft, Edit2 } from "lucide-react";

export default async function WeeklyEffectivenessReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const report = await WeeklyEffectivenessReport.findById(id)
    .populate("curriculumId", "programName")
    .populate("courseId", "title code")
    .populate("preparedBy", "name")
    .populate("weeklyEntries.weekId", "weekNumber startDate endDate label")
    .lean();

  if (!report) notFound();
  const r = report as {
    _id: string;
    curriculumId?: { programName?: string };
    courseId?: { title?: string; code?: string };
    preparedBy?: { name?: string };
    status?: string;
    academicSession?: string;
    semester?: string;
    weeklyEntries?: Array<{
      weekId?: { weekNumber?: number; startDate?: string; endDate?: string; label?: string };
      lecturerEffectivenessRating?: number;
      studentEffectivenessRating?: number;
      remarks?: string;
    }>;
    avgLecturerEffectiveness?: number;
    avgStudentEffectiveness?: number;
    generalComments?: string;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/weekly-effectiveness-report" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <CircleArrowLeft className="h-4 w-4" />
          Back to Weekly Effectiveness Reports
        </Link>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{r.courseId?.title}</h2>
            <ReportStatusBadge status={r.status ?? "DRAFT"} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{r.courseId?.code} · {r.curriculumId?.programName} · {r.academicSession} · {r.semester === "FIRST" ? "First" : "Second"} semester · prepared by {r.preparedBy?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/weekly-effectiveness-report/${r._id.toString()}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-500 hover:text-teal-600"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Link>
          <DeleteResourceButton
            deleteUrl={`/api/reports/weekly-effectiveness/${r._id.toString()}`}
            resourceName="weekly effectiveness report"
            redirectTo="/dashboard/weekly-effectiveness-report"
          />
          <ExportButtons type="weekly-effectiveness" id={r._id.toString()} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Avg. lecturer effectiveness</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{r.avgLecturerEffectiveness ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Avg. student effectiveness</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{r.avgStudentEffectiveness ?? 0}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Weekly breakdown</h3>
        <div className="mt-4 space-y-2">
          {(r.weeklyEntries ?? []).map((entry, index: number) => (
            <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  Week {entry.weekId?.weekNumber}{entry.weekId?.label ? ` — ${entry.weekId.label}` : ""}
                </span>
                <span className="text-xs text-slate-500">
                  {entry.weekId?.startDate ? new Date(entry.weekId.startDate).toLocaleDateString() : "-"} – {entry.weekId?.endDate ? new Date(entry.weekId.endDate).toLocaleDateString() : "-"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold">
                <span className="text-teal-700">Lecturer: {entry.lecturerEffectivenessRating ?? 0}%</span>
                <span className="text-indigo-700">Student: {entry.studentEffectivenessRating ?? 0}%</span>
              </div>
              {entry.remarks ? <p className="mt-2 text-sm text-slate-600">{entry.remarks}</p> : null}
            </div>
          ))}
        </div>
      </div>

      {r.generalComments ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900">General comments</h3>
          <p className="mt-2 text-sm text-slate-600">{r.generalComments}</p>
        </div>
      ) : null}
    </div>
  );
}
