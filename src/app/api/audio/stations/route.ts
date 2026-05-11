import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const AGENT_FALLBACK_STREAM = "https://ice1.somafm.com/dronezone-128-mp3";

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

  if (!session) {
    return NextResponse.json({ stations: [] });
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

  const stations = await Promise.all(
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

  return NextResponse.json({ stations });
}
