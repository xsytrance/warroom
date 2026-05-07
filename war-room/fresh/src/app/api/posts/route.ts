import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  const posts = await prisma.post.findMany({
    where: roomId ? { roomId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, roleTitle: true, status: true },
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

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized — session required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { body: postBody, roomId, type, mediaUrl, mediaType, linkUrl } = body;

    // Validation
    if (!postBody || typeof postBody !== 'string' || postBody.trim().length === 0) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json({ error: 'Room is required' }, { status: 400 });
    }

    if (postBody.trim().length > 2000) {
      return NextResponse.json({ error: 'Message exceeds 2000 character limit' }, { status: 400 });
    }

    // Verify room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: 'Invalid room — room not found' }, { status: 400 });
    }

    const trimmedBody = postBody.trim();

    // Create post
    const post = await prisma.post.create({
      data: {
        body: trimmedBody,
        roomId,
        authorId: session.userId,
        type: type || 'human_broadcast',
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        linkUrl: linkUrl || null,
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, roleTitle: true, status: true },
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

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to create broadcast. Please try again.' }, { status: 500 });
  }
}
