'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, LayoutGrid, PlusCircle, Bot, User, Settings } from 'lucide-react';

const navItems = [
  { href: '/feed', label: 'Feed', icon: Radio },
  { href: '/rooms', label: 'Rooms', icon: LayoutGrid },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/analytics', label: 'Stats', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show nav on broadcast page (composer is full-screen)
  if (pathname === '/broadcast') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          // Insert Broadcast button in the middle
          if (index === 2) {
            return (
              <div key="broadcast-group" className="flex items-center gap-1">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all min-h-[56px] justify-center ${
                    isActive
                      ? 'text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20'
                      : 'text-[#475569] hover:text-[#94a3b8]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all min-h-[56px] justify-center ${
                isActive
                  ? 'text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20'
                  : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}

        {/* Center Broadcast Button - Always visible, distinct styling */}
        <Link
          href="/broadcast"
          aria-label="Broadcast"
          className="group relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all -mt-3 bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/30 active:scale-95 min-h-[56px] justify-center"
        >
          <span className="relative flex items-center justify-center">
            <PlusCircle className="w-7 h-7 relative z-10" strokeWidth={2} />
            {/* Subtle idle pulse ring */}
            <span className="absolute inset-0 z-0 flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-[#ef4444]/20 animate-ping" style={{ animationDuration: '4s' }} />
            </span>
          </span>
          <span className="text-[10px] font-bold tracking-wide">BROADCAST</span>
        </Link>
      </div>
    </nav>
  );
}
