"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/components/layout/AuthContext";
import { ParticleField } from "@/components/motion/ParticleField";
import { TacticalGrid } from "@/components/motion/TacticalGrid";
import { WarRoomInsignia } from "@/components/WarRoomInsignia";
import { Lock, User, AlertTriangle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/feed");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Animated backgrounds */}
      <TacticalGrid />
      <ParticleField />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          {/* Title block */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-4 inline-flex items-center justify-center"
            >
              <WarRoomInsignia size={64} animated={true} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold tracking-[0.2em] text-[#e2e8f0]"
              style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            >
              THE WAR ROOM
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-3 text-sm tracking-wide text-[#06b6d4]"
            >
              Private command hub for the AI empire
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-2 text-xs text-[#475569] tracking-wide"
            >
              Authorized commanders only. Secure internal signal.
            </motion.p>
          </div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            className="rounded-xl border border-white/10 bg-[#12121a]/80 p-6 shadow-2xl backdrop-blur-md"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Username */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="username"
                  className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]"
                >
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="h-12 w-full rounded-lg border border-white/10 bg-[#0a0a0f]/60 pl-10 pr-4 text-[#e2e8f0] placeholder-[#475569] outline-none transition-colors focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-lg border border-white/10 bg-[#0a0a0f]/60 pl-10 pr-4 text-[#e2e8f0] placeholder-[#475569] outline-none transition-colors focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-sm text-[#ef4444]"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSubmitting}
                className="relative h-14 w-full overflow-hidden rounded-lg bg-[#ef4444] font-semibold tracking-wider text-[#e2e8f0] shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:bg-[#dc2626] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] disabled:opacity-60"
              >
                <span className="relative z-10">
                  {isSubmitting ? "AUTHENTICATING..." : "ENTER THE HUB"}
                </span>
                {/* Glow overlay */}
                <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
              </motion.button>
            </form>
          </motion.div>

          {/* Demo credentials hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#94a3b8]">
              <Lock className="h-3 w-3" />
              <span className="uppercase tracking-wider">Demo Credentials</span>
            </div>
            <div className="mt-2 flex flex-col gap-1 text-xs text-[#94a3b8]" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              <span>xsytrance / warroom2024</span>
              <span>juan / warroom2024</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
