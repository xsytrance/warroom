"use client";

import { Pause, Play, Volume2, VolumeX, Radio } from "lucide-react";
import { useAmbientAudio } from "./AudioProvider";
import { StationSelector } from "./StationSelector";

export function AmbientRadioMiniPlayer() {
  const {
    stations,
    station,
    isPlaying,
    muted,
    volume,
    status,
    message,
    setStation,
    togglePlay,
    setMuted,
    setVolume,
  } = useAmbientAudio();

  return (
    <aside
      className="fixed z-50 bottom-20 right-3 w-[calc(100vw-1.5rem)] max-w-[320px] rounded-xl border border-[#06b6d4]/25 bg-[#06080dcc] backdrop-blur-md shadow-[0_0_24px_rgba(6,182,212,0.12)] p-3 md:bottom-4 md:right-4"
      aria-label="War Room ambient radio"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Radio className="w-4 h-4 text-[#06b6d4] shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748b]">Ambient Radio</p>
            <p className="text-sm text-[#e2e8f0] truncate" title={station.name}>{station.name}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={isPlaying ? "Pause ambient radio" : "Play ambient radio"}
          onClick={() => void togglePlay()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#06b6d4]/30 bg-[#0b1119] text-[#06b6d4] hover:bg-[#0f1a26]"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      <p className="mt-1 text-[11px] text-[#7dd3fc]/90 truncate" title={station.mood}>{station.mood}</p>

      <div className="mt-3">
        <StationSelector stations={stations} selectedId={station.id} onChange={setStation} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label={muted ? "Unmute ambient radio" : "Mute ambient radio"}
          onClick={() => setMuted(!muted)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-[#0b1119] text-[#cbd5e1] hover:text-[#e2e8f0]"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <input
          aria-label="Ambient radio volume"
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className="w-full accent-cyan-400"
        />

        <span className="w-8 text-right text-xs text-[#94a3b8]">{Math.round(volume * 100)}%</span>
      </div>

      <p className="mt-2 min-h-4 text-[11px] text-[#64748b]" role="status" aria-live="polite">
        {message ?? (status === "playing" ? "Live" : status === "paused" ? "Paused" : status === "error" ? "Station unavailable" : "Ready")}
      </p>
    </aside>
  );
}
