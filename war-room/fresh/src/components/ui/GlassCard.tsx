'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/useReducedMotion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
  borderAccent?: string;
  glow?: string;
  onClick?: () => void;
  delay?: number;
}

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  none: '',
};

export function GlassCard({
  children,
  className,
  padding = 'md',
  hover = false,
  borderAccent,
  glow,
  onClick,
  delay = 0,
}: GlassCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      onClick={onClick}
      className={cn(
        'bg-[#12121a]/90 backdrop-blur-sm border border-white/10 rounded-xl',
        borderAccent,
        paddingMap[padding],
        hover && 'hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        className
      )}
      style={glow ? { boxShadow: `0 0 20px ${glow}10` } : undefined}
    >
      {children}
    </motion.div>
  );
}
