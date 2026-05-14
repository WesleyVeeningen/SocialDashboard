import { NextResponse } from 'next/server';
import { callFbApi, getTokenFromRequest } from '@/lib/facebook';

export async function GET(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  const { postId } = await params;

  const fetchMetric = (metric) =>
    callFbApi({
      path: `/${postId}/insights`,
      token,
      params: { metric, period: 'lifetime' },
    }).then((r) => r.data?.[0] ?? null).catch(() => null);

  try {
    const [impressions, reach, engaged, reactions] = await Promise.all([
      fetchMetric('post_impressions'),
      fetchMetric('post_impressions_unique'),
      fetchMetric('post_engaged_users'),
      fetchMetric('post_reactions_by_type_total'),
    ]);

    return NextResponse.json({ impressions, reach, engaged, reactions });
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}
