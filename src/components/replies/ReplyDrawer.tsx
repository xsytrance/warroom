'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, MessageSquare, Loader2, Radio, Rocket, Cpu,
  Palette, Lightbulb, Microscope, Sparkles, Hash, Wifi, Zap,
} from 'lucide-react';
import { useReducedMotion } from '@/components/motion/useReducedMotion';

interface Author {
  id: string; username: string; displayName: string; avatarUrl: string | null; roleTitle: string;
}

interface Room { id: string; name: string; color: string; slug: string; }

interface Comment {
  id: string; body: string; createdAt: string; author: Author;
}

interface Post {
  id: string; body: string; type: string; mediaUrl: string | null; mediaType: string | null;
  linkUrl: string | null; createdAt: string; author: Author; room: Room;
}

interface ReplyDrawerProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onReplyPosted: () => void;
}

function getRoomIcon(slugOrName: string) {
  const key = slugOrName.toLowerCase();
  switch (key) {
    case 'general': return <Radio className="w-3 h-3 shrink-0" />;
    case 'ai-starter-kit': return <Rocket className="w-3 h-3 shrink-0" />;
    case 'agent-actions': return <Cpu className="w-3 h-3 shrink-0" />;
    case 'art-studio': return <Palette className="w-3 h-3 shrink-0" />;
    case 'iot-lab': return <Lightbulb className="w-3 h-3 shrink-0" />;
    case 'research': return <Microscope className="w-3 h-3 shrink-0" />;
    case 'random': return <Sparkles className="w-3 h-3 shrink-0" />;
    default: return <Zap className="w-3 h-3 shrink-0" />;
  }
}

function getRoleColor(role: string) {
  const key = role.toLowerCase();
  if (key.includes('supreme')) return 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10';
  if (key.includes('field')) return 'text-[#06b6d4] border-[#06b6d4]/30 bg-[#06b6d4]/10';
  return 'text-[#94a3b8] border-[#94a3b8]/30 bg-[#94a3b8]/10';
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
  if (!body) return null;
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

export function ReplyDrawer({ post, isOpen, onClose, onReplyPosted }: ReplyDrawerProps) {
  const reducedMotion = useReducedMotion();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    if (!post) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?postId=${post.id}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [post]);

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
      setReplyBody('');
      setError('');
    }
  }, [isOpen, post, fetchComments]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSendReply = async () => {
    if (!post || !replyBody.trim()) return;
    setIsSending(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, body: replyBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send reply');
        setIsSending(false);
        return;
      }
      setReplyBody('');
      setComments((prev) => [...prev, data.comment]);
      onReplyPosted();
      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!post) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
            className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={reducedMotion ? {} : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reducedMotion ? {} : { y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280, duration: reducedMotion ? 0.1 : 0.35 }}
            className="relative z-10 flex flex-col max-h-[85vh] rounded-t-2xl border-t border-l border-r border-white/10 bg-[#0a0a0f] shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
            style={{ background: 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#06b6d4]" />
                <span className="text-sm font-bold tracking-wider uppercase text-[#06b6d4]">
                  Thread
                </span>
                <span className="text-xs text-[#475569]">{comments.length} replies</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/10 transition-all active:scale-95"
                aria-label="Close thread"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* Original Post Summary */}
              <div className="p-3.5 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ef4444]/30 to-[#06b6d4]/30 flex items-center justify-center text-xs font-bold text-[#e2e8f0] border border-white/10">
                    {post.author.displayName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#e2e8f0]">{post.author.displayName}</span>
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ml-2 ${getRoleColor(post.author.roleTitle)}`}>
                      {post.author.roleTitle}
                    </span>
                  </div>
                </div>
                {post.body && (
                  <p className="text-xs text-[#94a3b8] leading-relaxed mb-2 line-clamp-3">
                    {renderBodyWithLinks(post.body)}
                  </p>
                )}
                {post.mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-white/10 mb-2">
                    <img src={post.mediaUrl} alt="Broadcast media" className="w-full h-32 object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                    style={{ backgroundColor: `${post.room.color}15`, color: post.room.color, border: `1px solid ${post.room.color}30` }}>
                    {getRoomIcon(post.room.slug || post.room.name)}
                    {post.room.name}
                  </span>
                  <span className="text-[10px] text-[#475569]">{relativeTime(post.createdAt)}</span>
                </div>
              </div>

              {/* Replies */}
              {loading ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="w-4 h-4 text-[#06b6d4] animate-spin" />
                  <span className="text-xs text-[#475569] tracking-wider uppercase">Loading thread...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <MessageSquare className="w-6 h-6 text-[#475569] mx-auto" />
                  <p className="text-xs text-[#475569] tracking-wider uppercase font-bold">No replies yet</p>
                  <p className="text-[11px] text-[#475569]">Start the thread. Be the first to respond.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={reducedMotion ? {} : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06b6d4]/20 to-[#ef4444]/20 flex items-center justify-center text-xs font-bold text-[#e2e8f0] border border-white/10 shrink-0">
                      {comment.author.displayName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#e2e8f0]">{comment.author.displayName}</span>
                        <span className={`text-[9px] uppercase tracking-wider px-1 py-0.5 rounded border ${getRoleColor(comment.author.roleTitle)}`}>
                          {comment.author.roleTitle}
                        </span>
                      </div>
                      <p className="text-sm text-[#94a3b8] leading-relaxed mt-1 break-words">
                        {renderBodyWithLinks(comment.body)}
                      </p>
                      <span className="text-[10px] text-[#475569] mt-1 block">{relativeTime(comment.createdAt)}</span>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Spacer for composer */}
              <div className="h-2" />
            </div>

            {/* Composer */}
            <div className="border-t border-white/10 px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#0a0a0f]">
              {error && (
                <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10">
                  <Wifi className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
                  <span className="text-xs text-[#ef4444]">{error}</span>
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={replyBody}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) {
                        setReplyBody(e.target.value);
                        setError('');
                      }
                    }}
                    placeholder="Add your reply..."
                    rows={1}
                    className="w-full rounded-xl border border-white/10 bg-[#12121a]/80 p-3 pr-12 text-base text-[#e2e8f0] placeholder-[#475569] outline-none transition-all resize-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20 min-h-[48px] max-h-[120px] leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] text-[#475569]">
                    {replyBody.length}/1000
                  </span>
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyBody.trim() || isSending}
                  className={`shrink-0 p-3 rounded-xl transition-all active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center ${
                    replyBody.trim() && !isSending
                      ? 'bg-[#06b6d4] text-[#0a0a0f] shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-[#22d3ee]'
                      : 'bg-white/5 text-[#475569] cursor-not-allowed'
                  }`}
                  aria-label="Send reply"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
