import { levelFromXp, rankFromLevel, xpProgress } from "@/lib/agent-level";

export type FavoriteTrack = {
  id: string;
  title: string;
  artist?: string | null;
  genre?: string | null;
  sourceUrl?: string | null;
  playCount?: number;
};

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  } catch {
    return [];
  }
}

export function serializeJsonArray(values: string[] | null | undefined): string | null {
  if (!values || values.length === 0) return null;
  const cleaned = values.map((v) => v.trim()).filter(Boolean);
  return cleaned.length ? JSON.stringify(cleaned) : null;
}

export function normalizeAgent(agent: {
  level: number;
  rankTitle: string;
  xpTotal: bigint;
  stylizedName: string | null;
  favoriteGenresJson: string | null;
}) {
  const computedLevel = levelFromXp(agent.xpTotal);
  const rankTitle = rankFromLevel(computedLevel);

  return {
    level: computedLevel,
    rankTitle,
    stylizedName: agent.stylizedName,
    favoriteGenres: parseJsonArray(agent.favoriteGenresJson),
    xp: xpProgress(agent.xpTotal),
  };
}

export function estimateXpFromText(parts: Array<string | null | undefined>): number {
  const joined = parts.filter(Boolean).join(" ").trim();
  if (!joined) return 0;
  return Math.max(1, Math.round(joined.length / 4));
}
