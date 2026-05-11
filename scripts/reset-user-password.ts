import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/lib/generated/prisma/client';

async function main() {
  const usernameArg = process.argv[2];
  const passwordArg = process.argv[3];

  if (!usernameArg || !passwordArg) {
    throw new Error('Usage: tsx scripts/reset-user-password.ts <username> <newPassword>');
  }

  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const username = usernameArg.trim();

    const users = await prisma.user.findMany({
      select: { id: true, username: true, mustChangePassword: true },
    });

    const matches = users.filter(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (matches.length !== 1) {
      console.log(
        JSON.stringify(
          {
            ok: false,
            reason: 'user_lookup_failed',
            matchCount: matches.length,
            requested: username,
            candidates: users.map((u) => u.username),
          },
          null,
          2
        )
      );
      process.exitCode = 1;
      return;
    }

    const target = matches[0];
    const passwordHash = await bcrypt.hash(passwordArg, 10);

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        passwordHash,
        mustChangePassword: true,
        passwordChangedAt: null,
      },
      select: {
        username: true,
        mustChangePassword: true,
        passwordChangedAt: true,
      },
    });

    console.log(JSON.stringify({ ok: true, updated }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
