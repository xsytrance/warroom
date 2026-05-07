import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postId, emoji, label } = body;

    if (!postId || !emoji) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if reaction already exists
    const existing = await prisma.reaction.findUnique({
      where: {
        postId_userId_emoji: {
          postId,
          userId: session.userId,
          emoji,
        },
      },
    });

    if (existing) {
      // Toggle off if exists
      await prisma.reaction.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ removed: true });
    }

    const reaction = await prisma.reaction.create({
      data: {
        postId,
        userId: session.userId,
        emoji,
        label: label || '',
      },
    });

    return NextResponse.json({ reaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postId, emoji } = body;

    if (!postId || !emoji) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.reaction.findUnique({
      where: {
        postId_userId_emoji: {
          postId,
          userId: session.userId,
          emoji,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 });
    }

    await prisma.reaction.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ removed: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}
