'use client';

import { usePosts } from '@/hooks/usePosts';
import { useAccounts } from '@/hooks/useAccounts';
import PostList from '@/components/posts/PostList';
import CreatePostDialog from '@/components/posts/CreatePostDialog';

export default function PostsPage() {
  const { activeAccount } = useAccounts();
  const { posts, isLoading, error, hasMore, loadMore, createPost, deletePost } = usePosts();

  if (!activeAccount) {
    return (
      <div className="text-muted-foreground text-sm py-12 text-center">
        Select an account to view posts.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your page posts
          </p>
        </div>
      </div>

      <PostList
        posts={posts}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onDelete={deletePost}
      />

      <CreatePostDialog onCreated={createPost} />
    </div>
  );
}
