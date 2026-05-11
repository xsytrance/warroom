export type VaibStation = {
  id: string;
  name: string;
  sourceUrl: string;
  provider: "external";
  genre: string;
  mood: string;
  attribution: string;
  isAgentStation: false;
  origin: "vaib";
  priority?: number;
  region?: string;
  mobileSafe?: boolean;
  codecHint?: "mp3" | "aac" | "unknown";
};

/**
 * Canonical vAIb station registry used by War Room integration.
 * Version should be bumped whenever stations are added/removed/retagged.
 */
export const VAIB_STATION_REGISTRY_VERSION = "2026-05-11-v1" as const;

export const VAIB_STATIONS: VaibStation[] = [
  {
    id: "vaib-dronezone",
    name: "vAIb Drone Zone",
    sourceUrl: "https://ice1.somafm.com/dronezone-128-mp3",
    provider: "external",
    genre: "Ambient",
    mood: "Deep space / atmospheric",
    attribution: "SomaFM",
    isAgentStation: false,
    origin: "vaib",
    priority: 100,
    region: "global",
    mobileSafe: true,
    codecHint: "mp3",
  },
  {
    id: "vaib-cliqhop",
    name: "vAIb Cliqhop",
    sourceUrl: "https://ice1.somafm.com/cliqhop-128-mp3",
    provider: "external",
    genre: "Trip-hop / downtempo",
    mood: "Late-night tactical drift",
    attribution: "SomaFM",
    isAgentStation: false,
    origin: "vaib",
    priority: 90,
    region: "global",
    mobileSafe: true,
    codecHint: "mp3",
  },
  {
    id: "vaib-groovesalad",
    name: "vAIb Groove Salad",
    sourceUrl: "https://ice1.somafm.com/groovesalad-128-mp3",
    provider: "external",
    genre: "Downtempo / ambient",
    mood: "Smooth focus lane",
    attribution: "SomaFM",
    isAgentStation: false,
    origin: "vaib",
    priority: 80,
    region: "global",
    mobileSafe: true,
    codecHint: "mp3",
  },
  {
    id: "vaib-sf1033",
    name: "vAIb SF 10-33",
    sourceUrl: "https://ice1.somafm.com/sf1033-128-mp3",
    provider: "external",
    genre: "Ambient / interstitial",
    mood: "Comms-channel ambience",
    attribution: "SomaFM",
    isAgentStation: false,
    origin: "vaib",
    priority: 70,
    region: "global",
    mobileSafe: true,
    codecHint: "mp3",
  },
  {
    id: "vaib-u80s",
    name: "vAIb Underground 80s",
    sourceUrl: "https://ice1.somafm.com/u80s-128-mp3",
    provider: "external",
    genre: "Alternative / post-punk",
    mood: "High-tempo nostalgia",
    attribution: "SomaFM",
    isAgentStation: false,
    origin: "vaib",
    priority: 60,
    region: "global",
    mobileSafe: true,
    codecHint: "mp3",
  },
];
