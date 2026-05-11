import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const EVENT_TYPES = new Set([
  "track_play_start",
  "track_play_end",
  "pause",
  "resume",
  "skip",
  "mute",
  "unmute",
  "volume_change",
  "seek",
  "autoplay_triggered",
  "queue_add",
  "queue_remove",
  "repeat_change",
  "shuffle_change",
  "device_switch",
  "session_start",
  "session_end",
  "error",
  "fallback_activated",
]);

type AudioEventPayload = {
  agentSlug?: string;
  eventType?: string;
  sessionId?: string;
  positionMs?: number;
  listenedMs?: number;
  volume?: number;
  muted?: boolean;
  source?: string;
  context?: Record<string, unknown>;
  track?: {
    id?: string;
    title?: string;
    artist?: string;
    genre?: string;
    sourceUrl?: string;
    durationMs?: number;
  };
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as AudioEventPayload;
  const agentSlug = (payload.agentSlug || "").trim().toLowerCase();
  const eventType = (payload.eventType || "").trim();

  const context = payload.context ?? {};
  const stationOrigin = typeof context.stationOrigin === "string" ? context.stationOrigin.trim().toLowerCase() : null;
  const provider = typeof context.provider === "string" ? context.provider.trim().toLowerCase() : null;
  const failureReason =
    typeof context.failureReason === "string" ? context.failureReason.trim().toLowerCase() : null;

  if (!agentSlug) {
    return NextResponse.json({ error: "agentSlug is required" }, { status: 400 });
  }

  if (!eventType || !EVENT_TYPES.has(eventType)) {
    return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
  }

  if (stationOrigin && !["agent", "vaib", "ambient", "unknown"].includes(stationOrigin)) {
    return NextResponse.json({ error: "Invalid stationOrigin" }, { status: 400 });
  }

  if (provider && !["agent", "somafm", "local", "external", "unknown"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  if (
    failureReason &&
    !["network_error", "codec_unsupported", "autoplay_blocked", "fallback_activated", "unknown"].includes(
      failureReason
    )
  ) {
    return NextResponse.json({ error: "Invalid failureReason" }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({ where: { slug: agentSlug } });
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  let trackRecord: { id: string } | null = null;

  if (payload.track?.id && payload.track.title) {
    trackRecord = await prisma.agentTrack.upsert({
      where: { id: payload.track.id },
      update: {
        title: payload.track.title,
        artist: payload.track.artist,
        genre: payload.track.genre,
        sourceUrl: payload.track.sourceUrl,
        durationMs: payload.track.durationMs,
      },
      create: {
        id: payload.track.id,
        agentId: agent.id,
        title: payload.track.title,
        artist: payload.track.artist,
        genre: payload.track.genre,
        sourceUrl: payload.track.sourceUrl,
        durationMs: payload.track.durationMs,
      },
      select: { id: true },
    });
  }

  await prisma.agentPlaybackEvent.create({
    data: {
      agentId: agent.id,
      trackId: trackRecord?.id,
      eventType,
      sessionId: payload.sessionId,
      positionMs: payload.positionMs,
      listenedMs: payload.listenedMs,
      volume: payload.volume,
      muted: payload.muted,
      source: payload.source,
      contextJson: payload.context ? JSON.stringify(payload.context) : null,
    },
  });

  if (trackRecord?.id) {
    const data: Record<string, unknown> = {};
    if (eventType === "track_play_start") {
      data.playCount = { increment: 1 };
      data.lastPlayedAt = new Date();
    }
    if (eventType === "skip") {
      data.skipCount = { increment: 1 };
    }
    if (eventType === "mute") {
      data.muteCount = { increment: 1 };
    }
    if (eventType === "volume_change") {
      data.volumeAdjustCount = { increment: 1 };
    }
    if (typeof payload.listenedMs === "number" && payload.listenedMs > 0) {
      data.totalListenMs = { increment: BigInt(payload.listenedMs) };
    }

    if (Object.keys(data).length > 0) {
      await prisma.agentTrack.update({
        where: { id: trackRecord.id },
        data,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
