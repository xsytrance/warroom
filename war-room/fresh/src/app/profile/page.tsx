'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, FileText, Heart, Shield, Activity } from 'lucide-react';
import Link from 'next/link';

import { WarRoomShell } from '@/components/WarRoomShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { PageHeader } from '@/components/ui/SectionHeader';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  roleTitle: string;
  status: string;
  postsCount: number;
  reactionsGiven: number;
  createdAt?: string;
}

function getRoleColor(role: string) {
  switch (role.toLowerCase()) {
    case 'supreme commander':
      return 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10';
    case 'field commander':
      return 'text-[#06b6d4] border-[#06b6d4]/30 bg-[#06b6d4]/10';
    default:
      return 'text-[#94a3b8] border-[#94a3b8]/30 bg-[#94a3b8]/10';
  }
}

function getRoleRing(role: string) {
  switch (role.toLowerCase()) {
    case 'supreme commander':
      return 'ring-[#ef4444]/30';
    case 'field commander':
      return 'ring-[#06b6d4]/30';
    default:
      return 'ring-[#94a3b8]/20';
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <WarRoomShell showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-[#06b6d4] border-t-transparent"
            />
            <p className="text-sm text-[#475569] uppercase tracking-widest font-medium">
              LOADING PROFILE...
            </p>
          </div>
        </div>
      </WarRoomShell>
    );
  }

  if (!profile) {
    return (
      <WarRoomShell showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#94a3b8] text-sm">Not authenticated</p>
            <Link
              href="/login"
              className="text-[#06b6d4] text-sm mt-2 inline-block hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </WarRoomShell>
    );
  }

  return (
    <WarRoomShell showNav={true}>
      <PageHeader
        title="OPERATIVE PROFILE"
        subtitle="Clearance: Level 4"
        action={
          <Link
            href="/settings"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4 text-[#e2e8f0]" />
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard padding="lg">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold shrink-0 ring-2 ${getRoleRing(profile.roleTitle)}`}
              >
                {profile.displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[#e2e8f0]">
                  {profile.displayName}
                </h2>
                <p className="text-sm text-[#94a3b8]">@{profile.username}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleColor(profile.roleTitle)}`}
                  >
                    {profile.roleTitle}
                  </span>
                  <StatusPill status={profile.status} pulse />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mt-4"
        >
          <GlassCard padding="md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#06b6d4]" />
              </div>
              <span className="text-xs text-[#94a3b8] uppercase tracking-wider">
                Broadcasts
              </span>
            </div>
            <p className="text-2xl font-bold text-[#e2e8f0]">
              {profile.postsCount}
            </p>
          </GlassCard>
          <GlassCard padding="md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-[#ef4444]" />
              </div>
              <span className="text-xs text-[#94a3b8] uppercase tracking-wider">
                Reactions
              </span>
            </div>
            <p className="text-2xl font-bold text-[#e2e8f0]">
              {profile.reactionsGiven}
            </p>
          </GlassCard>
        </motion.div>

        {/* Tactical Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4"
        >
          <GlassCard padding="md">
            <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#06b6d4]" />
              OPERATIVE DETAILS
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#94a3b8]">ID</span>
                <span className="text-sm text-[#e2e8f0]/60 font-mono">
                  {profile.id.slice(0, 8)}
                </span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#94a3b8]">Role</span>
                <span className="text-sm text-[#e2e8f0]/60">
                  {profile.roleTitle}
                </span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#94a3b8]">Status</span>
                <StatusPill status={profile.status} />
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#94a3b8]">Clearance</span>
                <span className="text-sm text-[#f59e0b]">Level 4</span>
              </div>
              {profile.createdAt && (
                <>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#94a3b8]">Member since</span>
                    <span className="text-sm text-[#e2e8f0]/60">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </WarRoomShell>
  );
}
