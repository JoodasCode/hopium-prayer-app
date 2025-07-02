'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, Calendar, BarChart, Settings, Menu, BookOpen, MessageSquare } from 'lucide-react';
// Removed UserStateContext dependency

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  // Simplified sidebar
  const [open, setOpen] = useState(false);
  
  const routes = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      color: 'text-sky-500',
    },
    {
      label: 'Prayer Calendar',
      icon: Calendar,
      href: '/dashboard/calendar',
      color: 'text-violet-500',
    },
    {
      label: 'Insights',
      icon: BarChart,
      href: '/dashboard/insights',
      color: 'text-pink-500',
    },
    {
      label: 'Lopi AI',
      icon: MessageSquare,
      href: '/dashboard/lopi',
      color: 'text-emerald-500',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'text-orange-500',
    },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-4 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <MobileSidebar routes={routes} pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0", className)}>
        <div className="flex-1 flex flex-col min-h-0 border-r border-border bg-card">
          <DesktopSidebar routes={routes} pathname={pathname} />
        </div>
      </div>
    </>
  );
}

function MobileSidebar({ routes, pathname }: { routes: any[]; pathname: string }) {
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="px-4 py-6 flex items-center border-b">
        <BookOpen className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-lg font-semibold">Hopium</h2>
      </div>
      <ScrollArea className="flex-1 p-3">
        <nav className="flex flex-col gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === route.href ? "bg-accent" : "transparent"
              )}
            >
              <route.icon className={cn("h-4 w-4", route.color)} />
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

function DesktopSidebar({ routes, pathname }: { routes: any[]; pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 flex items-center">
        <BookOpen className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-lg font-semibold">Hopium</h2>
      </div>
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === route.href ? "bg-accent" : "transparent"
              )}
            >
              <route.icon className={cn("h-4 w-4", route.color)} />
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
