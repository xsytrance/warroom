export type AmbientStation = {
  id: string;
  name: string;
  description: string;
  mood: string;
  sourceUrl: string;
  attribution?: string;
};

export const AMBIENT_STATIONS: AmbientStation[] = [
  {
    id: "night-channel",
    name: "Night Channel",
    description: "Low-glow command ambience for late operations.",
    mood: "Cyber ambient / night operations",
    sourceUrl: "/audio/stations/night-channel.mp3",
  },
  {
    id: "pulse-drift",
    name: "Pulse Drift",
    description: "Steady forward rhythm for tactical focus.",
    mood: "Melodic techno / focus",
    sourceUrl: "/audio/stations/pulse-drift.mp3",
  },
  {
    id: "ghost-relay",
    name: "Ghost Relay",
    description: "Subtle motion energy for execution windows.",
    mood: "Progressive breaks / tactical movement",
    sourceUrl: "/audio/stations/ghost-relay.mp3",
  },
  {
    id: "circuit-bloom",
    name: "Circuit Bloom",
    description: "Bright uplink mode when momentum is clean.",
    mood: "Uplifting trance / optimistic command energy",
    sourceUrl: "/audio/stations/circuit-bloom.mp3",
  },
];

export const DEFAULT_STATION = AMBIENT_STATIONS[0];
