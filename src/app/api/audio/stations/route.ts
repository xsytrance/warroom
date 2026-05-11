import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { AMBIENT_STATIONS } from "@/components/audio/stations";
import { VAIB_STATIONS } from "@/lib/audio/vaibStations";

const AGENT_FALLBACK_STREAM = "https://ice1.somafm.com/dronezone-128-mp3";

type StationLike = {
  id: string;
  name: string;
  sourceUrl: string;
};

function dedupeStations<T extends StationLike>(stations: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];

  for (const station of stations) {
    const key = `${station.sourceUrl.trim().toLowerCase()}::${station.name.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(station);
  }

  return out;
}

async function probeStream(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const session = await getSession();

  // Unauthenticated users get stable non-agent catalog only.
  if (!session) {
    const mergedPublic = dedupeStations([
      ...VAIB_STATIONS.map((station) => ({ ...station, provider: "external" as const })),
      ...AMBIENT_STATIONS,
    ]);

    return NextResponse.json({ stations: mergedPublic });
  }

  const agents = await prisma.agent.findMany({
    orderBy: { name: "asc" },
    include: {
      tracks: {
        where: {
          sourceUrl: {
            not: null,
          },
        },
        orderBy: [{ playCount: "desc" }, { totalListenMs: "desc" }, { updatedAt: "desc" }],
        take: 5,
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { activeAgentSlug: true },
  });

  const agentStations = await Promise.all(
    agents.map(async (agent) => {
      const rankedTracks = agent.tracks.filter((track) => Boolean(track.sourceUrl));

      let selectedTrack = rankedTracks[0] ?? null;
      let selectedReachable = false;

      for (const track of rankedTracks) {
        if (!track.sourceUrl) continue;
        const ok = await probeStream(track.sourceUrl);
        if (ok) {
          selectedTrack = track;
          selectedReachable = true;
          break;
        }
      }

      if (!selectedReachable && selectedTrack?.sourceUrl) {
        selectedReachable = await probeStream(selectedTrack.sourceUrl);
      }

      const usingFallback = !selectedReachable;
      const sourceUrl = usingFallback ? AGENT_FALLBACK_STREAM : (selectedTrack?.sourceUrl as string);

      return {
        id: `agent-${agent.slug}`,
        name: `${agent.stylizedName || agent.name} Radio`,
        description: usingFallback
          ? `Fallback stream active for ${agent.stylizedName || agent.name}`
          : selectedTrack?.title
            ? `Top track: ${selectedTrack.title}${selectedTrack.artist ? ` — ${selectedTrack.artist}` : ""}`
            : `Live feed from ${agent.stylizedName || agent.name}`,
        mood: agent.status || agent.roleTitle || "Agent broadcast",
        sourceUrl,
        attribution: usingFallback ? "Agent Fallback" : "Agent Broadcast",
        artist: selectedTrack?.artist || agent.stylizedName || agent.name,
        genre: selectedTrack?.genre || "Agent Mix",
        durationMs: selectedTrack?.durationMs ?? undefined,
        agentSlug: agent.slug,
        isAgentStation: true,
        provider: "agent" as const,
        fallbackActive: usingFallback,
      };
    })
  );

  const activeAgentId = user?.activeAgentSlug ? `agent-${user.activeAgentSlug.trim().toLowerCase()}` : null;

  const prioritizedAgentStations = activeAgentId
    ? [
        ...agentStations.filter((station) => station.id === activeAgentId),
        ...agentStations.filter((station) => station.id !== activeAgentId),
      ]
    : agentStations;

  const merged = dedupeStations([
    ...prioritizedAgentStations,
    ...VAIB_STATIONS.map((station) => ({ ...station, provider: "external" as const })),
    ...AMBIENT_STATIONS,
  ]);

  return NextResponse.json({ stations: merged });
}
