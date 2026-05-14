'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutGrid, MessageSquare, BarChart2, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AccountSwitcher from './AccountSwitcher';
import ThemeToggle from './ThemeToggle';
import { useNotifications } from '@/hooks/useNotifications';

const navItems = [
  { href: '/dashboard/posts', label: 'Posts', icon: LayoutGrid },
  { href: '/dashboard/comments', label: 'Comments', icon: MessageSquare },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/stats', label: 'Analytics', icon: BarChart2 },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { totalUnread } = useNotifications();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full">
      <div className="flex items-center px-4 py-3 border-b">
        <Image src="/logo.png" alt="Logo" width={80} height={40} className="object-contain" />
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary-foreground' : '')} />
                <span className="flex-1 truncate">{label}</span>
                {href === '/dashboard/notifications' && totalUnread > 0 && (
                  <span className={cn(
                    'inline-flex items-center justify-center h-5 min-w-5 rounded-full text-[10px] font-bold px-1.5',
                    active
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary text-primary-foreground'
                  )}>
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => setSwitcherOpen(true)}
        >
          <Settings className="h-4 w-4" />
          Manage Accounts
        </Button>
        <div className="flex justify-start mt-1 pl-1">
          <ThemeToggle />
        </div>
      </div>

      <AccountSwitcher open={switcherOpen} onOpenChange={setSwitcherOpen} />
    </aside>
  );
}
