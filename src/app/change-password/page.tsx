"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/layout/AuthContext";
import { Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

function ChangePasswordForm() {
  const router = useRouter();
  const { user, isLoading, refresh } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && !user.mustChangePassword) router.push("/feed");
  }, [isLoading, router, user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to change password.");
      return;
    }

    await refresh();
    setSuccess("Password updated. Redirecting to command feed...");
    setTimeout(() => router.push("/feed"), 600);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0] flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#12121a]/80 p-6 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-wide">Change Initial Password</h1>
        <p className="mt-2 text-xs text-[#94a3b8]">For security, you must change your initial password before entering War Room.</p>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="h-11 rounded-lg border border-white/10 bg-[#0a0a0f]/60 px-3 text-sm" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 8 chars)" className="h-11 rounded-lg border border-white/10 bg-[#0a0a0f]/60 px-3 text-sm" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="h-11 rounded-lg border border-white/10 bg-[#0a0a0f]/60 px-3 text-sm" />

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-xs text-[#ef4444]">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-2 text-xs text-[#22c55e]">
              <CheckCircle2 className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <button disabled={submitting} type="submit" className="mt-2 h-11 rounded-lg bg-[#ef4444] text-sm font-semibold tracking-wider disabled:opacity-60 inline-flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            {submitting ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <AuthProvider>
      <ChangePasswordForm />
    </AuthProvider>
  );
}
