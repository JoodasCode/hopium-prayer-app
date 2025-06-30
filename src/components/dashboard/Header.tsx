'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bell, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useUserState } from '@/contexts/UserStateContext';

export function Header() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { userState } = useUserState();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="md:hidden">  
          {/* Spacer for mobile to balance the right side icons */}
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold">
            {userState.isLoading ? 'Loading...' : `Welcome, ${userState.name || 'Friend'}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                {userState.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    {userState.unreadNotifications}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  Your recent prayer notifications and reminders.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Notification items would go here */}
                <div className="text-center text-muted-foreground py-8">
                  No new notifications
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>{userState.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {userState.name || 'User'}
                <p className="text-xs text-muted-foreground">{userState.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
