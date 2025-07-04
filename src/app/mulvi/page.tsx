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
  Clock,
  TrendingUp,
  Target,
  Bell,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { usePrayerInsights } from '@/hooks/usePrayerInsights';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function MulviPage() {
  const router = useRouter();
  const { user, session, authLoading } = useAuth();
  const userId = user?.id;
  const { insights, isLoading: insightsLoading } = usePrayerInsights(userId);
  const { 
    prayerTimes, 
    nextPrayer, 
    prayers, 
    location, 
    isLoading: prayerTimesLoading 
  } = usePrayerTimes({ userId });
  const {
    conversations,
    currentConversation,
    messages,
    isLoading: conversationsLoading,
    createConversation,
    loadConversation,
    sendMessage
  } = useConversations(userId);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Scroll to bottom when messages change
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping || isCreatingConversation) return;

    // If no conversation exists, create one first
    if (!currentConversation && userId && !isCreatingConversation) {
      setIsCreatingConversation(true);
      try {
        const conversationId = await createConversation();
        if (!conversationId) {
          console.error('Failed to create conversation');
          return;
        }
        // Wait a moment for the conversation to be set
        await new Promise(resolve => setTimeout(resolve, 100));
      } finally {
        setIsCreatingConversation(false);
      }
    }

    if (!currentConversation) {
      console.error('No conversation available');
      return;
    }

    const message = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore the input if sending failed
      setInput(message);
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

  // Show loading state while checking authentication or creating initial conversation
  if (authLoading || (userId && !currentConversation && !conversationsLoading && conversations.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Loading Mulvi...' : 'Preparing your conversation...'}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Meet Mulvi</CardTitle>
            <p className="text-muted-foreground">
              Your AI spiritual companion for prayer guidance and Islamic wisdom
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Sign in to chat with Mulvi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b bg-card/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src="/mulvi-avatar.png" alt="Mulvi" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg leading-none">Mulvi</h1>
            <p className="text-sm text-muted-foreground truncate">
              Your AI spiritual companion
            </p>
          </div>
          
          <Badge variant="secondary" className="shrink-0">
            <Sparkles className="h-3 w-3 mr-1" />
            AI
          </Badge>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 sm:p-6">
        <div className="space-y-6 max-w-3xl mx-auto w-full">
          {/* Insights as chat messages - Only show if we have insights */}
          {insights && insights.length > 0 && (
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight, index) => (
                <div key={`insight-${index}`} className="flex gap-3 w-full justify-start">
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarImage src="/mulvi-avatar.png" alt="Mulvi" />
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="max-w-[85%] sm:max-w-[80%] space-y-2 text-left">
                    <div className="inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed bg-muted/80">
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded-full bg-primary/10 shrink-0 mt-0.5">
                          {insight.type === 'streak' && <TrendingUp className="h-3 w-3 text-primary" />}
                          {insight.type === 'challenge' && <Target className="h-3 w-3 text-primary" />}
                          {insight.type === 'progress' && <Zap className="h-3 w-3 text-primary" />}
                          {insight.type === 'reminder' && <Bell className="h-3 w-3 text-primary" />}
                          {insight.type === 'achievement' && <Sparkles className="h-3 w-3 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium leading-tight mb-1">
                            {insight.title}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 justify-start">
                      <Clock className="h-3 w-3" />
                      <span>Now</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Separator between insights and regular messages */}
              {messages.length > 0 && (
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs text-muted-foreground bg-background px-3">Earlier messages</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
              )}
            </div>
          )}

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
                  <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                <div className="inline-block rounded-2xl px-4 py-3 bg-muted/80">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">Mulvi is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t bg-card/50 backdrop-blur-sm safe-area-bottom">
        <div className="max-w-3xl mx-auto w-full">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3 items-center"
          >
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Mulvi about prayers, Islamic guidance, or spiritual questions..."
                className="min-h-[56px] max-h-32 resize-none rounded-2xl border-2 px-4 sm:px-5 py-4 pr-14 sm:pr-16 text-base leading-normal transition-all duration-200 focus:border-primary/50 focus:ring-0 placeholder:text-muted-foreground/60 w-full"
                rows={1}
                style={{
                  lineHeight: '1.5',
                  paddingTop: '16px',
                  paddingBottom: '16px'
                }}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isTyping || isCreatingConversation}
                size="icon"
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl transition-all duration-200 shadow-sm",
                  input.trim() && !isTyping && !isCreatingConversation
                    ? "bg-primary hover:bg-primary/90 scale-100 shadow-primary/20" 
                    : "bg-muted-foreground/30 scale-90 shadow-none"
                )}
              >
                {(isTyping || isCreatingConversation) ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
