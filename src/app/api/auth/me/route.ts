import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (without password hash).
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        roleTitle: user.roleTitle,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        activeAgentSlug: user.activeAgentSlug,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/me
 * Updates user self-service profile settings.
 */
export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      activeAgentSlug?: string | null;
    };

    const requestedSlug = typeof body.activeAgentSlug === "string"
      ? body.activeAgentSlug.trim().toLowerCase()
      : null;

    if (requestedSlug) {
      const agentExists = await prisma.agent.findUnique({
        where: { slug: requestedSlug },
        select: { id: true },
      });

      if (!agentExists) {
        return NextResponse.json(
          { error: "Invalid active agent slug" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        activeAgentSlug: requestedSlug,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        roleTitle: true,
        status: true,
        mustChangePassword: true,
        activeAgentSlug: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Me patch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
