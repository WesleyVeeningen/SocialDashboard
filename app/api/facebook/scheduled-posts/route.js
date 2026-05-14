import { NextResponse } from 'next/server';
import { callFbApi, getTokenFromRequest } from '@/lib/facebook';

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  try {
    const data = await callFbApi({
      path: '/me/scheduled_posts',
      token,
      params: { fields: 'id,message,scheduled_publish_time,full_picture', limit: '20' },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}
