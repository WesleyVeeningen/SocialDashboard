'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts } from '@/hooks/useAccounts';
import { formatNumber } from '@/lib/utils';
import { Users } from 'lucide-react';

export default function TopBar() {
  const { activeAccount } = useAccounts();
  const [pageInfo, setPageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeAccount?.token) { setPageInfo(null); return; }
    setIsLoading(true);
    fetch('/api/facebook/page-info', { headers: { 'x-fb-token': activeAccount.token } })
      .then((r) => r.json())
      .then((data) => { if (!data.error) setPageInfo(data); })
      .finally(() => setIsLoading(false));
  }, [activeAccount?.id, activeAccount?.token]);

  if (!activeAccount) return null;

  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b bg-card/80 backdrop-blur shrink-0">
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-18" />
          </div>
        </>
      ) : pageInfo ? (
        <>
          <Avatar className="h-8 w-8 ring-1 ring-border shrink-0">
            <AvatarImage src={pageInfo.picture?.data?.url} alt={pageInfo.name} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {pageInfo.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">{pageInfo.name}</p>
            {pageInfo.category && (
              <p className="text-xs text-muted-foreground truncate">{pageInfo.category}</p>
            )}
          </div>
          {pageInfo.followers_count && (
            <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">
                {formatNumber(pageInfo.followers_count)}
              </span>
              followers
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{activeAccount.name}</p>
      )}
    </div>
  );
}
