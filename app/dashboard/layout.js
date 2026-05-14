'use client';

import { useState } from 'react';
import { Share2, Plus } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import AccountTabBar from '@/components/layout/AccountTabBar';
import TopBar from '@/components/layout/TopBar';
import AccountSwitcher from '@/components/layout/AccountSwitcher';
import { Button } from '@/components/ui/button';
import { useAccounts } from '@/hooks/useAccounts';

function WelcomeScreen() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-6">
      <div className="rounded-full bg-blue-500/10 p-6">
        <Share2 className="h-12 w-12 text-blue-500" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Welcome to Social Dashboard</h1>
        <p className="text-muted-foreground max-w-sm">
          Add your first Facebook Page Access Token to get started managing your pages.
        </p>
      </div>
      <Button onClick={() => setOpen(true)} size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Add Your First Account
      </Button>
      <AccountSwitcher open={open} onOpenChange={setOpen} />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { accounts, activeAccount } = useAccounts();

  if (accounts.length === 0) {
    return (
      <div className="flex h-screen">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AccountTabBar />
        {activeAccount && <TopBar />}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
