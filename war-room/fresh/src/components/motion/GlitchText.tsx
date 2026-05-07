'use client';

import { useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface GlitchTextProps {
  text: string;
  className?: string;
  interval?: number;
}

export function GlitchText({ text, className = '', interval = 8 }: GlitchTextProps) {
  const reduced = useReducedMotion();
  const [glitching, setGlitching] = useState(false);

  const triggerGlitch = useCallback(() => {
    if (reduced) return;
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(triggerGlitch, interval * 1000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, [reduced, interval, triggerGlitch]);

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <span
        className="relative z-10"
        style={{
          textShadow: glitching
            ? '2px 0 rgba(239,68,68,0.6), -2px 0 rgba(6,182,212,0.6)'
            : 'none',
          transition: 'text-shadow 0.05s ease',
        }}
      >
        {text}
      </span>
    </span>
  );
}
