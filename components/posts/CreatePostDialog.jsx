'use client';

import { useState, useRef } from 'react';
import { Plus, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAccounts } from '@/hooks/useAccounts';

export default function CreatePostDialog({ onCreated }) {
  const { activeAccount } = useAccounts();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    removePhoto();
    setMessage('');
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !photo) return;
    setIsPosting(true);
    try {
      if (photo) {
        const formData = new FormData();
        formData.append('photo', photo);
        if (message.trim()) formData.append('message', message.trim());

        const res = await fetch('/api/facebook/posts', {
          method: 'POST',
          headers: { 'x-fb-token': activeAccount.token },
          body: formData,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        await onCreated(null, true);
      } else {
        await onCreated(message.trim());
      }

      toast.success('Post published!');
      handleClose();
    } catch (err) {
      toast.error(`Failed to post: ${err.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  const canSubmit = (message.trim() || photo) && !isPosting;

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 gap-2 shadow-lg z-10 rounded-full h-14 px-6"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-5 w-5" />
        New Post
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Write your post and publish it to your Facebook Page.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              autoFocus
            />

            {photoPreview && (
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full max-h-56 object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full shadow"
                  onClick={removePhoto}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                {photo ? 'Change Photo' : 'Add Photo'}
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {isPosting ? 'Publishing…' : 'Publish'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
