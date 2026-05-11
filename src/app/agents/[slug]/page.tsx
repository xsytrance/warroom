'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bot,
  Music4,
  Trophy,
  Cpu,
  Headphones,
  Gauge,
  Radio,
  Save,
} from 'lucide-react';

import { WarRoomShell } from '@/components/WarRoomShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader } from '@/components/ui/SectionHeader';

type AgentTrack = {
  id: string;
  title: string;
  artist?: string | null;
  genre?: string | null;
  playCount: number;
  skipCount: number;
  totalListenMs: string;
};

type AgentDetailsResponse = {
  agent: {
    id: string;
    name: string;
    slug: string;
    stylizedName?: string | null;
    roleTitle: string;
    rankTitle: string;
    level: number;
    avatarUrl?: string | null;
    status: string;
    bio?: string | null;
    motto?: string | null;
    imageStylePreset?: string | null;
    imageProviderPreference?: string;
    topSongAutoplay?: boolean;
    favoriteGenres?: string[];
    xp: {
      current: number;
      needed: number;
      percent: number;
      totalXp: number;
      nextLevelTotalXp: number;
    };
    tracks: AgentTrack[];
  };
  counters: {
    plays: number;
    skips: number;
    mutes: number;
    volumeChanges: number;
    sessions: number;
    listenedMs: number;
  };
};

export default function AgentProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [data, setData] = useState<AgentDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    stylizedName: '',
    roleTitle: '',
    motto: '',
    bio: '',
    imageStylePreset: '',
    imageProviderPreference: 'local-first',
    topSongAutoplay: true,
    favoriteGenresText: '',
  });

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/agents/${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        const agent = resData.agent;
        setForm({
          stylizedName: agent.stylizedName || agent.name,
          roleTitle: agent.roleTitle || '',
          motto: agent.motto || '',
          bio: agent.bio || '',
          imageStylePreset: agent.imageStylePreset || '',
          imageProviderPreference: agent.imageProviderPreference || 'local-first',
          topSongAutoplay: !!agent.topSongAutoplay,
          favoriteGenresText: (agent.favoriteGenres || []).join(', '),
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const totalHours = useMemo(() => {
    const ms = data?.counters.listenedMs || 0;
    return (ms / (1000 * 60 * 60)).toFixed(1);
  }, [data]);

  async function saveProfile() {
    if (!slug) return;
    setSaving(true);
    try {
      await fetch(`/api/agents/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          favoriteGenres: form.favoriteGenresText
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        }),
      });
      const refreshed = await fetch(`/api/agents/${slug}`).then((res) => res.json());
      setData(refreshed);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <WarRoomShell showNav={true}>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-[#94a3b8]">Loading agent profile...</div>
      </WarRoomShell>
    );
  }

  if (!data) {
    return (
      <WarRoomShell showNav={true}>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-[#ef4444]">Agent not found.</div>
      </WarRoomShell>
    );
  }

  const { agent, counters } = data;
  const favoriteTrack = agent.tracks[0];

  return (
    <WarRoomShell showNav={true}>
      <PageHeader
        title={`AGENT DOSSIER · ${(agent.stylizedName || agent.name).toUpperCase()}`}
        subtitle={`${agent.rankTitle} · Level ${agent.level}`}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-28">
        <GlassCard padding="lg">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl border border-[#06b6d4]/30 bg-[#06b6d4]/10 flex items-center justify-center">
              <Bot className="w-7 h-7 text-[#06b6d4]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#e2e8f0]">{agent.stylizedName || agent.name}</h2>
              <p className="text-xs text-[#94a3b8]">{agent.roleTitle}</p>

              <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                <span className="px-2 py-1 rounded border border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/10 flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Rank {agent.rankTitle}
                </span>
                <span className="px-2 py-1 rounded border border-[#06b6d4]/30 text-[#06b6d4] bg-[#06b6d4]/10">
                  Level {agent.level}
                </span>
                <span className="px-2 py-1 rounded border border-white/20 text-[#94a3b8] bg-white/5">
                  XP {agent.xp.totalXp.toLocaleString()}
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[#22c55e]" style={{ width: `${agent.xp.percent}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-[#64748b]">
                {agent.xp.current.toLocaleString()} / {agent.xp.needed.toLocaleString()} to next level
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          <GlassCard padding="md">
            <p className="text-xs text-[#94a3b8] flex items-center gap-1"><Headphones className="w-3.5 h-3.5" /> Plays</p>
            <p className="text-xl font-bold text-[#e2e8f0] mt-1">{counters.plays}</p>
          </GlassCard>
          <GlassCard padding="md">
            <p className="text-xs text-[#94a3b8] flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> Skips</p>
            <p className="text-xl font-bold text-[#e2e8f0] mt-1">{counters.skips}</p>
          </GlassCard>
          <GlassCard padding="md">
            <p className="text-xs text-[#94a3b8] flex items-center gap-1"><Music4 className="w-3.5 h-3.5" /> Listen hours</p>
            <p className="text-xl font-bold text-[#e2e8f0] mt-1">{totalHours}</p>
          </GlassCard>
          <GlassCard padding="md">
            <p className="text-xs text-[#94a3b8] flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> Sessions</p>
            <p className="text-xl font-bold text-[#e2e8f0] mt-1">{counters.sessions}</p>
          </GlassCard>
        </div>

        {favoriteTrack && (
          <GlassCard padding="md">
            <p className="text-xs uppercase tracking-wider text-[#a855f7] flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" /> Top Song
            </p>
            <p className="text-sm text-[#e2e8f0] mt-1">{favoriteTrack.title}</p>
            <p className="text-xs text-[#94a3b8]">
              {favoriteTrack.artist || 'Unknown artist'} • {favoriteTrack.genre || 'Unknown genre'}
            </p>
            <p className="text-[11px] text-[#64748b] mt-1">
              Plays: {favoriteTrack.playCount} • Skips: {favoriteTrack.skipCount}
            </p>
          </GlassCard>
        )}

        <GlassCard padding="md">
          <h3 className="text-sm font-semibold text-[#06b6d4] mb-3">Identity Controls</h3>
          <div className="space-y-3">
            <Field label="Stylized Name" value={form.stylizedName} onChange={(v) => setForm((f) => ({ ...f, stylizedName: v }))} />
            <Field label="Rank / Role Label" value={form.roleTitle} onChange={(v) => setForm((f) => ({ ...f, roleTitle: v }))} />
            <Field label="Motto" value={form.motto} onChange={(v) => setForm((f) => ({ ...f, motto: v }))} />
            <Field label="Bio" value={form.bio} onChange={(v) => setForm((f) => ({ ...f, bio: v }))} multiline />
            <Field label="Favorite Genres (comma-separated)" value={form.favoriteGenresText} onChange={(v) => setForm((f) => ({ ...f, favoriteGenresText: v }))} />
            <Field label="Image Style Preset" value={form.imageStylePreset} onChange={(v) => setForm((f) => ({ ...f, imageStylePreset: v }))} />

            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Image Provider Preference</label>
              <select
                value={form.imageProviderPreference}
                onChange={(e) => setForm((f) => ({ ...f, imageProviderPreference: e.target.value }))}
                className="w-full h-10 rounded-lg bg-[#0f1117] border border-white/10 px-3 text-sm text-[#e2e8f0]"
              >
                <option value="local-first">Local-first</option>
                <option value="api-first">API-first</option>
                <option value="fallback-chain">Fallback chain</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#e2e8f0]">
              <input
                type="checkbox"
                checked={form.topSongAutoplay}
                onChange={(e) => setForm((f) => ({ ...f, topSongAutoplay: e.target.checked }))}
              />
              Autoplay top song on profile load
            </label>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={saveProfile}
              disabled={saving}
              className="w-full h-11 rounded-lg bg-[#06b6d4] text-[#0a0a0f] font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Identity'}
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </WarRoomShell>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-[#94a3b8] mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-20 rounded-lg bg-[#0f1117] border border-white/10 px-3 py-2 text-sm text-[#e2e8f0]"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-lg bg-[#0f1117] border border-white/10 px-3 text-sm text-[#e2e8f0]"
        />
      )}
    </div>
  );
}
