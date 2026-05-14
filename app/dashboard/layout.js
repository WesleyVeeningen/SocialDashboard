'use client';

import { useState } from 'react';
import { Share2, Plus, Menu } from 'lucide-react';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';
import AccountTabBar from '@/components/layout/AccountTabBar';
import TopBar from '@/components/layout/TopBar';
import AccountSwitcher from '@/components/layout/AccountSwitcher';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAccounts } from '@/hooks/useAccounts';

function WelcomeScreen() {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full flex flex-col items-center justify-center h-full gap-6 text-center px-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-150" />
        <div className="relative rounded-2xl bg-primary/10 border border-primary/20 p-6">
          <Share2 className="h-12 w-12 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Welkom bij MijnZetel</h1>
        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
          Voeg je eerste Facebook pagina-token toe om te beginnen.
        </p>
      </div>
      <Button onClick={() => setOpen(true)} size="lg" className="gap-2 shadow-md">
        <Plus className="h-5 w-5" />
        Add Your First Account
      </Button>
      <AccountSwitcher open={open} onOpenChange={setOpen} />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { accounts, activeAccount } = useAccounts();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (accounts.length === 0) {
    return (
      <div className="flex h-screen bg-background">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex border-r bg-card shadow-sm">
        <Sidebar />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-56">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-card md:hidden shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Image src="/logo.png" alt="Logo" width={60} height={30} className="object-contain" />
        </div>

        <AccountTabBar />
        {activeAccount && <TopBar />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
