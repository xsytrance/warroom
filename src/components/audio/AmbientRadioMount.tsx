"use client";

import { AudioProvider } from "./AudioProvider";
import { AmbientRadioMiniPlayer } from "./AmbientRadioMiniPlayer";

export function AmbientRadioMount() {
  return (
    <AudioProvider>
      <AmbientRadioMiniPlayer />
    </AudioProvider>
  );
}
