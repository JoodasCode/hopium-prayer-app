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
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-40">
      <div className="flex items-center justify-center gap-8 px-6 py-2 pb-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center transition-all rounded-xl p-2 min-h-[48px] min-w-[48px]
                ${isActive ? 'text-chart-1 bg-chart-1/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 active:bg-muted/50'}`}
            >
              <div className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[0.6rem] font-medium mt-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
