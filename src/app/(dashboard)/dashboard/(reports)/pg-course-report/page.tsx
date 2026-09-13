import Link from "next/link";
import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Faculty from "@/models/Faculty";
import Department from "@/models/Department";

export default async function PgCoordinatorReportListPage() {
  await connectDB();
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toUpperCase().trim();
  const associateProvostField = session?.user?.associateProvostField;
  let filter = {};
  if (role === "ASSOCIATE_PROVOST" && associateProvostField) {
    const faculties = await Faculty.find({ associateProvostField }).select("_id").lean();
    const departments = await Department.find({ facultyId: { $in: faculties.map((faculty) => faculty._id) } }).select("_id").lean();
    filter = { departmentId: { $in: departments.map((department) => department._id) } };
  }
  const reports = await CoordinatorReport.find(filter)
    .populate("curriculumId", "programName")
    .populate("preparedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reporting</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">PG Coordinator&apos;s Report</h2>
        </div>
        {role !== "ASSOCIATE_PROVOST" ? <Link href="/dashboard/pg-course-report/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Create Report
        </Link> : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          This is a list of all reports submitted by PG Cordinators. Click on a report to view its details.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report: (typeof reports)[number]) => (
          <Link key={report._id} href={`/dashboard/pg-course-report/${report._id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{report.curriculumId?.programName}</h3>
                <p className="mt-1 text-sm text-slate-500">{report.academicSession}</p>
              </div>
              <ReportStatusBadge status={report.status} />
            </div>
            <p className="mt-3 text-sm text-slate-500">Compliance rate {report.lectureComplianceRate}% · by {report.preparedBy?.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
