"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_STATION, AMBIENT_STATIONS, type AmbientStation } from "./stations";
import {
  getStoredMuted,
  getStoredStationId,
  getStoredVolume,
  setStoredMuted,
  setStoredStationId,
  setStoredVolume,
} from "@/lib/audio/audioStorage";

type AudioStatus = "idle" | "playing" | "paused" | "error";

type AudioContextValue = {
  stations: AmbientStation[];
  station: AmbientStation;
  isPlaying: boolean;
  muted: boolean;
  volume: number;
  status: AudioStatus;
  message: string | null;
  setStation: (stationId: string) => void;
  togglePlay: () => Promise<void>;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

function findStation(stationId: string | null | undefined): AmbientStation {
  if (!stationId) return DEFAULT_STATION;
  return AMBIENT_STATIONS.find((s) => s.id === stationId) ?? DEFAULT_STATION;
}

function getInitialState() {
  const station = findStation(getStoredStationId());
  const volume = getStoredVolume(0.35);
  const muted = getStoredMuted(false);
  return { station, volume, muted };
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initial = getInitialState();

  const [station, setStationState] = useState<AmbientStation>(initial.station);
  const [volume, setVolumeState] = useState(initial.volume);
  const [muted, setMutedState] = useState(initial.muted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio(station.sourceUrl);
    audio.preload = "none";
    audio.loop = true;
    audio.volume = volume;
    audio.muted = muted;

    const onEnded = () => {
      setIsPlaying(false);
      setStatus("paused");
    };

    const onError = () => {
      setIsPlaying(false);
      setStatus("error");
      setMessage("Station unavailable");
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
    // intentionally only mount/unmount once for persistent singleton audio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStation = useCallback(
    (stationId: string) => {
      const next = findStation(stationId);
      setStationState(next);
      setStoredStationId(next.id);
      setMessage(null);

      const audio = audioRef.current;
      if (!audio) return;

      const shouldResume = isPlaying;
      audio.pause();
      audio.src = next.sourceUrl;
      audio.load();

      if (shouldResume) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setStatus("playing");
          })
          .catch(() => {
            setIsPlaying(false);
            setStatus("error");
            setMessage("Playback blocked by browser. Tap play again.");
          });
      } else {
        setStatus("paused");
      }
    },
    [isPlaying]
  );

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setStatus("paused");
      return;
    }

    setMessage(null);
    try {
      await audio.play();
      setIsPlaying(true);
      setStatus("playing");
    } catch {
      setIsPlaying(false);
      setStatus("error");
      setMessage("Playback blocked by browser. Tap play again.");
    }
  }, [isPlaying]);

  const setMuted = useCallback((nextMuted: boolean) => {
    setMutedState(nextMuted);
    setStoredMuted(nextMuted);

    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = nextMuted;
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const safe = Math.min(1, Math.max(0, nextVolume));
    setVolumeState(safe);
    setStoredVolume(safe);

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = safe;
  }, []);

  const value = useMemo<AudioContextValue>(
    () => ({
      stations: AMBIENT_STATIONS,
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
    }),
    [isPlaying, message, muted, setMuted, setStation, setVolume, station, status, togglePlay, volume]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAmbientAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAmbientAudio must be used within AudioProvider");
  }
  return context;
}
