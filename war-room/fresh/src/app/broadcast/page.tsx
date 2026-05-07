'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, AlertTriangle, CheckCircle2, Loader2, Radio, Rocket, Cpu, Palette, Lightbulb, Microscope, Sparkles, Hash } from 'lucide-react';
import { SignalPulse } from '@/components/motion/SignalPulse';
import { useReducedMotion } from '@/components/motion/useReducedMotion';
import { WarRoomShell } from '@/components/WarRoomShell';

interface Room {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  icon?: string;
}

const ROOM_ICONS: Record<string, React.ReactNode> = {
  general: <Radio className="w-4 h-4 shrink-0" />,
  'ai-starter-kit': <Rocket className="w-4 h-4 shrink-0" />,
  'agent-actions': <Cpu className="w-4 h-4 shrink-0" />,
  'art-studio': <Palette className="w-4 h-4 shrink-0" />,
  'iot-lab': <Lightbulb className="w-4 h-4 shrink-0" />,
  research: <Microscope className="w-4 h-4 shrink-0" />,
  random: <Sparkles className="w-4 h-4 shrink-0" />,
};

const POST_TYPES = [
  { value: 'human_broadcast', label: 'Broadcast', color: '#ef4444' },
  { value: 'agent_report', label: 'Agent Report', color: '#06b6d4' },
  { value: 'art_drop', label: 'Art Drop', color: '#a855f7' },
  { value: 'build_log', label: 'Build Log', color: '#22c55e' },
  { value: 'research_find', label: 'Research', color: '#3b82f6' },
  { value: 'iot_event', label: 'IoT Event', color: '#f59e0b' },
];

function useComposerRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rooms')
      .then((r) => r.json())
      .then((data) => {
        setRooms(data.rooms || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { rooms, loading };
}

function extractLink(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/i;
  const match = text.match(urlRegex);
  return match ? match[1] : null;
}

export default function BroadcastPage() {
  const router = useRouter();
  const { rooms, loading: roomsLoading } = useComposerRooms();
  const reducedMotion = useReducedMotion();

  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState('human_broadcast');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const bodyLength = body.trim().length;
  const maxLength = 2000;
  const canSubmit = bodyLength > 0 && selectedRoom !== '' && !isSubmitting;

  // Auto-select first room when loaded
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0].id);
    }
  }, [rooms, selectedRoom]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    const linkUrl = extractLink(body);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          body: body.trim(),
          type: postType,
          linkUrl: linkUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send broadcast');
        setIsSubmitting(false);
        return;
      }

      // Success state
      setSuccess(true);
      setIsSubmitting(false);

      // Wait for signal pulse animation then redirect
      setTimeout(() => {
        router.push('/feed');
      }, reducedMotion ? 500 : 1200);
    } catch {
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  }, [canSubmit, body, selectedRoom, postType, router, reducedMotion]);

  const handleCancel = () => {
    if (body.trim().length > 0) {
      if (!window.confirm('Discard this broadcast?')) return;
    }
    router.push('/feed');
  };

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);

  return (
    <WarRoomShell showNav={false} showBackground={true}>
      {/* Signal Pulse overlay on success */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SignalPulse trigger={success} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute flex flex-col items-center gap-3"
            >
              <CheckCircle2 className="w-16 h-16 text-[#22c55e]" />
              <span className="text-lg font-bold tracking-wider text-[#22c55e]">SIGNAL SENT</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors active:scale-95 min-h-[44px] px-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Cancel</span>
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold tracking-[0.25em] uppercase text-[#ef4444]">
            Broadcast Signal
          </h1>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all active:scale-95 min-h-[44px] ${
              canSubmit
                ? 'bg-[#ef4444] text-[#e2e8f0] shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-[#dc2626] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                : 'bg-white/5 text-[#475569] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSubmitting ? 'SENDING...' : 'SEND'}
          </button>
        </div>
      </div>

      {/* Composer Body */}
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-2xl mx-auto px-4 py-4 space-y-5"
      >
        {/* Room Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
            Target Room
          </label>
          {roomsLoading ? (
            <div className="flex items-center gap-2 text-sm text-[#475569]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading rooms...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => {
                const isSelected = selectedRoom === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all border min-h-[44px] ${
                      isSelected
                        ? 'border-opacity-40'
                        : 'border-white/10 bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-[#e2e8f0]'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${room.color}15`,
                            borderColor: `${room.color}40`,
                            color: room.color,
                          }
                        : undefined
                    }
                  >
                    {ROOM_ICONS[room.slug] || <Hash className="w-4 h-4 shrink-0" />}
                    <span>{room.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Post Type Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
              Signal Type
            </label>
            <button
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="text-xs text-[#06b6d4] hover:text-[#22d3ee] transition-colors min-h-[32px] px-1"
            >
              {showTypeSelector ? 'Hide' : 'Change'}
            </button>
          </div>

          <AnimatePresence>
            {showTypeSelector && (
              <motion.div
                initial={reducedMotion ? {} : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={reducedMotion ? {} : { height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {POST_TYPES.map((pt) => {
                    const isSelected = postType === pt.value;
                    return (
                      <button
                        key={pt.value}
                        onClick={() => {
                          setPostType(pt.value);
                          setShowTypeSelector(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border min-h-[40px] ${
                          isSelected
                            ? 'border-opacity-40'
                            : 'border-white/10 bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-[#e2e8f0]'
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: `${pt.color}15`,
                                borderColor: `${pt.color}40`,
                                color: pt.color,
                              }
                            : undefined
                        }
                      >
                        {pt.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showTypeSelector && (
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border min-h-[40px]"
              style={{
                backgroundColor: `${POST_TYPES.find((p) => p.value === postType)?.color}15`,
                borderColor: `${POST_TYPES.find((p) => p.value === postType)?.color}40`,
                color: POST_TYPES.find((p) => p.value === postType)?.color,
              }}
            >
              {POST_TYPES.find((p) => p.value === postType)?.label}
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
            Message
          </label>
          <div className="relative">
            <textarea
              value={body}
              onChange={(e) => {
                if (e.target.value.length <= maxLength) {
                  setBody(e.target.value);
                  setError('');
                }
              }}
              placeholder="Broadcast your intel..."
              className="w-full h-48 rounded-xl border border-white/10 bg-[#12121a]/80 p-4 text-base text-[#e2e8f0] placeholder-[#475569] outline-none transition-all resize-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20 leading-relaxed"
              autoFocus
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#475569]">
              {bodyLength}/{maxLength}
            </div>
          </div>
        </div>

        {/* Link Detection Preview */}
        {extractLink(body) && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg border border-[#06b6d4]/20 bg-[#06b6d4]/5"
          >
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-xs text-[#06b6d4]">Link detected:</span>
            </div>
            <a
              href={extractLink(body) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-xs text-[#94a3b8] truncate hover:text-[#e2e8f0] transition-colors"
            >
              {extractLink(body)}
            </a>
          </motion.div>
        )}

        {/* Selected Room Summary */}
        {selectedRoomData && (
          <div className="p-3 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
              <span className="font-medium text-[#e2e8f0]">Broadcasting to:</span>
              <span
                className="px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                style={{
                  backgroundColor: `${selectedRoomData.color}15`,
                  color: selectedRoomData.color,
                  border: `1px solid ${selectedRoomData.color}30`,
                }}
              >
                {ROOM_ICONS[selectedRoomData.slug] || <Hash className="w-3 h-3" />}
                {selectedRoomData.name}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reducedMotion ? {} : { opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0" />
              <span className="text-sm text-[#ef4444]">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button (Bottom Sticky) */}
        <div className="pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full h-14 rounded-xl font-bold tracking-wider text-[#e2e8f0] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              canSubmit
                ? 'bg-[#ef4444] shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:bg-[#dc2626] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]'
                : 'bg-white/5 text-[#475569] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                TRANSMITTING SIGNAL...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                BROADCAST SIGNAL
              </>
            )}
          </button>
        </div>
      </motion.div>
    </WarRoomShell>
  );
}
