import { NextResponse } from 'next/server';
import { callFbApi, getTokenFromRequest } from '@/lib/facebook';

const METRICS = [
  'page_impressions',
  'page_impressions_unique',
  'page_engaged_users',
  'page_fan_adds',
];

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const fetchMetric = (metric) =>
    callFbApi({
      path: '/me/insights',
      token,
      params: {
        metric,
        period: 'day',
        since: thirtyDaysAgo.toString(),
        until: now.toString(),
      },
    }).then((res) => res.data?.[0] ?? null).catch(() => null);

  try {
    const [metricResults, fans] = await Promise.all([
      Promise.all(METRICS.map(fetchMetric)),
      callFbApi({ path: '/me', token, params: { fields: 'fan_count,followers_count' } }),
    ]);

    const insights = metricResults.filter(Boolean);
    return NextResponse.json({ insights, fans });
  } catch (err) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  }
}
