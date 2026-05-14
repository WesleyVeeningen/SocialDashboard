'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Download, Clock, Trash2, Search, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { useAccounts } from '@/hooks/useAccounts';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import PostList from '@/components/posts/PostList';
import CreatePostDialog from '@/components/posts/CreatePostDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { exportPostsCsv } from '@/lib/exportCsv';
import { filterPosts } from '@/lib/filterPosts';
import { truncate } from '@/lib/utils';

function ScheduledPostSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="h-4 w-4 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export default function PostsPage() {
  const { activeAccount } = useAccounts();
  const { posts, isLoading, error, hasMore, loadMore, createPost, deletePost, editPost } = usePosts();
  const { posts: scheduled, isLoading: scheduledLoading, deleteScheduledPost } = useScheduledPosts();
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredPosts = useMemo(
    () => filterPosts(posts, { search, filter }),
    [posts, search, filter]
  );

  const handleDeleteScheduled = async (postId) => {
    setDeletingId(postId);
    try {
      await deleteScheduledPost(postId);
      toast.success('Scheduled post removed');
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (!activeAccount) {
    return (
      <div className="text-muted-foreground text-sm py-12 text-center">
        Select an account to view posts.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your page posts</p>
        </div>
        <Button
          variant="outline" size="sm" className="gap-1.5"
          disabled={posts.length === 0}
          onClick={() => exportPostsCsv(posts, activeAccount.name)}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All posts</SelectItem>
            <SelectItem value="with_image">With image</SelectItem>
            <SelectItem value="text_only">Text only</SelectItem>
            <SelectItem value="most_liked">Most liked</SelectItem>
            <SelectItem value="most_comments">Most comments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Scheduled posts */}
      {(scheduledLoading || scheduled.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Scheduled Posts
              {scheduled.length > 0 && <Badge variant="secondary">{scheduled.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {scheduledLoading ? (
              <div className="divide-y">
                {Array.from({ length: 3 }).map((_, i) => <ScheduledPostSkeleton key={i} />)}
              </div>
            ) : (
              <div className="divide-y">
                {scheduled.map((post) => {
                  const publishAt = post.scheduled_publish_time
                    ? new Date(post.scheduled_publish_time * 1000)
                    : null;
                  return (
                    <div key={post.id} className="flex items-start gap-3 px-4 py-3">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{truncate(post.message || 'No message', 100)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {publishAt
                            ? format(publishAt, "MMM d, yyyy 'at' h:mm a")
                            : 'Scheduled'}
                        </p>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        disabled={deletingId === post.id}
                        onClick={() => handleDeleteScheduled(post.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Post count when filtering */}
      {(search || filter !== 'all') && !isLoading && (
        <p className="text-sm text-muted-foreground">
          {filteredPosts.length} of {posts.length} posts
        </p>
      )}

      <PostList
        posts={filteredPosts}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore && !search && filter === 'all'}
        onLoadMore={loadMore}
        onDelete={deletePost}
        onEdit={editPost}
      />

      <CreatePostDialog onCreated={createPost} />
    </div>
  );
}
