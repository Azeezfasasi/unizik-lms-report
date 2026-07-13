export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Account Settings</p>
        <h2 className="text-2xl font-semibold text-slate-900">Profile and preferences</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Profile details</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Name</p>
              <p className="mt-1 text-slate-900">Joy Okafor</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Email</p>
              <p className="mt-1 text-slate-900">joy.okafor@unizik.edu.ng</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Role</p>
              <p className="mt-1 text-slate-900">Administrator</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Notification & media</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">Brevo email alerts</p>
              <p className="mt-1">Enabled for report submissions and reminder notices.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">Cloudinary uploads</p>
              <p className="mt-1">Profile image and report attachments can be stored securely.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">Offline mode</p>
              <p className="mt-1">Drafts can be continued when the connection drops.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
