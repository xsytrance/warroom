export const XP_BASE = 100_000;
export const XP_GROWTH = 1.22;

export function xpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  return Math.floor(XP_BASE * Math.pow(XP_GROWTH, Math.max(0, level - 1)));
}

export function cumulativeXpForLevel(level: number): number {
  if (level <= 0) return 0;
  let total = 0;
  for (let i = 1; i <= level; i += 1) {
    total += xpRequiredForLevel(i);
  }
  return Math.floor(total);
}

export function levelFromXp(xp: bigint | number): number {
  const totalXp = typeof xp === "bigint" ? Number(xp) : xp;
  if (totalXp <= 0) return 0;

  let level = 0;
  while (cumulativeXpForLevel(level + 1) <= totalXp) {
    level += 1;
    if (level > 10_000) break;
  }
  return level;
}

export function rankFromLevel(level: number): string {
  if (level >= 20) return "Mythic";
  if (level >= 15) return "Commander";
  if (level >= 10) return "Specialist";
  if (level >= 5) return "Operator";
  return "Recruit";
}

export function xpProgress(xp: bigint | number) {
  const totalXp = typeof xp === "bigint" ? Number(xp) : xp;
  const level = levelFromXp(totalXp);
  const floor = cumulativeXpForLevel(level);
  const ceiling = cumulativeXpForLevel(level + 1);
  const inLevel = Math.max(0, totalXp - floor);
  const needed = Math.max(1, ceiling - floor);

  return {
    level,
    current: inLevel,
    needed,
    percent: Math.min(100, Math.max(0, Math.round((inLevel / needed) * 100))),
    totalXp,
    nextLevelTotalXp: ceiling,
  };
}

export function estimateTokensFromText(input: string): number {
  const clean = input.trim();
  if (!clean) return 0;
  return Math.max(1, Math.round(clean.length / 4));
}
