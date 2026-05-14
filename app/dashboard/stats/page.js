'use client';

import { useState, useEffect } from 'react';
import { useInsights } from '@/hooks/useInsights';
import { useAccounts } from '@/hooks/useAccounts';
import StatCard from '@/components/stats/StatCard';
import InsightsChart from '@/components/stats/InsightsChart';
import PageHeader from '@/components/stats/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Eye, MousePointerClick, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StatsPage() {
  const { activeAccount } = useAccounts();
  const { fans, isLoading, error, getMetricTotal, getMetricTimeSeries, refresh } = useInsights();
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Followers"
          value={fans?.followers_count}
          icon={Users}
          subtitle="Page followers"
          isLoading={isLoading}
        />
        <StatCard
          title="Impressions"
          value={getMetricTotal('page_impressions')}
          icon={Eye}
          subtitle="30-day total"
          isLoading={isLoading}
        />
        <StatCard
          title="Reach"
          value={getMetricTotal('page_impressions_unique')}
          icon={TrendingUp}
          subtitle="Unique accounts"
          isLoading={isLoading}
        />
        <StatCard
          title="Engaged Users"
          value={getMetricTotal('page_engaged_users')}
          icon={MousePointerClick}
          subtitle="People who interacted"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightsChart
          title="Daily Impressions"
          data={impressionsData}
          type="line"
          color="#3b82f6"
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
    </div>
  );
}
