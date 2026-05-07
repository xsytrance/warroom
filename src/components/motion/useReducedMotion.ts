'use client';

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches || localStorage.getItem('war-room-reduced-motion') === 'true');
    update();
    media.addEventListener('change', update);
    window.addEventListener('storage', update);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return reduced;
}
