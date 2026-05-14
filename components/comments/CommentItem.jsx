'use client';

import { useState } from 'react';
import { CornerDownRight, ThumbsUp, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn, formatRelativeTime } from '@/lib/utils';
import AddCommentForm from './AddCommentForm';

export default function CommentItem({
  comment, onReply, onLike, onHide, onDelete,
  isReply = false, selectable = false, selected = false, onToggleSelect,
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const replies = comment.comments?.data || [];

  const handleReply = async (targetId, message) => {
    await onReply(targetId, message);
    setShowReplyForm(false);
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => wasLiked ? c - 1 : c + 1);
    try {
      await onLike(comment.id, wasLiked);
    } catch (err) {
      setLiked(wasLiked);
      setLikeCount((c) => wasLiked ? c + 1 : c - 1);
      toast.error(`Could not like: ${err.message}`);
    } finally {
      setIsLiking(false);
    }
  };

  const handleHide = async () => {
    if (!onHide) return;
    setIsHiding(true);
    try {
      await onHide(comment.id);
      setHidden(true);
      toast.success('Comment hidden');
    } catch (err) {
      toast.error(`Could not hide: ${err.message}`);
    } finally {
      setIsHiding(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (err) {
      toast.error(`Could not delete: ${err.message}`);
      setIsDeleting(false);
    }
  };

  if (hidden) {
    return (
      <div className={`flex gap-3 ${isReply ? 'ml-9' : ''}`}>
        <div className="h-8 w-8 shrink-0" />
        <p className="text-xs text-muted-foreground italic py-1">Comment hidden</p>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-9' : ''}`}>
      {selectable && !isReply && (
        <div className="flex items-start pt-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect?.(comment.id)}
            className="h-4 w-4"
          />
        </div>
      )}

      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {comment.from?.name?.[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="rounded-xl bg-muted px-3 py-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold">{comment.from?.name ?? 'Unknown'}</span>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_time)}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.message}</p>
        </div>

        <div className="flex items-center gap-0.5 mt-1 pl-1">
          <Button
            variant="ghost" size="sm"
            className={cn(
              'h-auto py-0.5 px-2 text-xs gap-1.5 rounded-full',
              liked ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-500/10' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={handleLike} disabled={isLiking}
          >
            <ThumbsUp className={cn('h-3 w-3', liked && 'fill-current')} />
            {likeCount > 0 && <span>{likeCount}</span>}
            Like
          </Button>

          <Button
            variant="ghost" size="sm"
            className="h-auto py-0.5 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-full"
            onClick={() => setShowReplyForm((v) => !v)}
          >
            <CornerDownRight className="h-3 w-3" />
            Reply
          </Button>

          {onHide && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="h-auto py-0.5 px-2 text-xs text-muted-foreground hover:text-orange-500 gap-1.5 rounded-full"
                  disabled={isHiding}
                >
                  <EyeOff className="h-3 w-3" />
                  Hide
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hide this comment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The comment will be hidden from other users but you can unhide it later from Facebook.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleHide}>Hide</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="h-auto py-0.5 px-2 text-xs text-muted-foreground hover:text-destructive gap-1.5 rounded-full"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the comment from Facebook. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-2">
            <AddCommentForm
              targetId={comment.id}
              placeholder={`Reply to ${comment.from?.name ?? 'comment'}…`}
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onLike={onLike}
                onHide={onHide}
                onDelete={onDelete}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
