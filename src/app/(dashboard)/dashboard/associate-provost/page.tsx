import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getAssociateProvostSummary } from "@/lib/data/portal";
import { PrintSummaryButton } from "@/components/reports/PrintSummaryButton";
import { connectDB } from "@/lib/db/connectDB";
import User from "@/models/User";
import Faculty from "@/models/Faculty";

const FIELDS = ["HEALTH", "SCIENCES", "HUMANITIES"] as const;

function normalizeRole(value?: string) {
  return value?.normalize("NFKC").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export default async function AssociateProvostPage({ searchParams }: { searchParams: Promise<{ academicSession?: string; field?: string }> }) {
  const session = await getServerSession(authOptions);
  await connectDB();
  const currentUser = session?.user?.id ? await User.findById(session.user.id).select("role associateProvostField facultyId").lean() : null;
  const assignedFaculty = currentUser?.facultyId
    ? await Faculty.findById(currentUser.facultyId).select("associateProvostField").lean()
    : null;
  const role = normalizeRole(String(currentUser?.role ?? session?.user?.role ?? ""));
  if (role !== "ADMIN" && role !== "ASSOCIATEPROVOST") redirect("/dashboard");

  const params = await searchParams;
  const requestedField = (currentUser?.associateProvostField ?? assignedFaculty?.associateProvostField) as typeof FIELDS[number] | undefined;
  const adminField = FIELDS.includes(params.field as typeof FIELDS[number]) ? params.field as typeof FIELDS[number] : undefined;
  const field = role === "ADMIN" ? adminField ?? "HEALTH" : requestedField;

  if (!field) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Associate Provost account</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Field assignment required</h1>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Your account has Associate Provost access, but no field has been assigned yet. Ask an administrator to assign Health, Sciences, or Humanities to your account, then sign in again.
        </p>
      </div>
    );
  }

  const summary = await getAssociateProvostSummary(field, params.academicSession);
  const entries = Object.entries(summary.statusCounts);

  return (
    <div className="space-y-6 print:space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Associate Provost oversight</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{field} reporting summary</h1>
          <p className="mt-1 text-sm text-slate-500">Weekly reports across {summary.departmentCount} department(s), including pending and rejected submissions.</p>
        </div>
        <PrintSummaryButton />
      </div>
      <form className="flex flex-wrap gap-3 print:hidden">
        {role === "ADMIN" ? <select name="field" defaultValue={field} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="HEALTH">Health</option><option value="SCIENCES">Sciences</option><option value="HUMANITIES">Humanities</option></select> : null}
        <input name="academicSession" defaultValue={params.academicSession ?? ""} placeholder="Academic session, e.g. 2026/2027" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Apply</button>
      </form>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs uppercase tracking-wide text-slate-500">Total reports</p><p className="mt-2 text-3xl font-semibold">{summary.totalReports}</p></div>
        {entries.map(([status, count]) => <div key={status} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs uppercase tracking-wide text-slate-500">{status.replace(/_/g, " ")}</p><p className="mt-2 text-3xl font-semibold">{count}</p></div>)}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Covered faculties</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{summary.faculties.map((faculty) => <div key={faculty.id} className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{faculty.name}</div>)}</div>
      </section>
    </div>
  );
}