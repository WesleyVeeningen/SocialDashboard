import { NextResponse } from 'next/server';
import { callFbApi, getTokenFromRequest } from '@/lib/facebook';

export async function POST(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  const { targetId } = await params;
  try {
    const { message } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    const data = await callFbApi({ path: `/${targetId}/comments`, method: 'POST', token, body: { message } });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  const { targetId } = await params;
  try {
    // Facebook hides a comment via POST /{id}?is_hidden=true
    const url = new URL(`https://graph.facebook.com/v19.0/${targetId}`);
    url.searchParams.set('access_token', token);
    url.searchParams.set('is_hidden', 'true');
    const res = await fetch(url.toString(), { method: 'POST', cache: 'no-store' });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return NextResponse.json({ success: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  const { targetId } = await params;
  try {
    const data = await callFbApi({ path: `/${targetId}`, method: 'DELETE', token });
    return NextResponse.json({ success: data });
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}
