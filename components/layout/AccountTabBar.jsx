'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAccounts } from '@/hooks/useAccounts';
import AccountSwitcher from './AccountSwitcher';

export default function AccountTabBar() {
  const { accounts, activeAccountId, setActiveAccount } = useAccounts();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (accounts.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-card overflow-x-auto shrink-0">
      <Tabs value={activeAccountId ?? ''} onValueChange={setActiveAccount}>
        <TabsList className="h-8 bg-transparent p-0 gap-1">
          {accounts.map((account) => (
            <TabsTrigger
              key={account.id}
              value={account.id}
              className="h-8 px-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
            >
              {account.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 ml-1"
        onClick={() => setSwitcherOpen(true)}
        title="Add account"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <AccountSwitcher open={switcherOpen} onOpenChange={setSwitcherOpen} />
    </div>
  );
}
