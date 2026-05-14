'use client';

import { LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PostCard from './PostCard';

function PostSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function PostList({ posts, isLoading, error, hasMore, onLoadMore, onDelete }) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">No posts yet. Create your first post!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={onDelete} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading…' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
