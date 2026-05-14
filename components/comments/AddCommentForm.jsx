'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AddCommentForm({ targetId, placeholder = 'Write a comment…', onSubmit, onCancel }) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(targetId, message.trim());
      setMessage('');
      if (onCancel) onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="resize-none text-sm"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={!message.trim() || isSubmitting} className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </form>
  );
}
