import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const rooms = await prisma.room.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { posts: true },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  return NextResponse.json({ rooms });
}
