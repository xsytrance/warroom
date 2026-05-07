'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

interface SignalPulseProps {
  trigger: boolean;
  className?: string;
}

export function SignalPulse({ trigger, className = '' }: SignalPulseProps) {
  const reduced = useReducedMotion();
  const [pulses, setPulses] = useState<number[]>([]);

  useEffect(() => {
    if (reduced) {
      setPulses([]);
      return;
    }
    if (trigger) {
      const ids = [0, 1, 2];
      setPulses(ids);
      const timer = setTimeout(() => setPulses([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, reduced]);

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden ${className}`}>
      <AnimatePresence>
        {pulses.map((id) => (
          <motion.div
            key={id}
            initial={{ width: 40, height: 40, opacity: 0.8 }}
            animate={{
              width: 600,
              height: 600,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              delay: id * 0.25,
              ease: 'easeOut',
            }}
            className="absolute rounded-full border-2"
            style={{
              borderColor: id % 2 === 0 ? 'rgba(239,68,68,0.4)' : 'rgba(6,182,212,0.4)',
              backgroundColor: id === 0 ? 'rgba(239,68,68,0.03)' : 'transparent',
            }}
          />
        ))}
      </AnimatePresence>

      {!reduced && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1.5] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
