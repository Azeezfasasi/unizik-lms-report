import { getUsers } from "@/lib/data/portal";
import Link from "next/link";
import UserActions from "./_components/UserActions";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function avatarTone(seed: string) {
  const tones = [
    "bg-teal-50 text-teal-700",
    "bg-indigo-50 text-indigo-700",
    "bg-amber-50 text-amber-700",
    "bg-rose-50 text-rose-700",
    "bg-sky-50 text-sky-700",
  ];
  const index = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length;
  return tones[index];
}

function roleBadge(role: string) {
  const key = role.trim().toLowerCase();
  if (key.includes("admin")) return "bg-rose-50 text-rose-700";
  if (key.includes("examiner")) return "bg-teal-50 text-teal-700";
  if (key.includes("coordinator")) return "bg-indigo-50 text-indigo-700";
  if (key.includes("staff")) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">User Access</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Manage staff and examiner accounts</h2>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} {users.length === 1 ? "account" : "accounts"} with portal access.
          </p>
        </div>
        {/* add create user button */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/dashboard/users/new"
            className="inline-flex items-center rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Create User
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm font-medium text-slate-600">No accounts yet</p>
          <p className="mt-1 text-sm text-slate-500">Staff and examiner accounts will appear here once added.</p>
        </div>
      ) : (
        <>
          {/* Table view — sm and up */}
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTone(user.id ?? user.name)}`}
                          >
                            {initials(user.name)}
                          </span>
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ${roleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <UserActions userId={user.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card view — below sm */}
          <div className="space-y-3 sm:hidden">
            {users.map((user) => (
              <div key={user.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarTone(user.id ?? user.name)}`}
                  >
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ${roleBadge(user.role)}`}>
                    {user.role}
                  </span>
                  <UserActions userId={user.id} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}