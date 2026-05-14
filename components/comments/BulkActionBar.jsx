'use client';

import { useState } from 'react';
import { Trash2, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function BulkActionBar({ selectedCount, onHide, onDelete, onClear, isProcessing }) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border bg-card shadow-lg px-4 py-2">
      <span className="text-sm font-medium mr-1">{selectedCount} selected</span>

      <Button size="sm" variant="outline" className="gap-1.5 rounded-full h-8"
        onClick={onHide} disabled={isProcessing}>
        <EyeOff className="h-3.5 w-3.5" />
        Hide
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" className="gap-1.5 rounded-full h-8" disabled={isProcessing}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} comment{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes them from Facebook. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
