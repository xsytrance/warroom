'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

export function RadarSweep({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={`pointer-events-none ${className}`}>
        <div className="w-full h-full rounded-full border border-[#06b6d4]/10 opacity-30" />
      </div>
    );
  }

  return (
    <div className={`pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="w-full h-full rounded-full border border-[#06b6d4]/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(6,182,212,0.15) 360deg)',
          }}
        />
      </motion.div>
    </div>
  );
}
