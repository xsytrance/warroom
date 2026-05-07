import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const MAX_COMMENT_LENGTH = 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
  }

  // Verify post exists
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, roleTitle: true },
      },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postId, body: commentBody } = body;

    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'Broadcast ID is required' }, { status: 400 });
    }

    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0) {
      return NextResponse.json({ error: 'Reply cannot be empty' }, { status: 400 });
    }

    if (commentBody.trim().length > MAX_COMMENT_LENGTH) {
      return NextResponse.json({ error: `Reply exceeds ${MAX_COMMENT_LENGTH} character limit` }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: session.userId,
        body: commentBody.trim(),
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, roleTitle: true },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('POST comment error:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
