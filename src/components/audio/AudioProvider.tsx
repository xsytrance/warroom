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
type StationOrigin = "agent" | "vaib" | "ambient" | "unknown";

type AudioContextValue = {
  stations: AmbientStation[];
  station: AmbientStation;
  isPlaying: boolean;
  muted: boolean;
  volume: number;
  status: AudioStatus;
  message: string | null;
  analyser: AnalyserNode | null;
  activeAgentSlug: string;
  viewerUsername: string | null;
  setStation: (stationId: string) => void;
  tuneToActiveAgent: () => void;
  togglePlay: () => Promise<void>;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

const HEALTH_CACHE_TTL_MS = 5 * 60 * 1000;
const STALL_FAILOVER_MS = 12000;

function getInitialState() {
  const stationId = getStoredStationId();
  const station = AMBIENT_STATIONS.find((s) => s.id === stationId) ?? DEFAULT_STATION;
  const volume = getStoredVolume(0.25);
  const muted = getStoredMuted(true);
  return { station, volume, muted };
}

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.round(Math.random() * 1_000_000)}`;
}

function resolvePlayableUrl(sourceUrl: string): string {
  if (typeof window === "undefined") return sourceUrl;

  // Workaround: when app is accessed on :11369, static /audio paths can be redirected by auth proxy.
  // Force same host over default HTTPS port (443) for relative station assets.
  if (sourceUrl.startsWith("/") && window.location.protocol === "https:" && window.location.port === "11369") {
    return `${window.location.protocol}//${window.location.hostname}${sourceUrl}`;
  }

  return sourceUrl;
}

function getStationOrigin(station: AmbientStation): StationOrigin {
  if (station.isAgentStation) return "agent";
  if (station.origin === "vaib") return "vaib";
  if (station.origin === "ambient") return "ambient";
  return "unknown";
}

function getStationProvider(station: AmbientStation): string {
  if (station.isAgentStation) return "agent";
  if (station.origin === "vaib") return "somafm";
  if (station.provider === "local") return "local";
  if (station.provider === "external") return "external";
  return "unknown";
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listenStartRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string>(createSessionId());
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const healthCacheRef = useRef<Map<string, { ok: boolean; checkedAt: number }>>(new Map());
  const currentStationRef = useRef<AmbientStation>(DEFAULT_STATION);
  const failoverInProgressRef = useRef(false);
  const stallTimerRef = useRef<number | null>(null);
  const attemptFailoverRef = useRef<(reason: string) => Promise<boolean>>(async () => false);
  const emitEventRef = useRef<(
    eventType: string,
    overrides?: {
      positionMs?: number;
      listenedMs?: number;
      volume?: number;
      muted?: boolean;
      context?: Record<string, unknown>;
    }
  ) => Promise<void>>(async () => {});
  const isPlayingRef = useRef(false);

  const initial = getInitialState();

  const [stations, setStations] = useState<AmbientStation[]>(AMBIENT_STATIONS);
  const [station, setStationState] = useState<AmbientStation>(initial.station);
  const [volume, setVolumeState] = useState(initial.volume);
  const [muted, setMutedState] = useState(initial.muted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [activeAgentSlug, setActiveAgentSlug] = useState<string>("vg-god");
  const [viewerUsername, setViewerUsername] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    currentStationRef.current = station;
  }, [station]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const ensureAudioContextActive = useCallback(async () => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") {
      try {
        await audioCtx.resume();
      } catch {
        // ignore; playback can still proceed for direct element output
      }
    }
  }, []);

  const findStation = useCallback((stationId: string | null | undefined, pool = stations): AmbientStation => {
    if (!stationId) return pool[0] ?? DEFAULT_STATION;
    return pool.find((s) => s.id === stationId) ?? (pool[0] ?? DEFAULT_STATION);
  }, [stations]);

  const isStationHealthy = useCallback(async (candidate: AmbientStation): Promise<boolean> => {
    const url = resolvePlayableUrl(candidate.sourceUrl);
    const now = Date.now();
    const cached = healthCacheRef.current.get(url);
    if (cached && now - cached.checkedAt < HEALTH_CACHE_TTL_MS) {
      return cached.ok;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);

    try {
      const res = await fetch(url, {
        method: "HEAD",
        cache: "no-store",
        redirect: "follow",
        signal: controller.signal,
      });
      const ok = res.ok;
      healthCacheRef.current.set(url, { ok, checkedAt: now });
      return ok;
    } catch {
      healthCacheRef.current.set(url, { ok: false, checkedAt: now });
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  const getFailoverCandidates = useCallback((current: AmbientStation): AmbientStation[] => {
    const sameOrigin = stations.filter(
      (entry) => entry.id !== current.id && !entry.isAgentStation && entry.origin === current.origin
    );

    const external = stations.filter(
      (entry) => entry.id !== current.id && !entry.isAgentStation && entry.provider === "external"
    );

    const ambientFallback = stations.filter(
      (entry) => entry.id !== current.id && !entry.isAgentStation && entry.origin === "ambient"
    );

    const ordered = [
      ...sameOrigin,
      ...external,
      ...ambientFallback,
      ...stations.filter((entry) => entry.id !== current.id && !entry.isAgentStation),
    ];
    const seen = new Set<string>();

    return ordered.filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  }, [stations]);

  const attemptFailover = useCallback(async (reason: string): Promise<boolean> => {
    if (failoverInProgressRef.current) return false;

    const audio = audioRef.current;
    if (!audio) return false;

    const current = currentStationRef.current;
    const candidates = getFailoverCandidates(current);
    if (candidates.length === 0) return false;

    failoverInProgressRef.current = true;

    try {
      for (const candidate of candidates) {
        const healthy = await isStationHealthy(candidate);
        if (!healthy) continue;

        setStationState(candidate);
        setStoredStationId(candidate.id);
        currentStationRef.current = candidate;

        audio.pause();
        audio.src = resolvePlayableUrl(candidate.sourceUrl);
        audio.load();

        try {
          await ensureAudioContextActive();
          await audio.play();
          setIsPlaying(true);
          setStatus("playing");
          listenStartRef.current = Date.now();
          setMessage(`Switched to fallback: ${candidate.name}`);
          void emitEventRef.current("fallback_activated", {
            context: {
              reason,
              fromStationId: current.id,
              toStationId: candidate.id,
            },
          });
          return true;
        } catch {
          // try next candidate
        }
      }

      return false;
    } finally {
      failoverInProgressRef.current = false;
    }
  }, [ensureAudioContextActive, getFailoverCandidates, isStationHealthy]);

  useEffect(() => {
    attemptFailoverRef.current = attemptFailover;
  }, [attemptFailover]);

  const emitEvent = useCallback(
    async (
      eventType: string,
      overrides?: {
        positionMs?: number;
        listenedMs?: number;
        volume?: number;
        muted?: boolean;
        context?: Record<string, unknown>;
      }
    ) => {
      const audio = audioRef.current;
      const positionMs = overrides?.positionMs ?? (audio ? Math.round(audio.currentTime * 1000) : undefined);

      if (!activeAgentSlug) return;

      try {
        await fetch("/api/analytics/audio/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            agentSlug: activeAgentSlug,
            sessionId: sessionIdRef.current,
            eventType,
            track: {
              id: station.id,
              title: station.name,
              artist: station.artist,
              genre: station.genre,
              sourceUrl: station.sourceUrl,
              durationMs: station.durationMs,
            },
            positionMs,
            listenedMs: overrides?.listenedMs,
            volume: Math.round((overrides?.volume ?? volume) * 100),
            muted: overrides?.muted ?? muted,
            source: "warroom-web",
            context: {
              stationOrigin: getStationOrigin(station),
              provider: getStationProvider(station),
              ...(overrides?.context ?? {}),
            },
          }),
        });
      } catch {
        // non-blocking telemetry
      }
    },
    [activeAgentSlug, muted, station, volume]
  );


  useEffect(() => {
    emitEventRef.current = emitEvent;
  }, [emitEvent]);

  useEffect(() => {
    const cancelled = false;

    const loadAgentStations = async () => {
      try {
        const res = await fetch("/api/audio/stations", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as { stations?: AmbientStation[] };
        const fetchedStations = Array.isArray(data.stations) ? data.stations : [];
        const merged = fetchedStations.length > 0 ? fetchedStations : AMBIENT_STATIONS;
        if (!cancelled) {
          setStations(merged);
          const preferredId = getStoredStationId();
          setStationState(findStation(preferredId, merged));
        }
      } catch {
        // ignore network errors; local stations remain
      }
    };

    loadAgentStations();
  }, [findStation]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { user?: { activeAgentSlug?: string | null } };
      })
      .then((data) => {
        if (cancelled) return;
        const slug = data?.user?.activeAgentSlug?.trim().toLowerCase();
        const username = (data as { user?: { username?: string } } | null)?.user?.username?.trim() || null;
        if (username) setViewerUsername(username);
        if (slug) setActiveAgentSlug(slug);
      })
      .catch(() => {
        // fallback stays on default
      });

    const onActiveAgentChanged = (event: Event) => {
      const custom = event as CustomEvent<{ slug?: string | null }>;
      const slug = custom.detail?.slug?.trim().toLowerCase();
      if (slug) setActiveAgentSlug(slug);
    };

    window.addEventListener("warroom:active-agent-changed", onActiveAgentChanged as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("warroom:active-agent-changed", onActiveAgentChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    const audio = new Audio(resolvePlayableUrl(station.sourceUrl));
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = volume;
    audio.muted = muted;

    try {
      const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC && !audioContextRef.current) {
        audioContextRef.current = new AC();
      }
      if (audioContextRef.current && !sourceNodeRef.current) {
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 1024;
        sourceNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        setAnalyser(analyserRef.current);
      }
    } catch {
      // visualizer degrades gracefully when analyser can't init
    }

    const clearStallTimer = () => {
      if (stallTimerRef.current !== null) {
        window.clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    };

    const startStallTimer = () => {
      clearStallTimer();
      stallTimerRef.current = window.setTimeout(() => {
        if (!isPlayingRef.current) return;
        void attemptFailoverRef.current("stall_timeout");
      }, STALL_FAILOVER_MS);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setStatus("paused");
      const started = listenStartRef.current;
      const listenedMs = started ? Math.max(0, Date.now() - started) : 0;
      listenStartRef.current = null;
      void emitEvent("track_play_end", { listenedMs, context: { reason: "ended" } });
    };

    const onError = () => {
      setIsPlaying(false);
      setStatus("error");
      setMessage("Station unavailable");
      void emitEvent("error", {
        context: {
          stationId: currentStationRef.current.id,
          failureReason: "network_error",
        },
      });
      void attemptFailoverRef.current("audio_error");
    };

    const onCanPlay = () => {
      if (isPlayingRef.current) {
        startStallTimer();
      }
    };

    const onPlaying = () => {
      clearStallTimer();
    };

    const onWaiting = () => {
      if (isPlayingRef.current) {
        startStallTimer();
      }
    };

    const onStalled = () => {
      if (isPlayingRef.current) {
        startStallTimer();
      }
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("stalled", onStalled);

    audioRef.current = audio;

    return () => {
      clearStallTimer();
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("stalled", onStalled);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStation = useCallback(
    (stationId: string) => {
      const next = findStation(stationId);
      const prevStationId = station.id;
      setStationState(next);
      setStoredStationId(next.id);
      setMessage(null);

      if (next.isAgentStation && next.agentSlug) {
        const slug = next.agentSlug.trim().toLowerCase();
        setActiveAgentSlug(slug);
        void fetch("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ activeAgentSlug: slug }),
        });
        window.dispatchEvent(new CustomEvent("warroom:active-agent-changed", { detail: { slug } }));
      }

      const audio = audioRef.current;
      if (!audio) return;

      const shouldResume = isPlaying;
      const started = listenStartRef.current;
      if (started) {
        const listenedMs = Math.max(0, Date.now() - started);
        void emitEvent("skip", { listenedMs, context: { fromStationId: prevStationId, toStationId: next.id } });
      }

      listenStartRef.current = null;
      audio.pause();
      audio.src = resolvePlayableUrl(next.sourceUrl);
      audio.load();

      if (shouldResume) {
        void ensureAudioContextActive();
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setStatus("playing");
            listenStartRef.current = Date.now();
            void emitEvent("track_play_start", { context: { stationId: next.id } });
          })
          .catch(() => {
            setIsPlaying(false);
            setStatus("error");
            setMessage("Autoplay restricted. Tap play to resume.");
            void emitEvent("error", {
              context: {
                stationId: next.id,
                failureReason: "autoplay_blocked",
              },
            });
            void attemptFailoverRef.current("resume_after_station_switch_failed");
          });
      } else {
        setStatus("paused");
      }
    },
    [emitEvent, ensureAudioContextActive, findStation, isPlaying, station.id]
  );

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setStatus("paused");
      const started = listenStartRef.current;
      const listenedMs = started ? Math.max(0, Date.now() - started) : 0;
      listenStartRef.current = null;
      void emitEvent("pause", { listenedMs });
      return;
    }

    setMessage(null);
    try {
      await ensureAudioContextActive();
      await audio.play();
      setIsPlaying(true);
      setStatus("playing");
      listenStartRef.current = Date.now();
      void emitEvent("track_play_start", { context: { stationId: station.id } });
    } catch {
      setIsPlaying(false);
      setStatus("error");
      setMessage("Playback blocked by browser. Tap play again.");
      void emitEvent("error", {
        context: {
          stationId: station.id,
          failureReason: "autoplay_blocked",
        },
      });
      void attemptFailoverRef.current("manual_play_failed");
    }
  }, [emitEvent, ensureAudioContextActive, isPlaying, station.id]);

  const setMuted = useCallback((nextMuted: boolean) => {
    setMutedState(nextMuted);
    setStoredMuted(nextMuted);

    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = nextMuted;
    void emitEvent(nextMuted ? "mute" : "unmute", { muted: nextMuted });

    if (!nextMuted && !isPlaying) {
      void ensureAudioContextActive();
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setStatus("playing");
          setMessage(null);
          listenStartRef.current = Date.now();
          void emitEvent("track_play_start", { context: { stationId: station.id, resumedFromUnmute: true } });
        })
        .catch(() => {
          setMessage("Tap play to start audio.");
          void emitEvent("error", {
            context: {
              stationId: station.id,
              failureReason: "autoplay_blocked",
            },
          });
          void attemptFailoverRef.current("unmute_resume_failed");
        });
    }
  }, [emitEvent, ensureAudioContextActive, isPlaying, station.id]);

  const setVolume = useCallback((nextVolume: number) => {
    const safe = Math.min(1, Math.max(0, nextVolume));
    setVolumeState(safe);
    setStoredVolume(safe);

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = safe;
    void emitEvent("volume_change", { volume: safe });
  }, [emitEvent]);

  useEffect(() => {
    const unlock = () => {
      void ensureAudioContextActive();
      const audio = audioRef.current;
      if (!audio || isPlaying) return;

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setStatus("playing");
          listenStartRef.current = Date.now();
          setMessage(null);
          void emitEvent("autoplay_triggered", { context: { reason: "gesture_unlock" } });
        })
        .catch(() => {
          // stay paused until explicit play tap
        });
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlock as EventListener);
      window.removeEventListener("touchstart", unlock as EventListener);
    };
  }, [emitEvent, ensureAudioContextActive, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isPlaying) return;

    audio.muted = muted;
    void ensureAudioContextActive();
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setStatus("playing");
        listenStartRef.current = Date.now();
        void emitEvent("autoplay_triggered", { context: { muted } });
        if (muted) {
          setMessage("Ambient live (muted). Tap speaker to unmute.");
        } else {
          setMessage(null);
        }
      })
      .catch(() => {
        setStatus("paused");
        setMessage("Tap play to start ambient radio.");
        void emitEvent("error", {
          context: {
            stationId: station.id,
            failureReason: "autoplay_blocked",
          },
        });
      });
  }, [emitEvent, ensureAudioContextActive, muted, isPlaying, station.id]);

  const tuneToActiveAgent = useCallback(() => {
    const targetId = `agent-${activeAgentSlug}`;
    const target = stations.find((entry) => entry.id === targetId);
    if (!target) {
      setMessage("No station mapped for active agent yet.");
      return;
    }
    setStation(target.id);
  }, [activeAgentSlug, setStation, stations]);

  const value = useMemo<AudioContextValue>(
    () => ({
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
    }),
    [
      activeAgentSlug,
      analyser,
      isPlaying,
      message,
      muted,
      setMuted,
      setStation,
      setVolume,
      stations,
      station,
      status,
      togglePlay,
      tuneToActiveAgent,
      viewerUsername,
      volume,
    ]
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
