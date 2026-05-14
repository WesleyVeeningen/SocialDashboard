'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { usePosts } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';
import { useAccounts } from '@/hooks/useAccounts';
import CommentList from '@/components/comments/CommentList';
import AddCommentForm from '@/components/comments/AddCommentForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { truncate } from '@/lib/utils';

export default function CommentsPage() {
  const { activeAccount } = useAccounts();
  const { posts, isLoading: postsLoading } = usePosts();
  const [selectedPostId, setSelectedPostId] = useState('');
  const { comments, isLoading: commentsLoading, error, addComment, toggleLike } = useComments(selectedPostId);

  const handleAddComment = async (targetId, message) => {
    try {
      await addComment(targetId, message);
      toast.success('Comment posted!');
    } catch (err) {
      toast.error(`Failed to comment: ${err.message}`);
      throw err;
    }
  };

  if (!activeAccount) {
    return (
      <div className="text-muted-foreground text-sm py-12 text-center">
        Select an account to view comments.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View and reply to comments on your posts
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Select a Post</label>
        <Select value={selectedPostId} onValueChange={setSelectedPostId} disabled={postsLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={postsLoading ? 'Loading posts…' : 'Choose a post to view comments'} />
          </SelectTrigger>
          <SelectContent>
            {posts.map((post) => (
              <SelectItem key={post.id} value={post.id}>
                {truncate(post.message || post.story || 'Untitled post', 80)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPostId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Comments
              {comments.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({comments.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddCommentForm
              targetId={selectedPostId}
              placeholder="Write a comment on this post…"
              onSubmit={handleAddComment}
            />
            <Separator />
            <CommentList
              comments={comments}
              isLoading={commentsLoading}
              error={error}
              onReply={handleAddComment}
              onLike={toggleLike}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
