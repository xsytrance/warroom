import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/lib/generated/prisma/client';

async function main() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash('warroom2024', 10);
    const user = await prisma.user.update({
      where: { username: 'xsytrance' },
      data: {
        passwordHash,
        mustChangePassword: true,
        passwordChangedAt: null,
      },
      select: {
        username: true,
        mustChangePassword: true,
      },
    });

    console.log(JSON.stringify({ ok: true, user }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
