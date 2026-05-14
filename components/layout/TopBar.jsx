'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts } from '@/hooks/useAccounts';
import { formatNumber } from '@/lib/utils';
import { Users } from 'lucide-react';

export default function TopBar() {
  const { activeAccount } = useAccounts();
  const [pageInfo, setPageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeAccount?.token) {
      setPageInfo(null);
      return;
    }

    setIsLoading(true);
    fetch('/api/facebook/page-info', {
      headers: { 'x-fb-token': activeAccount.token },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setPageInfo(data);
      })
      .finally(() => setIsLoading(false));
  }, [activeAccount?.id, activeAccount?.token]);

  if (!activeAccount) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
      {isLoading ? (
        <>
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </>
      ) : pageInfo ? (
        <>
          <Avatar className="h-9 w-9">
            <AvatarImage src={pageInfo.picture?.data?.url} alt={pageInfo.name} />
            <AvatarFallback>{pageInfo.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-tight">{pageInfo.name}</p>
            {pageInfo.category && (
              <p className="text-xs text-muted-foreground">{pageInfo.category}</p>
            )}
          </div>
          {(pageInfo.fan_count || pageInfo.followers_count) && (
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Users className="h-3 w-3" />
                {formatNumber(pageInfo.fan_count || pageInfo.followers_count)} followers
              </Badge>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-muted-foreground">
          {activeAccount.name} — unable to load page info
        </div>
      )}
    </div>
  );
}
