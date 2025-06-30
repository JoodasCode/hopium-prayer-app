'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User, MessageSquare, BarChart3, Compass } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Qibla', href: '/qibla', icon: Compass },
    { name: 'Lopi', href: '/lopi', icon: MessageSquare },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10">
      <div className="container max-w-md mx-auto px-2">
        <div className="flex justify-between items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex flex-col items-center justify-center w-1/6 py-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
