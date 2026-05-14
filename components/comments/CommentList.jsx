'use client';

import { MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CommentItem from './CommentItem';

function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function CommentList({ comments, isLoading, error, onReply, onLike }) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.includes('190') || error.toLowerCase().includes('token')
            ? 'Your access token may be expired. Please update it in Manage Accounts.'
            : `Error loading comments: ${error}`}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <CommentSkeleton key={i} />)}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No comments on this post yet.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[600px] pr-4">
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} onReply={onReply} onLike={onLike} />
        ))}
      </div>
    </ScrollArea>
  );
}
