'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAccounts } from '@/hooks/useAccounts';
import { formatNumber } from '@/lib/utils';
import { Eye, Users, MousePointerClick, TrendingUp } from 'lucide-react';

const REACTIONS = { LIKE: '👍', LOVE: '❤️', HAHA: '😂', WOW: '😮', SORRY: '😢', ANGER: '😡' };

const METRICS = [
  { key: 'impressions', label: 'Impressions', icon: Eye, accent: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'reach',       label: 'Reach',        icon: Users, accent: 'text-blue-500',  bg: 'bg-blue-500/10' },
  { key: 'engaged',     label: 'Engaged',      icon: MousePointerClick, accent: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

function MetricTile({ icon: Icon, label, value, accent, bg, isLoading }) {
  return (
    <div className={`rounded-xl p-4 ${bg} border border-transparent`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      {isLoading
        ? <Skeleton className="h-8 w-16" />
        : <p className={`text-2xl font-bold ${accent}`}>{formatNumber(value ?? 0)}</p>
      }
    </div>
  );
}

export default function PostInsightsSheet({ postId, post, open, onOpenChange }) {
  const { activeAccount } = useAccounts();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !postId || !activeAccount?.token) return;
    setIsLoading(true);
    setData(null);
    setError(null);
    fetch(`/api/facebook/posts/${postId}/insights`, {
      headers: { 'x-fb-token': activeAccount.token },
    })
      .then((r) => r.json())
      .then((d) => { if (d.error) throw new Error(d.error); setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [open, postId, activeAccount?.token]);

  const reactions = data?.reactions?.value ?? {};
  const hasReactions = Object.keys(reactions).length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <SheetTitle>Post Performance</SheetTitle>
          </div>
          {post?.message && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {post.message}
            </p>
          )}
        </SheetHeader>

        {error ? (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">
              {error.includes('190') ? 'Token expired — update in Manage Accounts.' : error}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3">
              {METRICS.map(({ key, label, icon, accent, bg }) => (
                <MetricTile
                  key={key}
                  icon={icon}
                  label={label}
                  value={data?.[key]?.values?.[0]?.value}
                  accent={accent}
                  bg={bg}
                  isLoading={isLoading}
                />
              ))}
            </div>

            {!isLoading && !hasReactions && (
              <p className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-xl">
                No insights yet — data may take up to 24h to appear.
              </p>
            )}

            {(isLoading || hasReactions) && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-semibold mb-3">Reactions breakdown</p>
                  {isLoading ? (
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(reactions).map(([type, count]) => (
                        <div key={type} className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-3 gap-1">
                          <span className="text-2xl">{REACTIONS[type] ?? '👍'}</span>
                          <span className="text-sm font-bold">{formatNumber(count)}</span>
                          <span className="text-[10px] text-muted-foreground capitalize">{type.toLowerCase()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
