'use client';

import { useState, useRef, useEffect } from 'react';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { usePrayerInsights } from '@/hooks/usePrayerInsights';
import { useNotifications } from '@/hooks/useNotifications';

// UI Components from shadcn
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';

// Icons from Lucide
import {
  MessageSquare,
  LineChart,
  ChevronRight,
  ArrowLeft,
  Send,
  Bell,
  Info,
  Calendar,
  AlertTriangle,
  Mic,
  Image,
  Check
} from 'lucide-react';

// Types for the Mulvi page
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type PrayerInsight = {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionText: string;
  priority: 'high' | 'medium' | 'low';
};

// Conversation starters focused on prayer habit maintenance
const conversationStarters = [
  "How can I be more consistent with prayers?",
  "What should I do if I miss a prayer?",
  "Help me pray on time during work",
  "Tips for waking up for Fajr"
];

export default function MulviPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  
  // Backend hooks
  const { insights, isLoading: insightsLoading, dismissInsight } = usePrayerInsights(userId);
  const { 
    currentConversation, 
    messages, 
    createConversation, 
    loadConversation, 
    sendMessage: sendChatMessage,
    isLoading: chatLoading 
  } = useConversations(userId);
  const { setReminder } = useNotifications(userId);
  
  // UI States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showInsightDialog, setShowInsightDialog] = useState(false);
  const [showMakeupDialog, setShowMakeupDialog] = useState(false);
  const [activeInsight, setActiveInsight] = useState<PrayerInsight | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Reference for scrolling to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat functions
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Create conversation if none exists
    if (!currentConversation) {
      const conversationId = await createConversation();
      if (conversationId) {
        await loadConversation(conversationId);
      }
    }
    
    // Send message through backend
    setIsTyping(true);
    await sendChatMessage(inputValue);
    setInputValue('');
    setIsTyping(false);
  };
  
  // Handle starter question click
  const handleStarterClick = async (question: string) => {
    setInputValue(question);
    await handleSendMessage();
  };
  
  // Handle Enter key press in chat input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Function to render the correct icon component
  const renderIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'LineChart': <LineChart className="h-4 w-4" />,
      'AlertTriangle': <AlertTriangle className="h-4 w-4" />,
      'Bell': <Bell className="h-4 w-4" />,
      'Info': <Info className="h-4 w-4" />,
      'Calendar': <Calendar className="h-4 w-4" />,
    };
    
    return iconMap[iconName] || <Info className="h-4 w-4" />;
  };
  
  // Initialize conversation when chat opens
  useEffect(() => {
    if (isChatOpen && !currentConversation && userId) {
      createConversation().then(conversationId => {
        if (conversationId) {
          loadConversation(conversationId);
        }
      });
    }
  }, [isChatOpen, currentConversation, userId]);

  // Effect to scroll to bottom of messages when they update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Main Container */}
      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mulvi</h1>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsChatOpen(true)}
            className="rounded-full"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Insights Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Prayer Insights</h3>
            <Button variant="ghost" size="sm" className="text-xs flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {insightsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse h-[220px]">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : insights.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {insights.map((insight) => (
                <CarouselItem key={insight.id} className="pb-2">
                  <Card className={`flex flex-col h-[220px] ${insight.priority === 'high' ? 'bg-gradient-to-r from-chart-5/30 via-chart-5/10 to-background shadow-md' : 'bg-gradient-to-r from-chart-3/30 via-chart-3/10 to-background shadow-md'}`}>
                    <CardContent className="p-4 flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${insight.priority === 'high' ? 'bg-chart-5/20 text-chart-5' : 'bg-chart-3/20 text-chart-3'}`}>
                          {renderIcon(insight.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            {insight.priority === 'high' && (
                              <span className="bg-chart-5/20 text-chart-5 text-xs px-2 py-0.5 rounded-full">Important</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-4 bg-transparent flex justify-center border-t mt-auto">
                      <Button 
                        size="default" 
                        variant={insight.priority === 'high' ? 'default' : 'outline'} 
                        className={`w-full ${insight.priority === 'high' ? 'bg-chart-5/90 hover:bg-chart-5' : 'border-chart-3/50 hover:bg-chart-3/20'}`}
                        onClick={async () => {
                          setActiveInsight(insight);
                          if (insight.actionText === 'Set Reminder') {
                            setShowReminderDialog(true);
                          } else if (insight.actionText === 'Dismiss') {
                            await dismissInsight(insight.id);
                          } else {
                            // For View Details, View Progress, etc.
                            setShowInsightDialog(true);
                          }
                        }}
                      >
                        {insight.actionText}
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-2">
              <CarouselPrevious className="relative static transform-none mx-1 h-7 w-7" />
              <CarouselNext className="relative static transform-none mx-1 h-7 w-7" />
            </div>
          </Carousel>
          ) : (
            <Card className="h-[220px] flex items-center justify-center">
              <CardContent className="text-center">
                <p className="text-muted-foreground">No insights available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Complete some prayers to see personalized insights!</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="hover:bg-accent/30 cursor-pointer transition-colors border border-transparent hover:border-accent/40 shadow-sm"
              onClick={() => setShowReminderDialog(true)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="bg-chart-1/20 p-3 rounded-full mb-2">
                  <Bell className="h-5 w-5 text-chart-1" />
                </div>
                <p className="text-sm font-medium">Set Reminder</p>
              </CardContent>
            </Card>
            
            <Card 
              className="hover:bg-accent/30 cursor-pointer transition-colors border border-transparent hover:border-accent/40 shadow-sm"
              onClick={() => setShowMakeupDialog(true)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="bg-chart-1/20 p-3 rounded-full mb-2">
                  <Calendar className="h-5 w-5 text-chart-1" />
                </div>
                <p className="text-sm font-medium">Make Up Prayers</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Prayer Tips */}
        <div>
          <h3 className="font-medium mb-3">Prayer Tips</h3>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground italic">
                "The first matter that the slave will be brought to account for on the Day of Judgment is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is bad, then the rest of his deeds will be bad."
              </p>
              <p className="text-xs mt-2 text-right">— Prophet Muhammad (PBUH)</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Chat Dialog */}
      {/* Prayer Insight Dialog */}
      <Dialog open={showInsightDialog} onOpenChange={setShowInsightDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeInsight?.title || 'Prayer Insight'}</DialogTitle>
            <DialogDescription>
              Detailed analysis and recommendations for your prayer pattern.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-full ${activeInsight?.priority === 'high' ? 'bg-chart-5/20 text-chart-5' : 'bg-chart-3/20 text-chart-3'}`}>
                {activeInsight && renderIcon(activeInsight.icon)}
              </div>
              <div>
                <h4 className="font-medium">{activeInsight?.title}</h4>
                <p className="text-sm text-muted-foreground">{activeInsight?.description}</p>
              </div>
            </div>
            
            {activeInsight?.title === 'Fajr Consistency' && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-3">
                  <h5 className="text-sm font-medium mb-1">5-Day Streak Analysis</h5>
                  <p className="text-xs text-muted-foreground">You've been praying Fajr consistently at approximately 5:40 AM, which is excellent! This is building a strong habit pattern.</p>
                </div>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <ul className="text-xs space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 bg-green-500/20 text-green-500 rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                        <span>Continue your current wake-up routine at 5:20 AM</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 bg-green-500/20 text-green-500 rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                        <span>Maintain your pre-sleep routine of going to bed by 10:30 PM</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeInsight?.title === 'Weekly Progress' && (
              <div className="space-y-4">
                <div className="h-40 bg-muted rounded-lg p-3 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Prayer completion chart visualization would appear here</p>
                </div>
                
                <div className="grid grid-cols-5 gap-1 text-center">
                  <div>
                    <p className="text-xs font-medium">Fajr</p>
                    <p className="text-sm font-semibold text-green-500">95%</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Dhuhr</p>
                    <p className="text-sm font-semibold text-green-500">90%</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Asr</p>
                    <p className="text-sm font-semibold text-green-500">98%</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Maghrib</p>
                    <p className="text-sm font-semibold text-green-500">100%</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Isha</p>
                    <p className="text-sm font-semibold text-amber-500">85%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowInsightDialog(false)}>Close</Button>
            <Button onClick={() => {
              setShowInsightDialog(false);
              // Navigate to Stats page for more detailed analysis
              window.location.href = '/stats';
            }}>See Full Analysis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Prayer Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Prayer Reminder</DialogTitle>
            <DialogDescription>
              Schedule reminders for your upcoming prayers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select Prayer</h4>
              <div className="grid grid-cols-5 gap-2">
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                  <Button key={prayer} variant="outline" size="sm" className="text-xs">{prayer}</Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Reminder Time</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="text-xs">5 mins before</Button>
                <Button variant="outline" size="sm" className="text-xs">15 mins before</Button>
                <Button variant="outline" size="sm" className="text-xs">30 mins before</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Reminder Type</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">Push Notification</Button>
                <Button variant="outline" size="sm" className="text-xs">Sound Alarm</Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              // This would be enhanced to use the selected prayer and time from the dialog
              const success = await setReminder('next_prayer', 15); // Default: 15 minutes before next prayer
              if (success) {
                setShowReminderDialog(false);
                // Could show success toast here
              }
            }}>Set Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Make Up Prayers Dialog */}
      <Dialog open={showMakeupDialog} onOpenChange={setShowMakeupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Up Missed Prayers</DialogTitle>
            <DialogDescription>
              Record your Qada (make up) prayers to maintain your spiritual progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select Prayer to Make Up</h4>
              <div className="grid grid-cols-5 gap-2">
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                  <Button key={prayer} variant="outline" size="sm" className="text-xs">{prayer}</Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Date Missed</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="text-xs">Today</Button>
                <Button variant="outline" size="sm" className="text-xs">Yesterday</Button>
                <Button variant="outline" size="sm" className="text-xs">Custom</Button>
              </div>
            </div>
            
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <Info className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">About Qada Prayers</p>
                  <p className="text-xs text-muted-foreground">Making up missed prayers (Qada) is an important practice. It's recommended to make them up as soon as possible.</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMakeupDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowMakeupDialog(false);
              // Show success toast or feedback
              console.log('Qada prayer recorded successfully');
            }}>Record Qada Prayer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-[95%] w-full md:max-w-md max-h-[90vh] h-[600px] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-center text-base">Chat with Mulvi</DialogTitle>
          </DialogHeader>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 px-4 py-3 overflow-y-auto">
            <div className="space-y-4 pb-2">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'}`}
                  >
                    <div className="whitespace-pre-line text-sm">{message.content}</div>
                    <div className="text-[10px] opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Conversation starters */}
              {messages.length <= 1 && !isTyping && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Try asking about:</p>
                  <div className="flex flex-wrap gap-2">
                    {conversationStarters.map((starter, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm" 
                        className="text-xs rounded-full" 
                        onClick={() => handleStarterClick(starter)}
                      >
                        {starter}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input area */}
          <div className="border-t border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0 h-9 w-9">
                <Image className="h-4 w-4" />
              </Button>
              
              <div className="relative flex-1">
                <Input
                  id="message-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Mulvi..."
                  className="pr-10 rounded-full h-9"
                  autoComplete="off"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-7 w-7"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0 h-9 w-9">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Bottom Navigation */}
      <PhantomBottomNav />
    </div>
  );
}
