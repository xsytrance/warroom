'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock3, Music4, Volume2, SkipForward, Mic2 } from 'lucide-react';

import { WarRoomShell } from '@/components/WarRoomShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader } from '@/components/ui/SectionHeader';

type AgentSummary = {
  id: string;
  name: string;
  slug: string;
  stylizedName?: string | null;
};

type AnalyticsResponse = {
  agent: AgentSummary;
  aggregates: Array<{
    eventType: string;
    _count: { _all: number };
    _sum: { listenedMs: number | null };
  }>;
  topTracks: Array<{
    id: string;
    title: string;
    artist?: string | null;
    genre?: string | null;
    playCount: number;
    skipCount: number;
    muteCount: number;
    volumeAdjustCount: number;
    totalListenMs: string;
  }>;
  recentEvents: Array<{
    id: string;
    eventType: string;
    eventAt: string;
    volume?: number | null;
    muted?: boolean | null;
    listenedMs?: number | null;
    track?: { title: string; artist?: string | null } | null;
  }>;
};

export default function AnalyticsPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((resData) => {
        const list = (resData.agents || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          stylizedName: a.stylizedName,
        }));
        setAgents(list);
        if (list.length > 0) {
          setActiveSlug((prev) => prev || list[0].slug);
        }
      });
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    setLoading(true);
    fetch(`/api/agents/${activeSlug}/analytics`)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .finally(() => setLoading(false));
  }, [activeSlug]);

  const eventCount = (type: string) =>
    data?.aggregates.find((a) => a.eventType === type)?._count._all || 0;

  const totalListenMs = data?.aggregates.reduce((acc, row) => acc + Number(row._sum.listenedMs || 0), 0) || 0;
  const totalHours = (totalListenMs / (1000 * 60 * 60)).toFixed(1);

  return (
    <WarRoomShell showNav={true}>
      <PageHeader title="ANALYTICS" subtitle="Playback telemetry, behavior stats, and identity pressure" />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
        <GlassCard padding="md">
          <p className="text-xs uppercase tracking-wider text-[#06b6d4] mb-2">Agent Filter</p>
          <div className="flex flex-wrap gap-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveSlug(agent.slug)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  activeSlug === agent.slug
                    ? 'border-[#06b6d4]/50 bg-[#06b6d4]/15 text-[#06b6d4]'
                    : 'border-white/10 bg-white/5 text-[#94a3b8] hover:bg-white/10'
                }`}
              >
                {agent.stylizedName || agent.name}
              </button>
            ))}
          </div>
        </GlassCard>

        {loading || !data ? (
          <div className="text-center py-10 text-[#94a3b8]">Loading analytics...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={<Music4 className="w-4 h-4 text-[#06b6d4]" />} label="Plays" value={String(eventCount('track_play_start'))} />
              <Stat icon={<SkipForward className="w-4 h-4 text-[#f59e0b]" />} label="Skips" value={String(eventCount('skip'))} />
              <Stat icon={<Volume2 className="w-4 h-4 text-[#a855f7]" />} label="Volume changes" value={String(eventCount('volume_change'))} />
              <Stat icon={<Clock3 className="w-4 h-4 text-[#22c55e]" />} label="Listen hours" value={totalHours} />
            </div>

            <GlassCard padding="md">
              <p className="text-xs uppercase tracking-wider text-[#ef4444] mb-2 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> Reward / Punish Snapshot
              </p>
              <ul className="text-sm text-[#94a3b8] space-y-1.5">
                <li>Discipline Score: <strong className="text-[#e2e8f0]">{Math.max(0, eventCount('track_play_start') - eventCount('skip'))}</strong></li>
                <li>Turbulence Index: <strong className="text-[#e2e8f0]">{eventCount('volume_change') + eventCount('mute')}</strong></li>
                <li>Session Stability: <strong className="text-[#e2e8f0]">{Math.max(0, eventCount('session_start') + eventCount('autoplay_triggered') - eventCount('error'))}</strong></li>
              </ul>
              <p className="text-[11px] text-[#64748b] mt-2">
                Use these metrics to award titles, alter mood, and adjust recommendation confidence.
              </p>
            </GlassCard>

            <GlassCard padding="md">
              <p className="text-xs uppercase tracking-wider text-[#a855f7] mb-2">Top Tracks</p>
              <div className="space-y-2">
                {data.topTracks.slice(0, 8).map((track) => (
                  <div key={track.id} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                    <p className="text-sm text-[#e2e8f0]">{track.title}</p>
                    <p className="text-[11px] text-[#94a3b8]">
                      {track.artist || 'Unknown artist'} • {track.genre || 'Unknown genre'}
                    </p>
                    <p className="text-[11px] text-[#64748b] mt-1">
                      Plays {track.playCount} · Skips {track.skipCount} · Listen {Math.round(Number(track.totalListenMs) / 1000)}s
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard padding="md">
              <p className="text-xs uppercase tracking-wider text-[#22c55e] mb-2 flex items-center gap-1">
                <Mic2 className="w-3.5 h-3.5" /> Recent Event Stream
              </p>
              <div className="space-y-1.5 max-h-[320px] overflow-auto pr-1">
                {data.recentEvents.map((event) => (
                  <div key={event.id} className="text-[11px] rounded border border-white/10 bg-white/5 p-2">
                    <div className="flex items-center justify-between text-[#94a3b8]">
                      <span className="uppercase tracking-wider text-[#06b6d4]">{event.eventType.replace(/_/g, ' ')}</span>
                      <span>{new Date(event.eventAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[#64748b] mt-0.5">
                      {event.track?.title ? `${event.track.title}${event.track.artist ? ` • ${event.track.artist}` : ''}` : 'No track attached'}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </WarRoomShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard padding="md">
        <p className="text-xs text-[#94a3b8] flex items-center gap-1.5">{icon} {label}</p>
        <p className="text-xl font-bold text-[#e2e8f0] mt-1">{value}</p>
      </GlassCard>
    </motion.div>
  );
}
