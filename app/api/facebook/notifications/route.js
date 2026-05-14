import { NextResponse } from 'next/server';
import { callFbApi, getTokenFromRequest } from '@/lib/facebook';

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  try {
    const [conversations, mentions] = await Promise.allSettled([
      callFbApi({
        path: '/me/conversations',
        token,
        params: { fields: 'id,snippet,updated_time,unread_count,participants', limit: '25' },
      }),
      callFbApi({
        path: '/me/tagged',
        token,
        params: { fields: 'id,message,created_time,from,full_picture', limit: '25' },
      }),
    ]);

    return NextResponse.json({
      conversations: conversations.status === 'fulfilled' ? (conversations.value.data ?? []) : [],
      mentions: mentions.status === 'fulfilled' ? (mentions.value.data ?? []) : [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}
