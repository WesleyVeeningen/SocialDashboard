'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutGrid, MessageSquare, BarChart2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AccountSwitcher from './AccountSwitcher';

const navItems = [
  { href: '/dashboard/posts', label: 'Posts', icon: LayoutGrid },
  { href: '/dashboard/comments', label: 'Comments', icon: MessageSquare },
  { href: '/dashboard/stats', label: 'Analytics', icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r bg-card h-full">
      <div className="flex items-center px-4 py-3 border-b">
        <Image src="/logo.png" alt="Logo" width={80} height={40} className="object-contain" />
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => setSwitcherOpen(true)}
        >
          <Settings className="h-4 w-4" />
          Manage Accounts
        </Button>
      </div>

      <AccountSwitcher open={switcherOpen} onOpenChange={setSwitcherOpen} />
    </aside>
  );
}
