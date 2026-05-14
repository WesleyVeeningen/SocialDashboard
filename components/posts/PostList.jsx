'use client';

import { PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PostCard from './PostCard';

function PostSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="border-t px-4 py-2.5 flex items-center justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

export default function PostList({ posts, isLoading, error, hasMore, onLoadMore, onDelete, onEdit }) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.includes('190') || error.toLowerCase().includes('token')
            ? 'Your access token may be expired. Please update it in Manage Accounts.'
            : `Error loading posts: ${error}`}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <PenSquare className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">No posts yet</p>
          <p className="text-sm text-muted-foreground">Create your first post to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading} className="min-w-32">
            {isLoading ? 'Loading…' : 'Load more posts'}
          </Button>
        </div>
      )}
    </div>
  );
}
