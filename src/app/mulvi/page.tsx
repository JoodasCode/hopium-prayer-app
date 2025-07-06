'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatTimeForAPI, formatChatTime } from '@/lib/timeUtils';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/lib/greetings';
import { useUserStats } from '@/hooks/useUserStats';
import { usePrayerWithRecords } from '@/hooks/usePrayerWithRecords';
import { MulviSkeleton } from '@/components/skeletons/MulviSkeleton';

export default function MulviPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;
  
  // Get real user data
  const { userStats, isLoading: statsLoading } = useUserStats(userId);
  const { todaysProgress, nextPrayer, isLoading: prayerLoading } = usePrayerWithRecords({ userId });
  
  // Show loading state while data is loading
  if (authLoading || statsLoading || prayerLoading) {
    return <MulviSkeleton />;
  }
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, content: string, role: 'user' | 'assistant', created_at: string}>>([
    {
      id: '1',
      content: "Assalamu alaikum! I'm Mulvi, your AI spiritual companion. How can I support your spiritual journey today?",
      role: 'assistant',
      created_at: new Date().toISOString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user' as const,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare messages array for API
      const messagesForAPI = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get user's actual name and data
      const userName = getDisplayName(user) || 'friend';
      const userEmail = user?.email || '';
      
      // Determine current prayer period based on time
      const currentHour = new Date().getHours();
      let currentPrayerPeriod = 'afternoon';
      if (currentHour >= 5 && currentHour < 12) currentPrayerPeriod = 'morning';
      else if (currentHour >= 12 && currentHour < 15) currentPrayerPeriod = 'midday';
      else if (currentHour >= 15 && currentHour < 18) currentPrayerPeriod = 'afternoon';
      else if (currentHour >= 18 && currentHour < 20) currentPrayerPeriod = 'evening';
      else currentPrayerPeriod = 'night';

      // Call the actual chat API with enhanced context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesForAPI,
          userContext: {
            userName: userName,
            userEmail: userEmail,
            userId: userId,
            currentTime: formatTimeForAPI(new Date()),
            currentPrayerPeriod: currentPrayerPeriod,
            
            // Real user stats
            currentStreak: userStats?.current_streak || 0,
            totalPrayers: userStats?.total_prayers_completed || 0,
            completionRate: userStats?.completion_rate || 0,
            
            // Today's progress
            todayCompleted: todaysProgress?.completed || 0,
            todayTotal: todaysProgress?.total || 5,
            
            // Next prayer info
            nextPrayerInfo: nextPrayer ? `${nextPrayer.name} at ${nextPrayer.time.toLocaleTimeString()}` : 'upcoming prayer',
            
            // Account info
            accountAge: user?.created_at ? Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
            
            // User metadata from auth
            userMetadata: user?.user_metadata || {}
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here to help with your spiritual journey.",
        role: 'assistant' as const,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please make sure your OpenAI API key is configured in your .env.local file. In the meantime, I'm still here to support your spiritual journey!",
        role: 'assistant' as const,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isTyping) return;
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background backdrop-blur-md border-b border-border/20 pt-safe-top pb-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                className="touch-target"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-chart-1/15 flex items-center justify-center">
                <Bot className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Mulvi</h1>
                <p className="text-sm text-muted-foreground">Your AI spiritual companion</p>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-2" style={{ paddingTop: '120px' }}>
        <div className="space-y-4 max-w-3xl mx-auto w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 w-full",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {/* Assistant Avatar */}
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                  <AvatarImage src="/mulvi-avatar.png" alt="Mulvi" />
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={cn(
                "max-w-[85%] sm:max-w-[80%] space-y-2",
                message.role === 'user' ? 'text-right' : 'text-left'
              )}>
                {/* Message Bubble */}
                <div className={cn(
                  "inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/80'
                )}>
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className={cn(
                  "flex items-center gap-2 text-xs text-muted-foreground px-2",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  <Clock className="h-3 w-3" />
                  <span>{formatChatTime(new Date(message.created_at))}</span>
                </div>
              </div>
              
              {/* User Avatar */}
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 w-full justify-start">
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarImage src="/mulvi-avatar.png" alt="Mulvi" />
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[85%] sm:max-w-[80%]">
                <div className="inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed bg-muted/80">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-muted-foreground text-xs">Mulvi is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Mulvi about prayers, Islamic guidance, or spiritual support..."
                className="min-h-[44px] max-h-32 resize-none pr-12 text-sm leading-relaxed"
                disabled={isTyping}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
