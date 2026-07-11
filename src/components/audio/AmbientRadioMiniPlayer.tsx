"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Pause, Play, Volume2, VolumeX, Radio, Signal, WandSparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAmbientAudio } from "./AudioProvider";
import { StationSelector } from "./StationSelector";
import { AudioVisualizer, type VisualizerMode } from "./AudioVisualizer";

const VIS_MODE_KEY = "warroom_visualizer_mode_v1";
const MODES: VisualizerMode[] = ["bars", "wave", "pulse", "scope"];

export function AmbientRadioMiniPlayer() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [isExpanded, setIsExpanded] = useState(!isLoginPage);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>("bars");

  const {
    stations,
    station,
    isPlaying,
    muted,
    volume,
    status,
    message,
    analyser,
    activeAgentSlug,
    viewerUsername,
    setStation,
    tuneToActiveAgent,
    togglePlay,
    setMuted,
    setVolume,
  } = useAmbientAudio();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VIS_MODE_KEY);
      if (raw && MODES.includes(raw as VisualizerMode)) {
        setVisualizerMode(raw as VisualizerMode);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const cycleVisualizerMode = () => {
    const index = MODES.indexOf(visualizerMode);
    const next = MODES[(index + 1) % MODES.length];
    setVisualizerMode(next);
    try {
      localStorage.setItem(VIS_MODE_KEY, next);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <aside
      className="fixed z-50 bottom-20 right-3 w-[calc(100vw-1.5rem)] max-w-[300px] rounded-xl border border-[#06b6d4]/25 bg-[#06080dcc] backdrop-blur-md shadow-[0_0_24px_rgba(6,182,212,0.12)] p-2.5 md:bottom-4 md:right-4"
      aria-label="War Room ambient radio"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Radio className="w-4 h-4 text-[#06b6d4] shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748b]">Ambient</p>
            <p className="text-sm text-[#e2e8f0] truncate" title={station.name}>{station.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={isPlaying ? "Pause ambient radio" : "Play ambient radio"}
            onClick={() => void togglePlay()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#06b6d4]/30 bg-[#0b1119] text-[#06b6d4] hover:bg-[#0f1a26]"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            aria-label={isExpanded ? "Minimize radio panel" : "Expand radio panel"}
            onClick={() => setIsExpanded((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0b1119] text-[#94a3b8] hover:text-[#e2e8f0]"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="mt-2 overflow-hidden rounded-md border border-[#06b6d4]/25 bg-[#07111a]">
            <AudioVisualizer analyser={analyser} isPlaying={isPlaying} mode={visualizerMode} className="h-12 w-full" />
          </div>

          <div className="mt-1 flex items-center justify-between text-[10px] text-[#64748b]">
            <span className="inline-flex items-center gap-1">
              <Signal className="h-3 w-3" />
              {station.isAgentStation ? `Agent: ${station.agentSlug}` : station.attribution || "War Room Radio"}
            </span>
            <span>{station.genre || "Ambient"}</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={cycleVisualizerMode}
              className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-[#0b1119] px-2 py-1 text-[10px] uppercase tracking-wide text-[#94a3b8] hover:text-[#e2e8f0]"
              title="Cycle visualizer mode"
            >
              <WandSparkles className="h-3 w-3" />
              Viz: {visualizerMode}
            </button>

            <button
              type="button"
              onClick={tuneToActiveAgent}
              className="inline-flex items-center gap-1 rounded-md border border-[#06b6d4]/35 bg-[#071726] px-2 py-1 text-[10px] uppercase tracking-wide text-[#67e8f9] hover:bg-[#0c2234]"
              title={`Tune to active agent station (${activeAgentSlug})`}
            >
              <Signal className="h-3 w-3" />
              Tune Active
            </button>
          </div>

          <p className="mt-1 text-[11px] text-[#7dd3fc]/90 truncate" title={station.mood}>{station.mood}</p>

          <div className="mt-2.5">
            <StationSelector stations={stations} selectedId={station.id} onChange={setStation} />
          </div>

          <div className="mt-2.5 flex items-center gap-2">
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
        </>
      )}

      <p className="mt-1.5 min-h-4 text-[11px] text-[#64748b]" role="status" aria-live="polite">
        {message ??
          (status === "playing"
            ? `Live${viewerUsername ? ` · ${viewerUsername}` : ""}`
            : status === "paused"
              ? "Paused"
              : status === "error"
                ? "Station unavailable"
                : "Ready")}
      </p>
    </aside>
  );
}
