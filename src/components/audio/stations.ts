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
    description: "Low-intensity control-room drone with subtle pulse.",
    mood: "Minimal ambient / command focus",
    sourceUrl: "/audio/stations/night-channel.wav",
  },
  {
    id: "quiet-vector",
    name: "Quiet Vector",
    description: "Sparse tonal bed for long tactical sessions.",
    mood: "Minimal synth ambient",
    sourceUrl: "/audio/stations/quiet-vector.wav",
  },
  {
    id: "deep-grid",
    name: "Deep Grid",
    description: "Dark low-end texture with restrained movement.",
    mood: "Dark ambient / low movement",
    sourceUrl: "/audio/stations/deep-grid.wav",
  },
  {
    id: "cold-relay",
    name: "Cold Relay",
    description: "Crisp high-frequency atmospheric layer for planning mode.",
    mood: "Cinematic minimal ambient",
    sourceUrl: "/audio/stations/cold-relay.wav",
  },
];

export const DEFAULT_STATION = AMBIENT_STATIONS[0];
