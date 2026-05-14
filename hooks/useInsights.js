'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccounts } from './useAccounts';

export function useInsights() {
  const { activeAccount } = useAccounts();
  const [insights, setInsights] = useState([]);
  const [fans, setFans] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    if (!activeAccount?.token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/facebook/insights', {
        headers: { 'x-fb-token': activeAccount.token },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInsights(data.insights || []);
      setFans(data.fans || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount?.token, activeAccount?.id]);

  useEffect(() => {
    setInsights([]);
    setFans(null);
    fetchInsights();
  }, [activeAccount?.id]);

  const getMetric = useCallback((name) => {
    return insights.find((m) => m.name === name);
  }, [insights]);

  const getMetricTotal = useCallback((name) => {
    const metric = getMetric(name);
    if (!metric?.values) return 0;
    return metric.values.reduce((sum, v) => sum + (v.value || 0), 0);
  }, [getMetric]);

  const getMetricTimeSeries = useCallback((name) => {
    const metric = getMetric(name);
    if (!metric?.values) return [];
    return metric.values.map((v) => ({
      date: new Date(v.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: v.value || 0,
    }));
  }, [getMetric]);

  return {
    insights,
    fans,
    isLoading,
    error,
    getMetric,
    getMetricTotal,
    getMetricTimeSeries,
    refresh: fetchInsights,
  };
}
