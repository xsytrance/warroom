'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, icon, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {icon && <div className="text-[#06b6d4]">{icon}</div>}
      <div>
        <h2 className="text-sm font-bold tracking-wider uppercase text-[#06b6d4]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#94a3b8] mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10',
        className
      )}
    >
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-wider uppercase text-[#06b6d4]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#94a3b8] mt-1">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
