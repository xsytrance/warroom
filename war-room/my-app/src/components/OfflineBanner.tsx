'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Radio } from 'lucide-react';
import { useReducedMotion } from '@/components/motion/useReducedMotion';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const update = () => {
      const online = navigator.onLine;
      if (!online && isOnline) {
        // Just went offline
        setIsOnline(false);
        setShowBanner(true);
      } else if (online && !isOnline) {
        // Just came back online
        setIsOnline(true);
        setShowBanner(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowBanner(false), 3000);
      }
    };

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update(); // Initial check

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={reducedMotion ? {} : { y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reducedMotion ? {} : { y: -40, opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
          className="fixed top-0 left-0 right-0 z-[100] safe-top"
        >
          <div
            className={`mx-4 mt-2 rounded-xl border px-4 py-2.5 flex items-center justify-between gap-3 backdrop-blur-md ${
              isOnline
                ? 'bg-[#22c55e]/10 border-[#22c55e]/30'
                : 'bg-[#ef4444]/10 border-[#ef4444]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-[#22c55e] shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-[#ef4444] shrink-0" />
              )}
              <span className={`text-xs font-semibold tracking-wider uppercase ${isOnline ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {isOnline ? 'Signal Restored' : 'Signal Lost'}
              </span>
              <span className="text-[11px] text-[#94a3b8]">
                {isOnline ? 'Uplink re-established' : 'Offline mode — connection unavailable'}
              </span>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-[10px] text-[#475569] hover:text-[#e2e8f0] transition-colors px-2 py-1 rounded"
              aria-label="Dismiss network banner"
            >
              DISMISS
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return isOnline;
}
