import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agent-auth";

const MAX_BODY_LENGTH = 2000;
const MAX_TITLE_LENGTH = 200;

const VALID_AGENT_TYPES = [
  "sitrep",
  "art_drop",
  "build_log",
  "research_find",
  "music_drop",
  "iot_event",
  "alert",
  "mission_complete",
  "error_report",
  "file_report",
];

const VALID_PRIORITIES = ["low", "normal", "high", "urgent"];

/**
 * POST /api/agent/broadcast
 *
 * Authorization: Bearer <agent-token>
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "room": "art-studio",        // room slug (required)
 *   "type": "art_drop",          // agent post type (required)
 *   "title": "Neon Genesis",     // optional title
 *   "body": "Generated...",      // message body (required)
 *   "mediaUrl": "/uploads/...",  // optional media URL
 *   "linkUrl": "https://...",    // optional link URL
 *   "priority": "normal",        // low | normal | high | urgent
 *   "metadata": { ... }           // optional JSON metadata
 * }
 */
export async function POST(request: Request) {
  // 1. Authenticate agent
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized — invalid or missing agent token" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      room: roomSlug,
      type,
      title,
      body: postBody,
      mediaUrl,
      linkUrl,
      priority,
      metadata,
    } = body;

    // 2. Validate required fields
    if (!postBody || typeof postBody !== "string" || postBody.trim().length === 0) {
      return NextResponse.json(
        { error: "Message body is required" },
        { status: 400 }
      );
    }

    if (!roomSlug || typeof roomSlug !== "string") {
      return NextResponse.json(
        { error: "Room slug is required" },
        { status: 400 }
      );
    }

    // 3. Validate body length
    if (postBody.trim().length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds ${MAX_BODY_LENGTH} character limit` },
        { status: 400 }
      );
    }

    // 4. Validate title length
    if (title && title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title exceeds ${MAX_TITLE_LENGTH} character limit` },
        { status: 400 }
      );
    }

    // 5. Validate type
    const postType = type || "agent_report";
    if (!VALID_AGENT_TYPES.includes(postType)) {
      return NextResponse.json(
        {
          error: `Invalid post type. Must be one of: ${VALID_AGENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 6. Validate priority
    const postPriority = priority || "normal";
    if (!VALID_PRIORITIES.includes(postPriority)) {
      return NextResponse.json(
        {
          error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 7. Verify room exists
    const room = await prisma.room.findUnique({
      where: { slug: roomSlug.trim().toLowerCase() },
    });

    if (!room) {
      return NextResponse.json(
        { error: `Room not found — '${roomSlug}' does not exist` },
        { status: 400 }
      );
    }

    // 8. Prepare metadata JSON
    let metadataJson: string | null = null;
    if (metadata && typeof metadata === "object") {
      const enriched = {
        ...metadata,
        agentId: agent.agentId,
        agentSlug: agent.agentSlug,
        agentName: agent.agentName,
        postedAt: new Date().toISOString(),
      };
      metadataJson = JSON.stringify(enriched);
    }

    // 9. Create the post using shadow user ID
    const post = await prisma.post.create({
      data: {
        body: postBody.trim(),
        roomId: room.id,
        authorId: agent.shadowUserId,
        type: postType,
        title: title || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? inferMediaType(mediaUrl) : null,
        linkUrl: linkUrl || null,
        priority: postPriority,
        metadataJson,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            roleTitle: true,
            status: true,
          },
        },
        room: {
          select: { id: true, name: true, color: true, slug: true },
        },
        reactions: {
          select: { id: true, emoji: true, label: true, userId: true },
        },
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    });

    return NextResponse.json(
      {
        post,
        agent: {
          id: agent.agentId,
          name: agent.agentName,
          slug: agent.agentSlug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Agent broadcast error:", error);
    return NextResponse.json(
      { error: "Failed to broadcast agent signal. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/broadcast
 * Health check for agent endpoint — returns agent info if authenticated.
 */
export async function GET(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized — invalid or missing agent token" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: "online",
    agent: {
      id: agent.agentId,
      name: agent.agentName,
      slug: agent.agentSlug,
      role: agent.agentRole,
    },
  });
}

function inferMediaType(url: string): string | null {
  const lower = url.toLowerCase();
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/)) return "image";
  if (lower.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/)) return "video";
  if (lower.match(/\.(mp3|wav|ogg|flac|m4a)(\?.*)?$/)) return "audio";
  return null;
}
