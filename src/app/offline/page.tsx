export default function OfflinePage() {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Offline Mode</p>
      <h2 className="text-2xl font-semibold text-slate-900">The application is ready for cached access.</h2>
      <p className="text-sm text-slate-600">This page represents the offline fallback experience described in the portal specification, with cached data and status support to be extended later.</p>
    </div>
  );
}
