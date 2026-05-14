'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Search, SlidersHorizontal, Download, CheckSquare, ChevronsUpDown, Check } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';
import { useAccounts } from '@/hooks/useAccounts';
import CommentList from '@/components/comments/CommentList';
import AddCommentForm from '@/components/comments/AddCommentForm';
import BulkActionBar from '@/components/comments/BulkActionBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, truncate } from '@/lib/utils';
import { filterComments } from '@/lib/filterComments';
import { exportCommentsCsv } from '@/lib/exportCsv';

export default function CommentsPage() {
  const { activeAccount } = useAccounts();
  const { posts, isLoading: postsLoading } = usePosts();
  const [selectedPostId, setSelectedPostId] = useState('');
  const [postComboOpen, setPostComboOpen] = useState(false);
  const { comments, isLoading: commentsLoading, error, addComment, toggleLike, hideComment, deleteComment, bulkHide, bulkDelete } = useComments(selectedPostId);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const filteredComments = useMemo(
    () => filterComments(comments, { search, filter }),
    [comments, search, filter]
  );

  const handleAddComment = async (targetId, message) => {
    try {
      await addComment(targetId, message);
      toast.success('Comment posted!');
    } catch (err) {
      toast.error(`Failed to comment: ${err.message}`);
      throw err;
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkHide = async () => {
    setIsBulkProcessing(true);
    try {
      await bulkHide([...selectedIds]);
      toast.success(`${selectedIds.size} comment(s) hidden`);
      setSelectedIds(new Set());
    } catch { toast.error('Some comments could not be hidden'); }
    finally { setIsBulkProcessing(false); }
  };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    try {
      await bulkDelete([...selectedIds]);
      toast.success(`${selectedIds.size} comment(s) deleted`);
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch { toast.error('Some comments could not be deleted'); }
    finally { setIsBulkProcessing(false); }
  };

  if (!activeAccount) return (
    <div className="text-muted-foreground text-sm py-12 text-center">Select an account to view comments.</div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and reply to comments on your posts</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Select a Post</label>
        <Popover open={postComboOpen} onOpenChange={setPostComboOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between font-normal"
              disabled={postsLoading}
            >
              <span className="truncate text-left">
                {selectedPostId
                  ? truncate(posts.find((p) => p.id === selectedPostId)?.message || posts.find((p) => p.id === selectedPostId)?.story || 'Untitled post', 70)
                  : postsLoading ? 'Loading posts…' : 'Choose a post to view comments'}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 ml-2 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search posts…" />
              <CommandList>
                <CommandEmpty>No posts found.</CommandEmpty>
                <CommandGroup>
                  {posts.map((post) => {
                    const label = truncate(post.message || post.story || 'Untitled post', 80);
                    return (
                      <CommandItem
                        key={post.id}
                        value={label}
                        onSelect={() => {
                          setSelectedPostId(post.id);
                          setSearch(''); setFilter('all');
                          setSelectedIds(new Set()); setSelectMode(false);
                          setPostComboOpen(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4 shrink-0', selectedPostId === post.id ? 'opacity-100' : 'opacity-0')} />
                        {label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedPostId && (
        <Card>
          <CardHeader className="pb-3 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">
                Comments
                {comments.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filteredComments.length}{filteredComments.length !== comments.length ? ` of ${comments.length}` : ''})
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"
                  disabled={comments.length === 0}
                  onClick={() => exportCommentsCsv(comments, activeAccount.name)}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                <Button variant={selectMode ? 'secondary' : 'outline'} size="sm" className="gap-1.5 h-8 text-xs"
                  disabled={comments.length === 0}
                  onClick={() => { setSelectMode((v) => !v); setSelectedIds(new Set()); }}>
                  <CheckSquare className="h-3.5 w-3.5" /> Select
                </Button>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search comments…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs" />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unanswered">Unanswered</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <AddCommentForm targetId={selectedPostId} placeholder="Write a comment on this post…" onSubmit={handleAddComment} />
            <Separator />
            <CommentList
              comments={filteredComments}
              isLoading={commentsLoading}
              error={error}
              onReply={handleAddComment}
              onLike={toggleLike}
              onHide={hideComment}
              onDelete={deleteComment}
              selectable={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          </CardContent>
        </Card>
      )}

      <BulkActionBar
        selectedCount={selectedIds.size}
        onHide={handleBulkHide}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds(new Set())}
        isProcessing={isBulkProcessing}
      />
    </div>
  );
}
