'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Plus, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAccounts } from '@/hooks/useAccounts';

export default function AccountSwitcher({ open, onOpenChange }) {
  const { accounts, addAccount, removeAccount } = useAccounts();
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !token.trim()) return;
    setIsAdding(true);
    try {
      addAccount({ name: name.trim(), token: token.trim() });
      toast.success(`Account "${name.trim()}" added`);
      setName('');
      setToken('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (account) => {
    removeAccount(account.id);
    toast.info(`Account "${account.name}" removed`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-500" />
            Manage Accounts
          </DialogTitle>
          <DialogDescription>
            Add your Facebook Page Access Tokens to manage multiple pages.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acct-name">Account Label</Label>
            <Input
              id="acct-name"
              placeholder="e.g. My Business Page"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acct-token">Page Access Token</Label>
            <Input
              id="acct-token"
              type="password"
              placeholder="EAAx..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your token from the Facebook Graph API Explorer or your app dashboard.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={!name.trim() || !token.trim() || isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </form>

        {accounts.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-sm font-medium text-muted-foreground">Existing Accounts</p>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="font-medium truncate">{account.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleRemove(account)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
