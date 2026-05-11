import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { levelFromXp, rankFromLevel, xpProgress } from "@/lib/agent-level";
import { parseJsonArray, serializeJsonArray } from "@/lib/agent-identity";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;

  const agent = await prisma.agent.findUnique({
    where: { slug },
    include: {
      tracks: {
        orderBy: [{ playCount: "desc" }, { totalListenMs: "desc" }],
        take: 10,
      },
      playbackEvents: {
        orderBy: { eventAt: "desc" },
        take: 30,
      },
    },
  });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const level = levelFromXp(agent.xpTotal);
  const rankTitle = rankFromLevel(level);

  const totals = await prisma.agentPlaybackEvent.groupBy({
    by: ["eventType"],
    where: { agentId: agent.id },
    _count: { _all: true },
    _sum: { listenedMs: true },
  });

  const counters = Object.fromEntries(totals.map((row) => [row.eventType, row._count._all]));

  return NextResponse.json({
    agent: {
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      roleTitle: agent.roleTitle,
      avatarUrl: agent.avatarUrl,
      status: agent.status,
      stylizedName: agent.stylizedName || agent.name,
      rankTitle,
      level,
      xp: xpProgress(agent.xpTotal),
      bio: agent.bio,
      motto: agent.motto,
      imageStylePreset: agent.imageStylePreset,
      imageProviderPreference: agent.imageProviderPreference,
      topSongAutoplay: agent.topSongAutoplay,
      favoriteGenres: parseJsonArray(agent.favoriteGenresJson),
      tracks: agent.tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        playCount: track.playCount,
        skipCount: track.skipCount,
        muteCount: track.muteCount,
        volumeAdjustCount: track.volumeAdjustCount,
        totalListenMs: track.totalListenMs.toString(),
      })),
      recentEvents: agent.playbackEvents.map((event) => ({
        id: event.id,
        eventType: event.eventType,
        eventAt: event.eventAt,
        positionMs: event.positionMs,
        listenedMs: event.listenedMs,
        volume: event.volume,
        muted: event.muted,
      })),
    },
    counters: {
      plays: counters.track_play_start || 0,
      skips: counters.skip || 0,
      mutes: counters.mute || 0,
      volumeChanges: counters.volume_change || 0,
      sessions: (counters.session_start || 0) + (counters.autoplay_triggered || 0),
      listenedMs: totals.reduce((acc, row) => acc + Number(row._sum.listenedMs || 0), 0),
    },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json();

  const updated = await prisma.agent.update({
    where: { slug },
    data: {
      stylizedName: body.stylizedName,
      roleTitle: body.roleTitle,
      avatarUrl: body.avatarUrl,
      bio: body.bio,
      motto: body.motto,
      imageStylePreset: body.imageStylePreset,
      imageProviderPreference: body.imageProviderPreference,
      topSongAutoplay:
        typeof body.topSongAutoplay === "boolean" ? body.topSongAutoplay : undefined,
      favoriteGenresJson: Array.isArray(body.favoriteGenres)
        ? serializeJsonArray(body.favoriteGenres)
        : undefined,
    },
  });

  return NextResponse.json({ agent: updated });
}
