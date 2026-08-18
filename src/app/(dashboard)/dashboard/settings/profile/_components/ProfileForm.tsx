'use client';

import { FormEvent, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  userId: string;
  initialName: string;
  initialEmail: string;
  role: string;
}

type Tone = "info" | "success" | "error";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.8" fill="currentColor" />
      </svg>
      {message}
    </p>
  );
}

const baseInput =
  "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4";
const okInput = "border-slate-300 focus:border-teal-500 focus:ring-teal-500/15";
const errInput = "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/15";

function StatusBanner({ tone, message }: { tone: Tone; message: string }) {
  const styles: Record<Tone, string> = {
    info: "border-slate-200 bg-slate-50 text-slate-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-rose-200 bg-rose-50 text-rose-700",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${styles[tone]}`}>
      <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.8" fill="currentColor" />
      </svg>
      {message}
    </div>
  );
}

export default function ProfileForm({ userId, initialName, initialEmail, role }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileMessage, setProfileMessage] = useState("");
  const [profileTone, setProfileTone] = useState<Tone>("info");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordTone, setPasswordTone] = useState<Tone>("info");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setProfileSubmitting(true);
    setProfileTone("info");
    setProfileMessage("Saving changes…");

    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
    });

    setProfileSubmitting(false);

    if (response.ok) {
      setProfileTone("success");
      setProfileMessage("Profile updated successfully.");
    } else {
      const body = await response.json().catch(() => null);
      setProfileTone("error");
      setProfileMessage(body?.message ?? "Unable to save changes right now.");
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!currentPassword) nextErrors.currentPassword = "Enter your current password to confirm.";
    if (!newPassword) nextErrors.newPassword = "Enter a new password.";
    else if (newPassword.length < 8) nextErrors.newPassword = "Password must be at least 8 characters.";
    if (newPassword && confirmPassword !== newPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPasswordSubmitting(true);
    setPasswordTone("info");
    setPasswordMessage("Verifying and saving…");

    // Verify current password first
    const verifyResponse = await fetch("/api/auth/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password: currentPassword }),
    });

    if (!verifyResponse.ok) {
      setPasswordSubmitting(false);
      setPasswordTone("error");
      setPasswordMessage("Current password is incorrect.");
      return;
    }

    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    setPasswordSubmitting(false);

    if (response.ok) {
      setPasswordTone("success");
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    } else {
      const body = await response.json().catch(() => null);
      setPasswordTone("error");
      setPasswordMessage(body?.message ?? "Unable to change password right now.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Profile details */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Profile details</h3>
        <p className="mt-1 text-sm text-slate-500">Update your name and email address.</p>

        <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit} noValidate>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setProfileErrors((p) => ({ ...p, name: "" })); }}
              disabled={profileSubmitting}
              className={`${baseInput} ${profileErrors.name ? errInput : okInput} disabled:bg-slate-50 disabled:text-slate-400`}
              placeholder="Ada Okafor"
              readOnly
            />
            <FieldError message={profileErrors.name} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setProfileErrors((p) => ({ ...p, email: "" })); }}
              disabled={profileSubmitting}
              className={`${baseInput} ${profileErrors.email ? errInput : okInput} disabled:bg-slate-50 disabled:text-slate-400 cursor-not-allowed`}
              placeholder="ada@example.com"
              readOnly
            />
            <FieldError message={profileErrors.email} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <div className={`${baseInput} ${okInput} cursor-not-allowed bg-slate-50 text-slate-500`}>
              {role}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Role can only be changed by an administrator.</p>
          </div>

          {profileMessage ? <StatusBanner tone={profileTone} message={profileMessage} /> : null}

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={profileSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {profileSubmitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Change password</h3>
        <p className="mt-1 text-sm text-slate-500">Choose a strong password of at least 8 characters.</p>

        <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit} noValidate>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setPasswordErrors((p) => ({ ...p, currentPassword: "" })); }}
              disabled={passwordSubmitting}
              className={`${baseInput} ${passwordErrors.currentPassword ? errInput : okInput} disabled:bg-slate-50 disabled:text-slate-400`}
              autoComplete="current-password"
            />
            <FieldError message={passwordErrors.currentPassword} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors((p) => ({ ...p, newPassword: "" })); }}
                disabled={passwordSubmitting}
                className={`${baseInput} ${passwordErrors.newPassword ? errInput : okInput} pr-11 disabled:bg-slate-50 disabled:text-slate-400`}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M2 2L14 14M6.6 6.7a2 2 0 002.7 2.7M4 4.3C2.5 5.3 1.5 6.6 1 8c1.2 3 4 5 7 5 1.1 0 2.1-.3 3-.7M9.5 3.2C10 3.1 10.5 3 11 3c3 0 5.8 2 7 5-.4 1-1 1.9-1.7 2.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M1 8c1.2-3 4-5 7-5s5.8 2 7 5c-1.2 3-4 5-7 5s-5.8-2-7-5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                )}
              </button>
            </div>
            <FieldError message={passwordErrors.newPassword} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors((p) => ({ ...p, confirmPassword: "" })); }}
              disabled={passwordSubmitting}
              className={`${baseInput} ${passwordErrors.confirmPassword ? errInput : okInput} disabled:bg-slate-50 disabled:text-slate-400`}
              autoComplete="new-password"
            />
            <FieldError message={passwordErrors.confirmPassword} />
          </div>

          {passwordMessage ? <StatusBanner tone={passwordTone} message={passwordMessage} /> : null}

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {passwordSubmitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving…
                </>
              ) : (
                "Change password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
