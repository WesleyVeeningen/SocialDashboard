'use client';

import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function EditPostDialog({ post, onSaved }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) setMessage(post.message || post.story || '');
  }, [open, post]);

  const handleSave = async () => {
    if (!message.trim()) return;
    setIsSaving(true);
    try {
      await onSaved(post.id, message.trim());
      toast.success('Post updated');
      setOpen(false);
    } catch (err) {
      toast.error(`Failed to update: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground
              hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Edit post</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Update the text of this post on your Facebook Page.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!message.trim() || isSaving}>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
