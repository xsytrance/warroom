'use client';

import { ReactNode } from 'react';
import { ParticleField } from '@/components/motion/ParticleField';
import { TacticalGrid } from '@/components/motion/TacticalGrid';
import BottomNav from '@/components/BottomNav';
import { OfflineBanner } from '@/components/OfflineBanner';

interface WarRoomShellProps {
  children: ReactNode;
  showNav?: boolean;
  showBackground?: boolean;
  className?: string;
}

export function WarRoomShell({ children, showNav = true, showBackground = true, className }: WarRoomShellProps) {
  return (
    <div className={`min-h-dvh bg-[#0a0a0f] text-[#e2e8f0] relative overflow-hidden ${className || ''}`}>
      <OfflineBanner />
      {showBackground && (
        <>
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f] to-[#12121a]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ef4444]/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06b6d4]/5 rounded-full blur-[120px]" />
          </div>
          <ParticleField />
          <TacticalGrid />
          {/* Scanlines overlay */}
          <div 
            className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
