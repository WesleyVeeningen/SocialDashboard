'use client';

import Image from 'next/image';
import { Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatRelativeTime } from '@/lib/utils';
import DeletePostButton from './DeletePostButton';

export default function PostCard({ post, onDelete }) {
  const likeCount = post.likes?.summary?.total_count ?? 0;
  const commentCount = post.comments?.summary?.total_count ?? 0;
  const message = post.message || post.story || '';

  return (
    <Card className="flex flex-col gap-0 overflow-hidden">
      {post.full_picture && (
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <Image
            src={post.full_picture}
            alt="Post image"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <CardHeader className="pb-2 pt-4">
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(post.created_time)}
        </p>
      </CardHeader>

      {message && (
        <CardContent className="pt-0 pb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </CardContent>
      )}

      <Separator />

      <CardFooter className="py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            {likeCount}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            {commentCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {post.permalink_url && (
            <a
              href={post.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <DeletePostButton postId={post.id} onDeleted={onDelete} />
        </div>
      </CardFooter>
    </Card>
  );
}
