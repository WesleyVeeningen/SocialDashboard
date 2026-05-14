'use client';

import { useState, useEffect } from 'react';
import { useInsights } from '@/hooks/useInsights';
import { useAccounts } from '@/hooks/useAccounts';
import { usePosts } from '@/hooks/usePosts';
import StatCard from '@/components/stats/StatCard';
import InsightsChart from '@/components/stats/InsightsChart';
import PageHeader from '@/components/stats/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, MousePointerClick, TrendingUp, RefreshCw, Heart, MessageCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber, truncate } from '@/lib/utils';

export default function StatsPage() {
  const { activeAccount } = useAccounts();
  const { fans, isLoading, error, getMetricTotal, getMetricTimeSeries, refresh } = useInsights();
  const { posts } = usePosts();
  const topPosts = [...posts]
    .sort((a, b) =>
      ((b.likes?.summary?.total_count ?? 0) + (b.comments?.summary?.total_count ?? 0)) -
      ((a.likes?.summary?.total_count ?? 0) + (a.comments?.summary?.total_count ?? 0))
    )
    .slice(0, 5);
  const [pageInfo, setPageInfo] = useState(null);
  const [pageInfoLoading, setPageInfoLoading] = useState(false);

  useEffect(() => {
    if (!activeAccount?.token) {
      setPageInfo(null);
      return;
    }
    setPageInfoLoading(true);
    fetch('/api/facebook/page-info', {
      headers: { 'x-fb-token': activeAccount.token },
    })
      .then((r) => r.json())
      .then((data) => { if (!data.error) setPageInfo(data); })
      .finally(() => setPageInfoLoading(false));
  }, [activeAccount?.id, activeAccount?.token]);

  if (!activeAccount) {
    return (
      <div className="text-muted-foreground text-sm py-12 text-center">
        Select an account to view analytics.
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl">
        <AlertDescription>
          {error.includes('190') || error.toLowerCase().includes('token')
            ? 'Your access token may be expired or lack insights permissions. Please update it in Manage Accounts.'
            : `Error loading insights: ${error}`}
        </AlertDescription>
      </Alert>
    );
  }

  const impressionsData = getMetricTimeSeries('page_impressions');
  const reachData = getMetricTimeSeries('page_impressions_unique');
  const engagementData = getMetricTimeSeries('page_engaged_users');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Last 30 days</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <PageHeader pageInfo={pageInfo} isLoading={pageInfoLoading} fans={fans} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total Followers"
          value={fans?.followers_count}
          icon={Users}
          subtitle="Page followers"
          accent="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Impressions"
          value={getMetricTotal('page_impressions')}
          icon={Eye}
          subtitle="30-day total"
          accent="purple"
          isLoading={isLoading}
        />
        <StatCard
          title="Reach"
          value={getMetricTotal('page_impressions_unique')}
          icon={TrendingUp}
          subtitle="Unique accounts"
          accent="emerald"
          isLoading={isLoading}
        />
        <StatCard
          title="Engaged Users"
          value={getMetricTotal('page_engaged_users')}
          icon={MousePointerClick}
          subtitle="People who interacted"
          accent="orange"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightsChart
          title="Daily Impressions"
          data={impressionsData}
          type="line"
          color="#6366f1"
          isLoading={isLoading}
        />
        <InsightsChart
          title="Daily Reach"
          data={reachData}
          type="bar"
          color="#8b5cf6"
          isLoading={isLoading}
        />
      </div>

      {engagementData.length > 0 && (
        <InsightsChart
          title="Daily Engaged Users"
          data={engagementData}
          type="line"
          color="#10b981"
          isLoading={isLoading}
        />
      )}

      {/* Top Posts */}
      {topPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Top Performing Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {topPosts.map((post, i) => {
                const likes = post.likes?.summary?.total_count ?? 0;
                const comments = post.comments?.summary?.total_count ?? 0;
                return (
                  <div key={post.id} className="flex items-start gap-3 px-4 py-3">
                    <span className={`shrink-0 text-sm font-bold tabular-nums w-5 mt-0.5 ${
                      i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'
                    }`}>#{i + 1}</span>
                    <p className="flex-1 text-sm text-muted-foreground line-clamp-2 min-w-0">
                      {truncate(post.message || post.story || 'Photo post', 120)}
                    </p>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-rose-400" />
                        {formatNumber(likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                        {formatNumber(comments)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
