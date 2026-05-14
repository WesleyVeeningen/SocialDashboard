'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, ExternalLink, BarChart2, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRelativeTime } from '@/lib/utils';
import PostInsightsSheet from './PostInsightsSheet';
import DeletePostButton from './DeletePostButton';
import EditPostDialog from './EditPostDialog';

export default function PostCard({ post, onDelete, onEdit }) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const likeCount = post.likes?.summary?.total_count ?? 0;
  const commentCount = post.comments?.summary?.total_count ?? 0;
  const message = post.message || post.story || '';

  return (
    <>
      <div
        className="group relative flex flex-col rounded-xl border bg-card overflow-hidden cursor-pointer
          shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        onClick={() => setInsightsOpen(true)}
      >
        {/* Image */}
        {post.full_picture ? (
          <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
            <Image
              src={post.full_picture}
              alt="Post image"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              unoptimized
            />
            {/* Gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-2 bg-gradient-to-r from-primary/60 via-primary/30 to-primary/10" />
        )}

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            {formatRelativeTime(post.created_time)}
          </p>
          {message ? (
            <p className="text-sm leading-relaxed line-clamp-3 text-foreground/90">{message}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Photo post</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30">
          {/* Engagement */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-medium tabular-nums">{likeCount.toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-medium tabular-nums">{commentCount.toLocaleString()}</span>
            </span>
          </div>

          {/* Actions — always visible but subtle */}
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground
                    hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setInsightsOpen(true); }}
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>View performance</TooltipContent>
            </Tooltip>

            {post.permalink_url && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={post.permalink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground
                      hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Open on Facebook</TooltipContent>
              </Tooltip>
            )}

            {onEdit && <EditPostDialog post={post} onSaved={onEdit} />}
            <DeletePostButton postId={post.id} onDeleted={onDelete} />
          </div>
        </div>
      </div>

      <PostInsightsSheet
        postId={post.id}
        post={post}
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
      />
    </>
  );
}
