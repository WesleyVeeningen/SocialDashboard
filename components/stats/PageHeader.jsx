'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import { Users, UserCheck } from 'lucide-react';

export default function PageHeader({ pageInfo, isLoading, fans }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-6 rounded-xl border bg-card">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!pageInfo) return null;

  return (
    <div className="flex items-center gap-4 p-6 rounded-xl border bg-card">
      <Avatar className="h-16 w-16">
        <AvatarImage src={pageInfo.picture?.data?.url} alt={pageInfo.name} />
        <AvatarFallback className="text-xl font-bold">
          {pageInfo.name?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h2 className="text-lg font-bold leading-tight">{pageInfo.name}</h2>
        {pageInfo.category && (
          <p className="text-sm text-muted-foreground">{pageInfo.category}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {(fans?.fan_count || pageInfo.fan_count) && (
            <Badge variant="secondary" className="gap-1.5">
              <Users className="h-3 w-3" />
              {formatNumber(fans?.fan_count || pageInfo.fan_count)} likes
            </Badge>
          )}
          {(fans?.followers_count || pageInfo.followers_count) && (
            <Badge variant="secondary" className="gap-1.5">
              <UserCheck className="h-3 w-3" />
              {formatNumber(fans?.followers_count || pageInfo.followers_count)} followers
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
