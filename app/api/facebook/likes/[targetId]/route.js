import { NextResponse } from 'next/server';
import { callFbApi, getTokenFromRequest } from '@/lib/facebook';

export async function POST(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  const { targetId } = await params;
  try {
    const data = await callFbApi({ path: `/${targetId}/likes`, method: 'POST', token });
    return NextResponse.json({ success: data });
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  const { targetId } = await params;
  try {
    const data = await callFbApi({ path: `/${targetId}/likes`, method: 'DELETE', token });
    return NextResponse.json({ success: data });
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}
