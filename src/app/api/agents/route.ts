import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { levelFromXp, rankFromLevel, xpProgress } from "@/lib/agent-level";
import { parseJsonArray } from "@/lib/agent-identity";

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { name: "asc" },
    include: {
      tracks: {
        orderBy: { playCount: "desc" },
        take: 1,
      },
    },
  });

  const shaped = agents.map((agent) => {
    const level = levelFromXp(agent.xpTotal);
    const rankTitle = rankFromLevel(level);
    const favoriteGenres = parseJsonArray(agent.favoriteGenresJson);
    const topTrack = agent.tracks[0]
      ? {
          id: agent.tracks[0].id,
          title: agent.tracks[0].title,
          artist: agent.tracks[0].artist,
          genre: agent.tracks[0].genre,
          playCount: agent.tracks[0].playCount,
          skipCount: agent.tracks[0].skipCount,
          totalListenMs: agent.tracks[0].totalListenMs.toString(),
        }
      : null;

    return {
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      stylizedName: agent.stylizedName,
      roleTitle: agent.roleTitle,
      avatarUrl: agent.avatarUrl,
      status: agent.status,
      rankTitle,
      level,
      xp: xpProgress(agent.xpTotal),
      favoriteGenres,
      topTrack,
    };
  });

  return NextResponse.json({ agents: shaped });
}
