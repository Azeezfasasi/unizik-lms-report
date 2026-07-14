import { getUsers } from "@/lib/data/portal";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">User Access</p>
        <h2 className="text-2xl font-semibold text-slate-900">Manage staff and examiner accounts</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {users.map((user) => (
          <div key={user.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{user.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{user.email}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{user.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
