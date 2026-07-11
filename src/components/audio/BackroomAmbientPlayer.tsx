"use client";

import { useEffect } from "react";

const BACKROOM_STREAM = "https://ice6.somafm.com/groovesalad-128-mp3";

export function BackroomAmbientPlayer() {
  useEffect(() => {
    const audio = new Audio(BACKROOM_STREAM);
    audio.loop = true;
    audio.volume = 0.22;
    audio.preload = "none";

    let disposed = false;

    const tryPlay = async () => {
      if (disposed) return;
      try {
        await audio.play();
      } catch {
        // Browser blocked autoplay; wait for first user interaction.
      }
    };

    const unlock = () => {
      void tryPlay();
    };

    void tryPlay();

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    const onVisibilityChange = () => {
      if (!document.hidden) {
        void tryPlay();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      audio.pause();
      audio.src = "";
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
