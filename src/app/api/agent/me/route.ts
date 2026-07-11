import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agent-auth";
import { levelFromXp, rankFromLevel, xpProgress } from "@/lib/agent-level";

/**
 * GET /api/agent/me
 *
 * Returns the authenticated agent's identity and posting history.
 * Authorization: Bearer <agent-token>
 */
export async function GET(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized — invalid or missing agent token" },
      { status: 401 }
    );
  }

  const dbAgent = await prisma.agent.findUnique({
    where: { id: agent.agentId },
    include: {
      tracks: {
        orderBy: [{ playCount: "desc" }, { lastPlayedAt: "desc" }],
        take: 5,
      },
    },
  });

  if (!dbAgent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // Fetch recent posts by this agent (via shadow user)
  const recentPosts = await prisma.post.findMany({
    where: { authorId: agent.shadowUserId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      roomId: true,
      priority: true,
      createdAt: true,
    },
  });

  const level = levelFromXp(dbAgent.xpTotal);
  const rankTitle = rankFromLevel(level);

  return NextResponse.json({
    agent: {
      id: dbAgent.id,
      name: dbAgent.name,
      stylizedName: dbAgent.stylizedName || dbAgent.name,
      slug: dbAgent.slug,
      role: dbAgent.roleTitle,
      rank: rankTitle,
      level,
      xpTotal: dbAgent.xpTotal.toString(),
      xp: xpProgress(dbAgent.xpTotal),
      imageProviderPreference: dbAgent.imageProviderPreference,
      topSongAutoplay: dbAgent.topSongAutoplay,
      avatarUrl: dbAgent.avatarUrl,
      motto: dbAgent.motto,
      bio: dbAgent.bio,
      favoriteTracks: dbAgent.tracks.map((track) => ({
        ...track,
        totalListenMs: track.totalListenMs.toString(),
      })),
    },
    stats: {
      totalPosts: await prisma.post.count({
        where: { authorId: agent.shadowUserId },
      }),
    },
    recentPosts,
  });
}
