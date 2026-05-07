'use client';

import { cn } from '@/lib/utils';

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  online: { label: 'ONLINE', color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10 border-[#22c55e]/20' },
  offline: { label: 'OFFLINE', color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10 border-[#ef4444]/20' },
  busy: { label: 'BUSY', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10 border-[#f59e0b]/20' },
  standby: { label: 'STANDBY', color: 'text-[#06b6d4]', bg: 'bg-[#06b6d4]/10 border-[#06b6d4]/20' },
  ready: { label: 'READY', color: 'text-[#a855f7]', bg: 'bg-[#a855f7]/10 border-[#a855f7]/20' },
  monitoring: { label: 'MONITORING', color: 'text-[#06b6d4]', bg: 'bg-[#06b6d4]/10 border-[#06b6d4]/20' },
  working: { label: 'WORKING', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10 border-[#f59e0b]/20' },
};

interface StatusPillProps {
  status: string;
  className?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusPill({ status, className, pulse = false, size = 'md' }: StatusPillProps) {
  const key = status.toLowerCase().replace(/\s+/g, '');
  const config = statusConfig[key] || {
    label: status.toUpperCase(),
    color: 'text-[#94a3b8]',
    bg: 'bg-[#94a3b8]/10 border-[#94a3b8]/20',
  };

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10px] px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wider rounded border',
        sizeClasses[size],
        config.bg,
        config.color,
        className
      )}
    >
      {pulse && (
        <span className={cn('rounded-full animate-pulse', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', config.color.replace('text-', 'bg-'))} />
      )}
      {!pulse && (
        <span className={cn('rounded-full', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', config.color.replace('text-', 'bg-'))} />
      )}
      {config.label}
    </span>
  );
}
