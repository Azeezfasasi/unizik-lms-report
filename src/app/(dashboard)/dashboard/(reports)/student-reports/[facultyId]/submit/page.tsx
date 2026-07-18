import Link from "next/link";
import { StepperNav } from "@/components/shared/StepperNav";
import { ExportButtons } from "@/components/shared/ExportButtons";
import { getFacultyById } from "@/lib/data/portal";

export default async function SubmitReportPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = await params;
  const faculty = await getFacultyById(facultyId);

  if (!faculty) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Faculty not found.</div>;
  }

  return (
    <div className="space-y-6">
      <StepperNav currentStep={5} facultyId={faculty.id} />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Step 5</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Finalize and export {faculty.name} report</h2>
        <p className="mt-3 text-sm text-slate-600">Complete the submission workflow, share the report with administration, and export the package for review.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Submission checklist</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>• Curriculum review completed</li>
            <li>• Lecture calendar confirmed</li>
            <li>• Examination timetable verified</li>
            <li>• General summary reviewed</li>
          </ul>
          <div className="mt-6">
            <Link href="/dashboard/reports" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
              Mark as submitted
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Export package</h3>
          <p className="mt-3 text-sm text-slate-600">Generate ready-to-share PDF and Excel bundles for the administrative review team.</p>
          <div className="mt-6">
            <ExportButtons reportId={`report-${faculty.id}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
