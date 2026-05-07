/**
 * Generate or rotate an API token for a War Room agent.
 *
 * Usage:
 *   npx tsx scripts/generate-agent-token.ts <agent-slug>
 *   npm run agent:token -- <agent-slug>
 *
 * Example:
 *   npm run agent:token -- picasso
 *
 * The plain token is printed ONCE to stdout.
 * The bcrypt hash is stored in Agent.apiTokenHash.
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.error("Usage: npx tsx scripts/generate-agent-token.ts <agent-slug>");
    console.error("");
    console.error("Available agents:");
    const agents = await prisma.agent.findMany({ orderBy: { name: "asc" } });
    for (const a of agents) {
      console.error(`  ${a.slug} — ${a.name}`);
    }
    process.exit(1);
  }

  const agent = await prisma.agent.findUnique({
    where: { slug },
  });

  if (!agent) {
    console.error(`Agent not found: "${slug}"`);
    console.error("Run without arguments to see available agents.");
    process.exit(1);
  }

  // Generate new token
  const plainToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = await bcrypt.hash(plainToken, 10);

  // Store hash
  await prisma.agent.update({
    where: { slug },
    data: { apiTokenHash: tokenHash },
  });

  // Ensure shadow user exists
  await prisma.user.upsert({
    where: { username: `agent-${slug}` },
    update: {},
    create: {
      username: `agent-${slug}`,
      displayName: agent.name,
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
      roleTitle: "Autonomous Agent",
      status: agent.status,
      avatarUrl: agent.avatarUrl,
    },
  });

  console.log("\n========================================");
  console.log(`Agent: ${agent.name} (${slug})`);
  console.log("Token generated successfully.");
  console.log("========================================");
  console.log("\n--- PLAIN TOKEN (COPY THIS NOW) ---");
  console.log(plainToken);
  console.log("--- END TOKEN ---");
  console.log("\nThis token will NOT be shown again.");
  console.log("Store it in your agent's environment variable.");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
