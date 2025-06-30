'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bell, BookOpen, MessageSquare, Calendar as CalendarIcon } from 'lucide-react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import BottomNav from '@/components/shared/BottomNav';

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Hopium</span>
          </div>
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                  <SheetDescription>
                    Your recent prayer notifications and reflections.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Asr Prayer</h4>
                      <p className="text-sm text-muted-foreground">Time to pray Asr in 30 minutes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">New Reflection</h4>
                      <p className="text-sm text-muted-foreground">Lopi AI has insights about your prayer journey.</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Avatar>
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content with Dashboard */}
      <main>
        <Dashboard />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
