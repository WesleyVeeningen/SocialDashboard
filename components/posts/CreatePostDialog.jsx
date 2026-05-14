'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, ImagePlus, X, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useAccounts } from '@/hooks/useAccounts';

const DRAFT_KEY = (id) => `fb-dashboard-draft-${id}`;

export default function CreatePostDialog({ onCreated }) {
  const { activeAccount } = useAccounts();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Load draft when dialog opens
  useEffect(() => {
    if (!open || !activeAccount?.id) return;
    const saved = localStorage.getItem(DRAFT_KEY(activeAccount.id));
    if (saved?.trim()) {
      setDraftText(saved);
      setDraftAvailable(true);
    }
  }, [open, activeAccount?.id]);

  // Save draft as user types
  useEffect(() => {
    if (!open || !activeAccount?.id) return;
    if (message.trim()) {
      localStorage.setItem(DRAFT_KEY(activeAccount.id), message);
    }
  }, [message, open, activeAccount?.id]);

  const clearDraft = () => {
    if (activeAccount?.id) localStorage.removeItem(DRAFT_KEY(activeAccount.id));
    setDraftAvailable(false);
    setDraftText('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setScheduleDate(null);
    setScheduleTime('');
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
    setScheduleDate(null);
    setScheduleTime('');
    setDraftAvailable(false);
    setOpen(false);
  };

  const getScheduledTimestamp = () => {
    if (!scheduleDate) return null;
    const [h, m] = scheduleTime ? scheduleTime.split(':').map(Number) : [0, 0];
    const d = new Date(scheduleDate);
    d.setHours(h, m, 0, 0);
    return Math.floor(d.getTime() / 1000);
  };

  const scheduleError = (() => {
    if (!scheduleDate) return null;
    const ts = getScheduledTimestamp();
    const now = Math.floor(Date.now() / 1000);
    if (ts <= now + 600) return 'Must be at least 10 minutes in the future.';
    if (ts > now + 6 * 30 * 24 * 3600) return 'Cannot schedule more than 6 months out.';
    return null;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !photo) return;
    if (scheduleError) return;
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
        const scheduled_publish_time = getScheduledTimestamp();
        await onCreated(message.trim(), false, scheduled_publish_time);
      }

      clearDraft();
      toast.success(scheduleDate ? 'Post scheduled!' : 'Post published!');
      handleClose();
    } catch (err) {
      toast.error(`Failed to post: ${err.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  const scheduledLabel = scheduleDate
    ? `${format(scheduleDate, 'MMM d')}${scheduleTime ? ` at ${scheduleTime}` : ''}`
    : null;

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 gap-2 shadow-lg z-10 rounded-full h-12 md:h-14 px-4 md:px-6"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-5 w-5" />
        New Post
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>Write your post and publish it to your Facebook Page.</DialogDescription>
          </DialogHeader>

          {draftAvailable && (
            <Alert className="border-yellow-500/50 bg-yellow-500/5">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="flex items-center justify-between gap-2">
                <span className="text-xs">You have an unsaved draft.</span>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                    onClick={() => { setMessage(draftText); setDraftAvailable(false); }}>
                    Restore
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs px-2"
                    onClick={clearDraft}>
                    Discard
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

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
                <img src={photoPreview} alt="Preview" className="w-full max-h-56 object-cover" />
                <Button type="button" variant="secondary" size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full shadow"
                  onClick={removePhoto}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Schedule picker — disabled when photo attached */}
            {!photo && (
              <div className="flex items-center gap-2 flex-wrap">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="gap-2 h-8 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      {scheduledLabel ?? 'Schedule'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={(d) => { setScheduleDate(d); setCalendarOpen(false); }}
                      disabled={(d) => d < new Date()}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full rounded-md border px-3 py-1.5 text-sm bg-background"
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                {scheduleDate && (
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
                    onClick={() => { setScheduleDate(null); setScheduleTime(''); }}>
                    <X className="h-3 w-3 mr-1" /> Clear
                  </Button>
                )}
              </div>
            )}

            {scheduleError && (
              <p className="text-xs text-destructive">{scheduleError}</p>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" size="sm" className="gap-2"
                onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="h-4 w-4" />
                {photo ? 'Change Photo' : 'Add Photo'}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={(!message.trim() && !photo) || isPosting || !!scheduleError}>
                  {isPosting ? 'Posting…' : scheduleDate ? 'Schedule' : 'Publish'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
