export type AmbientStation = {
  id: string;
  name: string;
  description: string;
  mood: string;
  sourceUrl: string;
  attribution?: string;
  artist?: string;
  genre?: string;
  durationMs?: number;
  agentSlug?: string;
  isAgentStation?: boolean;
  provider?: "local" | "external" | "agent";
  fallbackActive?: boolean;
};

export const AMBIENT_STATIONS: AmbientStation[] = [
  {
    id: "somafm-dronezone",
    name: "Drone Zone (SomaFM)",
    description: "Live ambient stream — atmospheric space music.",
    mood: "Ambient / space / chill",
    sourceUrl: "https://ice1.somafm.com/dronezone-128-mp3",
    attribution: "SomaFM",
    artist: "Various",
    genre: "Ambient",
  },
  {
    id: "night-channel",
    name: "Night Channel",
    description: "Low-intensity control-room drone with subtle pulse.",
    mood: "Minimal ambient / command focus",
    sourceUrl: "/audio/stations/night-channel.wav",
    artist: "War Room Signals",
    genre: "Minimal Ambient",
    durationMs: 183000,
  },
  {
    id: "quiet-vector",
    name: "Quiet Vector",
    description: "Sparse tonal bed for long tactical sessions.",
    mood: "Minimal synth ambient",
    sourceUrl: "/audio/stations/quiet-vector.wav",
    artist: "War Room Signals",
    genre: "Synth Ambient",
    durationMs: 201000,
  },
  {
    id: "deep-grid",
    name: "Deep Grid",
    description: "Dark low-end texture with restrained movement.",
    mood: "Dark ambient / low movement",
    sourceUrl: "/audio/stations/deep-grid.wav",
    artist: "War Room Signals",
    genre: "Dark Ambient",
    durationMs: 236000,
  },
  {
    id: "cold-relay",
    name: "Cold Relay",
    description: "Crisp high-frequency atmospheric layer for planning mode.",
    mood: "Cinematic minimal ambient",
    sourceUrl: "/audio/stations/cold-relay.wav",
    artist: "War Room Signals",
    genre: "Cinematic Ambient",
    durationMs: 194000,
  },
];

export const DEFAULT_STATION = AMBIENT_STATIONS[0];
