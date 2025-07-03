'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart2, Bot, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', icon: Home, path: '/dashboard' },
  { name: 'Stats', icon: BarChart2, path: '/stats' },
  { name: 'Mulvi', icon: Bot, path: '/mulvi' },
  { name: 'Settings', icon: Settings, path: '/settings' }
];

export default function PhantomBottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom z-40">
      <div className="max-w-md mx-auto flex items-center justify-between px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center py-3 flex-1 transition-all relative
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground active:text-primary/70'}`}
            >
              <div className={`p-2 rounded-full mb-1 transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                <item.icon size={20} />
              </div>
              <span className="text-[0.65rem] font-medium">{item.name}</span>
              {isActive && <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-6 rounded-t-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
