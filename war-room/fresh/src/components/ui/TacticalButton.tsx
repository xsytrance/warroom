'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TacticalButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function TacticalButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled,
  type = 'button',
}: TacticalButtonProps) {
  const variants = {
    primary:
      'bg-[#ef4444]/20 border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/30 active:scale-95',
    danger:
      'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-95',
    ghost:
      'bg-white/5 border-transparent text-[#94a3b8] hover:bg-white/10 hover:text-[#e2e8f0] active:scale-95',
    outline:
      'bg-transparent border-white/10 text-[#e2e8f0] hover:border-white/20 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all duration-150',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
    >
      {children}
    </button>
  );
}
