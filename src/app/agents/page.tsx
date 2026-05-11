'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Music4, Sparkles, Trophy } from 'lucide-react';

import { WarRoomShell } from '@/components/WarRoomShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { PageHeader } from '@/components/ui/SectionHeader';

type Agent = {
  id: string;
  name: string;
  slug: string;
  stylizedName?: string | null;
  roleTitle: string;
  avatarUrl: string | null;
  status: string;
  rankTitle: string;
  level: number;
  xp: {
    current: number;
    needed: number;
    percent: number;
    totalXp: number;
  };
  topTrack?: {
    title: string;
    artist?: string | null;
    genre?: string | null;
    playCount?: number;
  } | null;
};

function getAgentMeta(agent: Agent) {
  const name = (agent.stylizedName || agent.name).toLowerCase();
  if (name.includes('picasso')) {
    return {
      pillStatus: 'ready',
      gradientFrom: 'from-[#a855f7]/20',
      gradientTo: 'to-[#7c3aed]/20',
      borderColor: 'border-[#a855f7]/20',
      iconColor: 'text-[#a855f7]',
      capabilities: 'Identity art, profile visuals, and render pipelines',
    };
  }
  if (name.includes('ultron')) {
    return {
      pillStatus: 'monitoring',
      gradientFrom: 'from-[#06b6d4]/20',
      gradientTo: 'to-[#0891b2]/20',
      borderColor: 'border-[#06b6d4]/20',
      iconColor: 'text-[#06b6d4]',
      capabilities: 'File ops, telemetry review, and signal logistics',
    };
  }
  return {
    pillStatus: 'standby',
    gradientFrom: 'from-[#ef4444]/20',
    gradientTo: 'to-[#dc2626]/20',
    borderColor: 'border-[#ef4444]/20',
    iconColor: 'text-[#ef4444]',
    capabilities: 'SITREPs, command support, and mission orchestration',
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <WarRoomShell showNav={true}>
      <PageHeader title="ACTIVE AGENTS" subtitle="Identity roster • ranks • progression" />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-[#06b6d4] border-t-transparent"
            />
            <p className="text-sm text-[#475569] uppercase tracking-widest font-medium">
              ESTABLISHING AGENT UPLINK...
            </p>
          </div>
        ) : (
          agents.map((agent, index) => {
            const meta = getAgentMeta(agent);
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <Link href={`/agents/${agent.slug}`}>
                  <GlassCard
                    className="relative overflow-hidden hover:border-white/20 transition-all"
                    borderAccent={`border-l-2 ${meta.borderColor.replace('/20', '/40')}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradientFrom} ${meta.gradientTo} ${meta.borderColor} border flex items-center justify-center shrink-0`}
                      >
                        <Bot className={`w-6 h-6 ${meta.iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-semibold text-[#e2e8f0]">
                            {agent.stylizedName || agent.name}
                          </h2>
                          <StatusPill status={meta.pillStatus} pulse />
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/10 flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {agent.rankTitle} · L{agent.level}
                          </span>
                        </div>

                        <p className="text-xs text-[#94a3b8] mt-0.5">{agent.roleTitle}</p>
                        <p className="text-xs text-[#475569] mt-2">{meta.capabilities}</p>

                        <div className="mt-2">
                          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-[#06b6d4]" style={{ width: `${agent.xp.percent}%` }} />
                          </div>
                          <p className="text-[10px] text-[#64748b] mt-1">
                            XP: {agent.xp.current.toLocaleString()} / {agent.xp.needed.toLocaleString()} (Total {agent.xp.totalXp.toLocaleString()})
                          </p>
                        </div>

                        {agent.topTrack && (
                          <p className="text-[11px] text-[#94a3b8] mt-2 flex items-center gap-1.5">
                            <Music4 className="w-3.5 h-3.5 text-[#a855f7]" />
                            Top song: {agent.topTrack.title}
                            {agent.topTrack.artist ? ` • ${agent.topTrack.artist}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })
        )}

        {!loading && (
          <div className="mt-4 rounded-xl border border-white/10 bg-[#12121a]/70 p-3 text-xs text-[#94a3b8] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#22c55e]" />
            Identity system online: profile stats, music telemetry, and progressive leveling are now live.
          </div>
        )}
      </div>
    </WarRoomShell>
  );
}
