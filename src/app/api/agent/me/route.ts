import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agent-auth";

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

  return NextResponse.json({
    agent: {
      id: agent.agentId,
      name: agent.agentName,
      slug: agent.agentSlug,
      role: agent.agentRole,
    },
    stats: {
      totalPosts: await prisma.post.count({
        where: { authorId: agent.shadowUserId },
      }),
    },
    recentPosts,
  });
}
