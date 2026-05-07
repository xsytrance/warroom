import { prisma } from "./db";
import bcrypt from "bcryptjs";

const AGENT_AUTH_HEADER = "x-agent-token";

export interface AgentContext {
  agentId: string;
  agentName: string;
  agentSlug: string;
  agentRole: string;
  shadowUserId: string;
}

/**
 * Authenticate an agent request using Bearer token.
 * Looks up the agent by token hash, then finds the linked shadow user.
 */
export async function authenticateAgent(
  request: Request
): Promise<AgentContext | null> {
  // Support both Bearer header and x-agent-token header
  const authHeader = request.headers.get("authorization") || "";
  const agentTokenHeader = request.headers.get(AGENT_AUTH_HEADER) || "";

  let token: string | null = null;

  if (authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (agentTokenHeader) {
    token = agentTokenHeader.trim();
  }

  if (!token) return null;

  // Find agent by comparing token hash
  // Since bcrypt comparison is expensive and we may have many agents,
  // we fetch all agents and compare (small agent count expected)
  const agents = await prisma.agent.findMany();

  for (const agent of agents) {
    if (!agent.apiTokenHash) continue;

    const valid = await bcrypt.compare(token, agent.apiTokenHash);
    if (valid) {
      // Find shadow user by matching username pattern
      const shadowUser = await prisma.user.findUnique({
        where: { username: `agent-${agent.slug}` },
      });

      if (!shadowUser) {
        console.error(`Shadow user not found for agent ${agent.slug}`);
        return null;
      }

      return {
        agentId: agent.id,
        agentName: agent.name,
        agentSlug: agent.slug,
        agentRole: agent.roleTitle,
        shadowUserId: shadowUser.id,
      };
    }
  }

  return null;
}

/**
 * Generate a new API token for an agent.
 * Returns the plain token (to be shown once) and the hashed version for storage.
 */
export async function generateAgentToken(): Promise<{
  plain: string;
  hashed: string;
}> {
  const plain = generateSecureToken();
  const hashed = await bcrypt.hash(plain, 10);
  return { plain, hashed };
}

function generateSecureToken(): string {
  // Use Node.js crypto in server context
  try {
    const { randomBytes } = require("crypto");
    return randomBytes(24).toString("hex");
  } catch {
    // Browser fallback (should not happen in API routes)
    const bytes = new Uint8Array(24);
    if (typeof crypto !== "undefined" && (crypto as any).getRandomValues) {
      (crypto as any).getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
