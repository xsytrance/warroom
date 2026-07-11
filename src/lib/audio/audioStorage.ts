const STORAGE_KEYS = {
  stationId: "warroom:ambient:station-id",
  volume: "warroom:ambient:volume",
  muted: "warroom:ambient:muted",
} as const;

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getStoredStationId(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.stationId);
}

export function setStoredStationId(stationId: string): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.stationId, stationId);
}

export function getStoredVolume(defaultValue = 0.35): number {
  if (!canUseStorage()) return defaultValue;
  const raw = window.localStorage.getItem(STORAGE_KEYS.volume);
  const parsed = raw ? Number(raw) : Number.NaN;
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.min(1, Math.max(0, parsed));
}

export function setStoredVolume(volume: number): void {
  if (!canUseStorage()) return;
  const safe = Math.min(1, Math.max(0, volume));
  window.localStorage.setItem(STORAGE_KEYS.volume, String(safe));
}

export function getStoredMuted(defaultValue = false): boolean {
  if (!canUseStorage()) return defaultValue;
  return window.localStorage.getItem(STORAGE_KEYS.muted) === "true";
}

export function setStoredMuted(muted: boolean): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.muted, muted ? "true" : "false");
}
