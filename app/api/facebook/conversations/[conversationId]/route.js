import { NextResponse } from 'next/server';
import { callFbApi, getTokenFromRequest } from '@/lib/facebook';

export async function GET(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  const { conversationId } = await params;
  try {
    const data = await callFbApi({
      path: `/${conversationId}/messages`,
      token,
      params: { fields: 'message,created_time,from', limit: '20' },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}

export async function POST(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  const { message, recipientId } = await request.json();
  if (!recipientId) return NextResponse.json({ error: 'recipientId required' }, { status: 400 });
  try {
    const data = await callFbApi({
      path: '/me/messages',
      method: 'POST',
      token,
      body: {
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: 'RESPONSE',
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}
