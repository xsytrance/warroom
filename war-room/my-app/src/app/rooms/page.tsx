'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Shield, Crosshair, Cpu, Rocket, Palette, Sparkles, MessageSquare, ArrowRight, Clock, Loader2, Wifi } from 'lucide-react';
import Link from 'next/link';
import { WarRoomShell } from '@/components/WarRoomShell';
import { GlassCard } from '@/components/ui/GlassCard';

interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  _count: { posts: number };
  posts: { createdAt: string }[];
}

const iconMap: Record<string, React.ReactNode> = {
  radio: <Radio className="w-5 h-5" />,
  eye: <Shield className="w-5 h-5" />,
  crosshair: <Crosshair className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  rocket: <Rocket className="w-5 h-5" />,
  palette: <Palette className="w-5 h-5" />,
  zap: <Sparkles className="w-5 h-5" />,
};

function relativeTime(dateStr?: string) {
  if (!dateStr) return 'No activity';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <WarRoomShell showNav={true}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold tracking-wider uppercase text-[#06b6d4]">
            COMMS CHANNELS
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">Mission spaces for the AI empire</p>
        </div>
      </div>

      {/* Room Grid */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <Loader2 className="w-6 h-6 text-[#06b6d4] animate-spin mx-auto" />
            <p className="text-sm text-[#475569] tracking-wider uppercase font-medium">Scanning channels...</p>
          </div>
        ) : (
          rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.07 }}
            >
              <Link
                href={`/feed?room=${room.id}`}
                className="block group"
              >
                <GlassCard
                  hover={true}
                  glow={room.color}
                  className="min-h-[80px]"
                >
                  <div className="flex items-start gap-4 p-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${room.color}15`, color: room.color }}
                    >
                      {iconMap[room.icon] || <Radio className="w-5 h-5" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-[#e2e8f0] group-hover:text-[#06b6d4] transition-colors">
                          {room.name}
                        </h2>
                        <ArrowRight className="w-4 h-4 text-[#475569] group-hover:text-[#06b6d4] transition-colors shrink-0 ml-2" />
                      </div>
                      <p className="text-sm text-[#94a3b8] mt-0.5 line-clamp-2">{room.description}</p>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
                          <MessageSquare className="w-3.5 h-3.5 text-[#475569]" />
                          <span>{room._count.posts} broadcasts</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-[#475569]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{relativeTime(room.posts[0]?.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color accent bar */}
                  <div
                    className="mx-4 mb-3 h-0.5 rounded-full w-full opacity-30"
                    style={{ backgroundColor: room.color }}
                  />
                </GlassCard>
              </Link>
            </motion.div>
          ))
        )}

        {!loading && rooms.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <Wifi className="w-8 h-8 text-[#475569] mx-auto" />
            <p className="text-sm text-[#94a3b8] tracking-wider uppercase font-bold">No Channels Found</p>
            <p className="text-xs text-[#475569]">Channels will appear once the network is established.</p>
          </div>
        )}
      </div>
    </WarRoomShell>
  );
}
