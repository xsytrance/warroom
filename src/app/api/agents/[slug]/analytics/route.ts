import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const agent = await prisma.agent.findUnique({ where: { slug } });
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const eventsByType = await prisma.agentPlaybackEvent.groupBy({
    by: ["eventType"],
    where: { agentId: agent.id },
    _count: { _all: true },
    _sum: { listenedMs: true },
  });

  const topTracks = await prisma.agentTrack.findMany({
    where: { agentId: agent.id },
    orderBy: [{ playCount: "desc" }, { totalListenMs: "desc" }],
    take: 25,
  });

  const recentEvents = await prisma.agentPlaybackEvent.findMany({
    where: { agentId: agent.id },
    include: {
      track: {
        select: { id: true, title: true, artist: true, genre: true },
      },
    },
    orderBy: { eventAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    agent: {
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      stylizedName: agent.stylizedName || agent.name,
    },
    aggregates: eventsByType,
    topTracks,
    recentEvents,
  });
}
