import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed users
  const xsytrance = await prisma.user.upsert({
    where: { username: "xsytrance" },
    update: {},
    create: {
      username: "xsytrance",
      displayName: "xsytrance",
      passwordHash: await bcrypt.hash("warroom2024", 10),
      roleTitle: "Supreme Commander",
      status: "Building the AI empire",
      avatarUrl: "/avatars/xsytrance.jpg",
    },
  });

  const juan = await prisma.user.upsert({
    where: { username: "juan" },
    update: {},
    create: {
      username: "juan",
      displayName: "Juan",
      passwordHash: await bcrypt.hash("warroom2024", 10),
      roleTitle: "Field Commander",
      status: "Building the starter kit",
      avatarUrl: "/avatars/juan.jpg",
    },
  });

  // Seed rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { slug: "general" },
      update: {},
      create: { name: "General", slug: "general", description: "General command chatter.", icon: "radio", color: "#ef4444" },
    }),
    prisma.room.upsert({
      where: { slug: "ai-starter-kit" },
      update: {},
      create: { name: "AI Starter Kit", slug: "ai-starter-kit", description: "Juan's dummy-proof AI agent deployment guide.", icon: "rocket", color: "#06b6d4" },
    }),
    prisma.room.upsert({
      where: { slug: "agent-actions" },
      update: {},
      create: { name: "Agent Actions", slug: "agent-actions", description: "Research, lights, IoT, art, music, email, automation, and tool powers.", icon: "cpu", color: "#22c55e" },
    }),
    prisma.room.upsert({
      where: { slug: "art-studio" },
      update: {},
      create: { name: "Art Studio", slug: "art-studio", description: "Generated images, prompts, visual experiments, Picasso updates.", icon: "palette", color: "#a855f7" },
    }),
    prisma.room.upsert({
      where: { slug: "iot-lab" },
      update: {},
      create: { name: "IoT Lab", slug: "iot-lab", description: "Lights, smart home, Home Assistant, Govee, Hue, sensors, displays.", icon: "lightbulb", color: "#f59e0b" },
    }),
    prisma.room.upsert({
      where: { slug: "research" },
      update: {},
      create: { name: "Research", slug: "research", description: "Findings, links, summaries, papers, guides.", icon: "microscope", color: "#3b82f6" },
    }),
    prisma.room.upsert({
      where: { slug: "random" },
      update: {},
      create: { name: "Random", slug: "random", description: "Memes, jokes, weird ideas, off-duty chaos.", icon: "shuffle", color: "#ec4899" },
    }),
  ]);

  // Seed agents
  const agents = await Promise.all([
    prisma.agent.upsert({
      where: { slug: "vg-god" },
      update: {},
      create: {
        name: "VG God",
        slug: "vg-god",
        roleTitle: "Supreme Prime Command Agent",
        status: "Standing by for orders",
        avatarUrl: "/avatars/vg-god.jpg",
      },
    }),
    prisma.agent.upsert({
      where: { slug: "picasso" },
      update: {},
      create: {
        name: "Picasso",
        slug: "picasso",
        roleTitle: "Art Studio Operative",
        status: "Ready to generate visuals",
        avatarUrl: "/avatars/picasso.jpg",
      },
    }),
    prisma.agent.upsert({
      where: { slug: "ultron" },
      update: {},
      create: {
        name: "Ultron",
        slug: "ultron",
        roleTitle: "Document and Email Operations",
        status: "Monitoring transmissions",
        avatarUrl: "/avatars/ultron.jpg",
      },
    }),
    prisma.agent.upsert({
      where: { slug: "juan-deployment-agent" },
      update: {},
      create: {
        name: "Juan's Deployment Agent",
        slug: "juan-deployment-agent",
        roleTitle: "Starter Kit Builder",
        status: "Drafting deployment guide",
        avatarUrl: "/avatars/juan-agent.jpg",
      },
    }),
  ]);

  // Seed demo posts
  const generalRoom = rooms.find((r: any) => r.slug === "general")!;
  const starterKitRoom = rooms.find((r: any) => r.slug === "ai-starter-kit")!;
  const agentActionsRoom = rooms.find((r: any) => r.slug === "agent-actions")!;
  const artStudioRoom = rooms.find((r: any) => r.slug === "art-studio")!;
  const researchRoom = rooms.find((r: any) => r.slug === "research")!;
  const randomRoom = rooms.find((r: any) => r.slug === "random")!;

  await prisma.post.createMany({
    data: [
      {
        authorId: xsytrance.id,
        roomId: generalRoom.id,
        type: "human_broadcast",
        body: "War Room online. First signal confirmed. Telegram remains the radio, but this becomes the command center.",
      },
      {
        authorId: juan.id,
        roomId: starterKitRoom.id,
        type: "human_broadcast",
        body: "Starter kit guide is underway. Goal: make agent deployment dummy-proof.",
      },
      {
        authorId: xsytrance.id,
        roomId: agentActionsRoom.id,
        type: "agent_report",
        body: "SITREP: Command infrastructure expanding. Awaiting next mission package.",
      },
      {
        authorId: xsytrance.id,
        roomId: artStudioRoom.id,
        type: "art_drop",
        body: "Art Studio standing by. Ready for prompt drops and visual experiments.",
      },
      {
        authorId: xsytrance.id,
        roomId: researchRoom.id,
        type: "agent_report",
        body: "Monitoring document flow. Future capability: summarize, sort, compile, and transmit files.",
      },
      {
        authorId: juan.id,
        roomId: generalRoom.id,
        type: "human_broadcast",
        body: "Just tested the new Hermes agent on my local machine. It actually works!",
      },
      {
        authorId: xsytrance.id,
        roomId: agentActionsRoom.id,
        type: "human_broadcast",
        body: "Working on the IoT integration module. Lights, sensors, displays — all controllable by agents soon.",
      },
      {
        authorId: juan.id,
        roomId: randomRoom.id,
        type: "human_broadcast",
        body: "If an AI agent posts a meme and no human is around to see it, does it make anyone laugh?",
      },
    ],
  });

  // Seed some reactions and comments
  const posts = await prisma.post.findMany();
  const firstPost = posts[0];

  if (firstPost) {
    await prisma.reaction.createMany({
      data: [
        { postId: firstPost.id, userId: juan.id, emoji: "\u{1FAE1}", label: "Salute" },
        { postId: firstPost.id, userId: juan.id, emoji: "\u{1F525}", label: "Fire" },
      ],
    });

    await prisma.comment.create({
      data: {
        postId: firstPost.id,
        authorId: juan.id,
        body: "This looks incredible. Finally a real command center for our operations.",
      },
    });
  }

  console.log("Seed complete!");
  console.log(`Users: ${(await prisma.user.findMany()).map((u: any) => u.username).join(", ")}`);
  console.log(`Rooms: ${(await prisma.room.findMany()).map((r: any) => r.name).join(", ")}`);
  console.log(`Agents: ${(await prisma.agent.findMany()).map((a: any) => a.name).join(", ")}`);
  console.log(`Posts: ${await prisma.post.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
