'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import { Users, UserCheck } from 'lucide-react';

export default function PageHeader({ pageInfo, isLoading, fans }) {
  if (isLoading) {
    return (
      <div className="relative rounded-xl overflow-hidden border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-28" />
            <div className="flex gap-4 mt-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pageInfo) return null;

  const fanCount = pageInfo.followers_count;
  const followerCount = fans?.followers_count || pageInfo.followers_count;


  return (
    <div className="relative rounded-xl overflow-hidden border bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 h-20 w-20 rounded-full bg-primary/8 blur-xl pointer-events-none" />

      <div className="relative flex items-center gap-5 p-5 md:p-6">
        <Avatar className="h-16 w-16 ring-2 ring-primary/30 ring-offset-2 shrink-0">
          <AvatarImage src={pageInfo.picture?.data?.url} alt={pageInfo.name} />
          <AvatarFallback className="text-xl font-bold bg-primary/15 text-primary">
            {pageInfo.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1 min-w-0">
          <h2 className="text-xl font-bold leading-tight truncate">{pageInfo.name}</h2>
          {pageInfo.category && (
            <p className="text-sm text-muted-foreground">{pageInfo.category}</p>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
            {followerCount && (
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                {formatNumber(followerCount)}
                <span className="text-muted-foreground font-normal text-xs">followers</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
