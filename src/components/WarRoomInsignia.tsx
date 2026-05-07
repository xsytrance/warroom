'use client';

import { Shield } from 'lucide-react';

interface WarRoomInsigniaProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function WarRoomInsignia({ className, size = 'md' }: WarRoomInsigniaProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`relative flex items-center justify-center ${className || ''}`}>
      <div className={`${sizes[size]} rounded-lg bg-gradient-to-br from-[#ef4444]/20 to-[#06b6d4]/20 border border-white/10 flex items-center justify-center`}>
        <Shield className="w-1/2 h-1/2 text-[#ef4444]" />
      </div>
      <div className="absolute inset-0 rounded-lg border border-[#ef4444]/20 animate-pulse" />
    </div>
  );
}
