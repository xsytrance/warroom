'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, MessageSquare, Radio, Zap, Shield, Crosshair, Cpu, Rocket, Palette, Sparkles, Wifi, Lightbulb, Microscope, Hash, Loader2, Reply } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WarRoomShell } from '@/components/WarRoomShell';
import { StatusPill } from '@/components/ui/StatusPill';
import { ReplyDrawer } from '@/components/replies/ReplyDrawer';

interface Author {
  id: string; username: string; displayName: string; avatarUrl: string | null; roleTitle: string; status: string;
}

interface Room { id: string; name: string; color: string; slug: string; }

interface Reaction { id: string; emoji: string; label: string; userId: string; }

interface Post {
  id: string; body: string; type: string; mediaUrl: string | null; mediaType: string | null;
  linkUrl: string | null; priority: string; createdAt: string;
  author: Author; room: Room; reactions: Reaction[];
  _count: { comments: number; reactions: number };
}

const REACTION_OPTIONS = [
  { emoji: '🫡', label: 'Salute' }, { emoji: '🔥', label: 'Fire' },
  { emoji: '😂', label: 'Laugh' }, { emoji: '🤯', label: 'Mind Blown' },
  { emoji: '✅', label: 'Approved' },
];

function getRoomIcon(slugOrName: string) {
  const key = slugOrName.toLowerCase();
  switch (key) {
    case 'general': return <Radio className="w-3.5 h-3.5 shrink-0" />;
    case 'ai-starter-kit': return <Rocket className="w-3.5 h-3.5 shrink-0" />;
    case 'agent-actions': return <Cpu className="w-3.5 h-3.5 shrink-0" />;
    case 'art-studio': return <Palette className="w-3.5 h-3.5 shrink-0" />;
    case 'iot-lab': return <Lightbulb className="w-3.5 h-3.5 shrink-0" />;
    case 'research': return <Microscope className="w-3.5 h-3.5 shrink-0" />;
    case 'random': return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    case 'intel': return <Shield className="w-3.5 h-3.5 shrink-0" />;
    case 'tactics': return <Crosshair className="w-3.5 h-3.5 shrink-0" />;
    case 'tech': return <Cpu className="w-3.5 h-3.5 shrink-0" />;
    case 'deploy': return <Rocket className="w-3.5 h-3.5 shrink-0" />;
    case 'design': return <Palette className="w-3.5 h-3.5 shrink-0" />;
    default: return <Zap className="w-3.5 h-3.5 shrink-0" />;
  }
}

function getRoleColor(role: string) {
  const key = role.toLowerCase();
  switch (key) {
    case 'supreme commander': return 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10';
    case 'field commander': return 'text-[#06b6d4] border-[#06b6d4]/30 bg-[#06b6d4]/10';
    default: return 'text-[#94a3b8] border-[#94a3b8]/30 bg-[#94a3b8]/10';
  }
}

function relativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function renderBodyWithLinks(body: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = body.split(urlRegex);
  const matches = body.match(urlRegex) || [];
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {matches[i] && (
            <a href={matches[i]} target="_blank" rel="noopener noreferrer"
              className="text-[#06b6d4] hover:text-[#22d3ee] hover:underline break-all"
              onClick={(e) => e.stopPropagation()}>
              {matches[i]}
            </a>
          )}
        </span>
      ))}
    </>
  );
}

function FeedContent() {
  const searchParams = useSearchParams();
  const urlRoomId = searchParams.get('room') || searchParams.get('roomId') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeUsers, setActiveUsers] = useState<Author[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>(urlRoomId);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyDrawerPost, setReplyDrawerPost] = useState<Post | null>(null);

  const fetchPosts = useCallback(async (roomId?: string) => {
    try {
      const url = roomId ? `/api/posts?roomId=${roomId}` : '/api/posts';
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.posts || []);
      const users = new Map();
      (data.posts || []).forEach((p: Post) => {
        if (!users.has(p.author.id)) users.set(p.author.id, p.author);
      });
      setActiveUsers(Array.from(users.values()));
    } catch (error) {
      console.error('Failed to fetch posts', error);
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(selectedRoom || undefined), fetchRooms()]);
    setRefreshing(false);
  }, [fetchPosts, fetchRooms, selectedRoom]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPosts(urlRoomId || undefined), fetchRooms()]).then(() => setLoading(false));
  }, [fetchPosts, fetchRooms, urlRoomId]);

  useEffect(() => {
    fetchPosts(selectedRoom || undefined);
  }, [selectedRoom, fetchPosts]);

  const handleReaction = async (postId: string, emoji: string, label: string) => {
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, emoji, label }),
      });
      if (res.ok) fetchPosts(selectedRoom || undefined);
    } catch (error) {
      console.error('Reaction failed', error);
    }
  };

  const handleReplyPosted = useCallback(() => {
    // Refresh posts to update comment counts
    fetchPosts(selectedRoom || undefined);
  }, [fetchPosts, selectedRoom]);

  return (
    <WarRoomShell showNav={true}>
      {/* Reply Drawer */}
      <ReplyDrawer
        post={replyDrawerPost}
        isOpen={!!replyDrawerPost}
        onClose={() => setReplyDrawerPost(null)}
        onReplyPosted={handleReplyPosted}
      />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#ef4444]" />
              <h1 className="text-base font-bold tracking-[0.15em] uppercase text-[#ef4444]">
                WAR ROOM STATUS
              </h1>
            </div>
            <button
              onClick={refresh}
              className={`p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}
              aria-label="Refresh feed"
            >
              <RefreshCw className="w-4 h-4 text-[#06b6d4]" />
            </button>
          </div>

          {/* Active Users Bar */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            <Wifi className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#475569] shrink-0 mr-1">Active</span>
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#ef4444]/30 to-[#06b6d4]/30 flex items-center justify-center text-[10px] font-bold text-[#e2e8f0] border border-white/10">
                  {user.displayName.charAt(0)}
                </div>
                <span className="text-xs text-[#94a3b8] whitespace-nowrap">{user.displayName}</span>
                <StatusPill status={user.status} size="sm" />
              </div>
            ))}
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedRoom('')}
              className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-medium transition-all min-h-[32px] border ${
                selectedRoom === ''
                  ? 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'bg-white/5 text-[#475569] border-white/10 hover:bg-white/10 hover:text-[#94a3b8]'
              }`}
            >
              ALL
            </button>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id === selectedRoom ? '' : room.id)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 min-h-[32px] border ${
                  selectedRoom === room.id ? 'border-opacity-40' : 'bg-white/5 text-[#475569] border-white/10 hover:bg-white/10 hover:text-[#94a3b8]'
                }`}
                style={selectedRoom === room.id ? { backgroundColor: `${room.color}20`, borderColor: `${room.color}40`, color: room.color } : {}}
              >
                {getRoomIcon(room.slug || room.name)}
                {room.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16 space-y-3">
              <Loader2 className="w-6 h-6 text-[#06b6d4] animate-spin mx-auto" />
              <p className="text-sm text-[#475569] tracking-wider uppercase font-medium">Establishing uplink...</p>
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 space-y-3">
              <Wifi className="w-8 h-8 text-[#475569] mx-auto" />
              <p className="text-sm text-[#94a3b8] tracking-wider uppercase font-bold">No Signals Detected</p>
              <p className="text-xs text-[#475569]">Be the first to broadcast intel to this channel.</p>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="bg-[#12121a] border border-white/10 rounded-xl p-4 hover:border-white/15 transition-colors"
              >
                {/* Card Header */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ef4444]/30 to-[#06b6d4]/30 flex items-center justify-center text-sm font-bold text-[#e2e8f0] border border-white/10 shrink-0">
                    {post.author.displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#e2e8f0] truncate">{post.author.displayName}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${getRoleColor(post.author.roleTitle)}`}>
                        {post.author.roleTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                        style={{ backgroundColor: `${post.room.color}15`, color: post.room.color, border: `1px solid ${post.room.color}30` }}>
                        {getRoomIcon(post.room.slug || post.room.name)}
                        {post.room.name}
                      </span>
                      <span className="text-xs text-[#475569]">{relativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="mt-3 text-sm text-[#94a3b8] leading-relaxed">
                  {renderBodyWithLinks(post.body)}
                </div>

                {/* Media Preview */}
                {post.mediaUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                    {post.mediaType?.startsWith('image') ? (
                      <img src={post.mediaUrl} alt="Media" className="w-full h-auto max-h-64 object-cover" />
                    ) : post.mediaType?.startsWith('video') ? (
                      <video src={post.mediaUrl} controls className="w-full max-h-64" />
                    ) : (
                      <div className="p-3 bg-white/5 text-xs text-[#475569]">Media: {post.mediaUrl}</div>
                    )}
                  </div>
                )}

                {post.linkUrl && (
                  <a href={post.linkUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 block p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#06b6d4] hover:bg-white/10 transition-colors truncate">
                    {post.linkUrl}
                  </a>
                )}

                {/* Reactions & Comments */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {REACTION_OPTIONS.map((opt) => {
                      const count = post.reactions.filter((r) => r.emoji === opt.emoji).length;
                      return (
                        <button
                          key={opt.emoji}
                          onClick={() => handleReaction(post.id, opt.emoji, opt.label)}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all border min-h-[36px] ${
                            count > 0
                              ? 'bg-white/10 border-white/20 text-[#e2e8f0]'
                              : 'bg-transparent border-transparent text-[#475569] hover:bg-white/5 hover:border-white/10'
                          }`}
                          title={opt.label}
                          aria-label={`${opt.label} reaction${count > 0 ? `, ${count} current` : ''}`}
                        >
                          <span className="text-sm">{opt.emoji}</span>
                          {count > 0 && <span className="text-[10px]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Reply button — tappable, opens drawer */}
                  <button
                    onClick={() => setReplyDrawerPost(post)}
                    className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#06b6d4] transition-colors min-h-[36px] px-2.5 py-1.5 rounded-lg hover:bg-[#06b6d4]/10"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{post._count.comments > 0 ? `${post._count.comments} replies` : 'Reply'}</span>
                  </button>
                </div>
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </div>
    </WarRoomShell>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-[#0a0a0f] text-[#e2e8f0] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <Loader2 className="w-6 h-6 text-[#06b6d4] animate-spin mx-auto" />
          <p className="text-sm text-[#475569] tracking-wider uppercase font-medium">Establishing uplink...</p>
        </div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
