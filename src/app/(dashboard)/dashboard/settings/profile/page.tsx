import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import ProfileForm from "./_components/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id, name, email, role } = session.user;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Account Settings</p>
        <h2 className="text-2xl font-semibold text-slate-900">Profile and preferences</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your personal details and password.</p>
      </div>

      <ProfileForm
        userId={id}
        initialName={name ?? ""}
        initialEmail={email ?? ""}
        role={role ?? ""}
      />
    </div>
  );
}

