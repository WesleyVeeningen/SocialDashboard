import { NextResponse } from 'next/server';
import { callFbApi, getTokenFromRequest } from '@/lib/facebook';

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const after = searchParams.get('after');

  try {
    const data = await callFbApi({
      path: '/me/posts',
      token,
      params: {
        fields: 'id,message,story,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true)',
        limit: '10',
        ...(after ? { after } : {}),
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}

export async function POST(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const message = formData.get('message') || '';
      const photo = formData.get('photo');

      if (!photo) {
        return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
      }

      const fbForm = new FormData();
      fbForm.append('source', photo);
      if (message.trim()) fbForm.append('message', message.trim());
      fbForm.append('access_token', token);

      const res = await fetch(`https://graph.facebook.com/v19.0/me/photos`, {
        method: 'POST',
        body: fbForm,
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return NextResponse.json(data);
    }

    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const data = await callFbApi({
      path: '/me/feed',
      method: 'POST',
      token,
      body: { message },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}
