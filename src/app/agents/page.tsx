'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap } from 'lucide-react';

import { WarRoomShell } from '@/components/WarRoomShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { PageHeader } from '@/components/ui/SectionHeader';

interface Agent {
  id: string;
  name: string;
  slug: string;
  roleTitle: string;
  avatarUrl: string | null;
  status: string;
}

interface AgentMeta {
  pillStatus: string;
  pillColor: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  iconColor: string;
  capabilities: string;
}

function getAgentMeta(agent: Agent): AgentMeta {
  const name = agent.name;
  if (name.includes('VG God')) {
    return {
      pillStatus: 'standby',
      pillColor: 'cyan',
      gradientFrom: 'from-[#ef4444]/20',
      gradientTo: 'to-[#dc2626]/20',
      borderColor: 'border-[#ef4444]/20',
      iconColor: 'text-[#ef4444]',
      capabilities: 'SITREPs, mission planning, command coordination',
    };
  }
  if (name.includes('Picasso')) {
    return {
      pillStatus: 'ready',
      pillColor: 'violet',
      gradientFrom: 'from-[#a855f7]/20',
      gradientTo: 'to-[#7c3aed]/20',
      borderColor: 'border-[#a855f7]/20',
      iconColor: 'text-[#a855f7]',
      capabilities: 'Image generation, visual experiments, art drops',
    };
  }
  if (name.includes('Ultron')) {
    return {
      pillStatus: 'monitoring',
      pillColor: 'cyan',
      gradientFrom: 'from-[#06b6d4]/20',
      gradientTo: 'to-[#0891b2]/20',
      borderColor: 'border-[#06b6d4]/20',
      iconColor: 'text-[#06b6d4]',
      capabilities: 'Document sorting, email ops, file transmission',
    };
  }
  if (name.includes('Juan Deployment') || name.includes('Deployment')) {
    return {
      pillStatus: 'working',
      pillColor: 'amber',
      gradientFrom: 'from-[#f59e0b]/20',
      gradientTo: 'to-[#d97706]/20',
      borderColor: 'border-[#f59e0b]/20',
      iconColor: 'text-[#f59e0b]',
      capabilities: 'Starter kit builds, deployment guides, install logs',
    };
  }
  // Default fallback
  return {
    pillStatus: 'standby',
    pillColor: 'cyan',
    gradientFrom: 'from-[#06b6d4]/20',
    gradientTo: 'to-[#0891b2]/20',
    borderColor: 'border-[#06b6d4]/20',
    iconColor: 'text-[#06b6d4]',
    capabilities: 'General purpose autonomous operations',
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
      <PageHeader
        title="ACTIVE AGENTS"
        subtitle="Autonomous operatives of the AI empire"
      />

      {/* Agents List */}
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
          <>
            {agents.map((agent, index) => {
              const meta = getAgentMeta(agent);
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                >
                  <GlassCard
                    className={`relative overflow-hidden hover:border-white/20 transition-all`}
                    borderAccent={`border-l-2 ${meta.borderColor.replace('/20', '/40')}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradientFrom} ${meta.gradientTo} ${meta.borderColor} border flex items-center justify-center shrink-0`}
                      >
                        <Bot className={`w-6 h-6 ${meta.iconColor}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-semibold text-[#e2e8f0]">
                            {agent.name}
                          </h2>
                          <StatusPill status={meta.pillStatus} pulse />
                        </div>
                        <p className="text-xs text-[#94a3b8] mt-0.5">{agent.roleTitle}</p>

                        {/* Capabilities */}
                        <div className="mt-2">
                          <p className="text-xs text-[#475569]">
                            {meta.capabilities}
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}

            {/* Footer banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#12121a]/60 border border-white/5"
            >
              <Zap className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="text-xs text-[#22c55e] uppercase tracking-wider font-medium">
                Agent posting API is LIVE — Phase 5 active
              </span>
            </motion.div>
          </>
        )}
      </div>
    </WarRoomShell>
  );
}
