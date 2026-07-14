import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Settings</p>
        <h2 className="text-2xl font-semibold text-slate-900">Application Settings</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link href="/settings/profile" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-teal-500">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Profile</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Manage your profile</h3>
          <p className="mt-2 text-sm text-slate-600">Update profile details, change password, and manage account settings.</p>
        </Link>
        <Link href="#" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-teal-500">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Notifications</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Notification settings</h3>
          <p className="mt-2 text-sm text-slate-600">Configure email reminders and portal notification preferences.</p>
        </Link>
      </div>
    </div>
  );
}
