'use client';

import { useReducedMotion } from './useReducedMotion';

export function Scanlines({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[60] ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        opacity: 0.03,
        mixBlendMode: 'overlay',
      }}
    />
  );
}
