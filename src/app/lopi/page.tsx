'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Mic, Image, Sparkles } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import { searchKnowledge } from '../../lib/ai';
import { useSupabaseClient } from '../../hooks/useSupabaseClient';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

// Sample conversation starters
const conversationStarters = [
  "How can I improve my focus during prayer?",
  "What are some tips for maintaining consistency?",
  "Can you explain the significance of Fajr prayer?",
  "How do I deal with distractions during prayer?",
  "What are some short duas for after prayer?"
];

// Sample responses for demo purposes
const sampleResponses: Record<string, string> = {
  "How can I improve my focus during prayer?": "To improve focus during prayer, try these techniques:\n\n1. **Prepare mentally** before starting - take a few deep breaths and remind yourself of Allah's presence\n\n2. **Understand the meaning** of what you're reciting - learning translations helps connect with the words\n\n3. **Pray in a quiet environment** with minimal distractions\n\n4. **Focus on your movements** and be mindful of each position\n\n5. **Start with shorter, more focused prayers** rather than longer distracted ones\n\nRemember, improving focus is a journey. Even the Prophet (PBUH) acknowledged that concentration fluctuates. The key is consistent effort and sincere intention.",
  
  "What are some tips for maintaining consistency?": "Maintaining consistency in prayer requires both practical habits and spiritual mindfulness:\n\n1. **Set prayer alarms** that give you enough time to prepare properly\n\n2. **Find a prayer buddy** who can help keep you accountable\n\n3. **Create a dedicated prayer space** in your home that's always ready\n\n4. **Track your prayers** to visualize your progress (that's what Hopium helps you with!)\n\n5. **Remember the spiritual rewards** - each prayer is an opportunity to connect with Allah\n\n6. **Be gentle with yourself** when you miss prayers - restart without shame\n\nConsistency builds spiritual strength over time, and each prayer strengthens your connection with Allah.",
  
  "Can you explain the significance of Fajr prayer?": "Fajr prayer holds special significance in Islam for several reasons:\n\n1. **Divine testimony** - Allah and His angels witness Fajr prayer (Quran 17:78)\n\n2. **Spiritual protection** - The Prophet (PBUH) said whoever prays Fajr is under Allah's protection\n\n3. **Discipline of faith** - Rising early when sleep is sweet demonstrates commitment to Allah\n\n4. **Beginning the day with remembrance** - Starting with prayer sets a spiritual foundation\n\n5. **Special rewards** - Praying Fajr in congregation is rewarded like praying the entire night\n\nThe Prophet (PBUH) said: 'The two rak'ahs before the dawn (Fajr) prayer are better than this world and all it contains.' (Muslim)\n\nFajr represents the triumph of spiritual consciousness over physical comfort.",
  
  "How do I deal with distractions during prayer?": "Dealing with distractions during prayer is a common challenge. Here are some practical approaches:\n\n1. **Acknowledge the distraction** without judgment, then gently return focus to prayer\n\n2. **Prepare your prayer space** to minimize visual and auditory distractions\n\n3. **Pray when you're alert** rather than when extremely tired or hungry\n\n4. **Visualize the meaning** of the verses you're reciting\n\n5. **Focus on your physical sensations** during each position of prayer\n\n6. **Practice mindfulness outside of prayer** to strengthen your focus muscle\n\nImam Al-Ghazali suggested imagining each prayer as your last - this perspective can help maintain focus on what truly matters.\n\nRemember that even the companions struggled with distractions - it's part of the human experience and the effort to overcome them is itself an act of worship.",
  
  "What are some short duas for after prayer?": "Here are some beautiful, short duas you can recite after prayers:\n\n1. **For forgiveness**:\nAstaghfirullah (3 times)\n(I seek forgiveness from Allah)\n\n2. **For protection**:\nAllāhumma antas-salāmu wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām\n(O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor)\n\n3. **For guidance**:\nAllahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan\n(O Allah, I ask You for beneficial knowledge, good provision, and acceptable deeds)\n\n4. **For strength**:\nRabbī zidnī 'ilmā\n(My Lord, increase me in knowledge)\n\n5. **For well-being**:\nAllāhumma innī as'alukal-'āfiyata fid-dunyā wal-ākhirah\n(O Allah, I ask You for well-being in this world and the Hereafter)\n\nThese short duas can help maintain your spiritual connection throughout the day."
};

export default function LopiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<{ display_name?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Get the properly typed Supabase client
  const supabase = useSupabaseClient();
  
  // Fetch user profile on component mount
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', user.id)
            .single();
          
          setUserProfile(profile);
          
          // Create personalized welcome message
          const greeting = profile?.display_name 
            ? `Assalamu alaikum, ${profile.display_name}! I'm Lopi, your prayer companion.` 
            : "Assalamu alaikum! I'm Lopi, your prayer companion.";
            
          setMessages([{
            id: '1',
            content: `${greeting} How can I assist you on your spiritual journey today?`,
            role: 'assistant',
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Set default welcome message if profile fetch fails
        setMessages([{
          id: '1',
          content: "Assalamu alaikum! I'm Lopi, your prayer companion. How can I assist you on your spiritual journey today?",
          role: 'assistant',
          timestamp: new Date()
        }]);
      }
    }
    
    fetchUserProfile();
  }, [supabase]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Default response if no context is found
      let responseContent = "I understand your question about prayer. Let me share some thoughts on this topic...";
      
      // Check if we have a predefined response for demo purposes
      for (const [question, answer] of Object.entries(sampleResponses)) {
        if (userMessage.content.toLowerCase().includes(question.toLowerCase().substring(0, 10))) {
          responseContent = answer;
          break;
        }
      }
      
      // Get context from knowledge base using vector search
      const searchResults = await searchKnowledge(userMessage.content, supabase);
      
      // If we have context from vector search, enhance the response
      if (searchResults && searchResults.length > 0) {
        // In a real implementation, you would send this context to an LLM API
        // For now, we'll just append some of the knowledge to our response
        const knowledgeSnippet = searchResults[0].content.substring(0, 150) + '...';
        responseContent += '\n\n*Based on our knowledge base:* ' + knowledgeSnippet;
      }
      
      // Personalize the response if we have the user's name
      if (userProfile?.display_name) {
        // Add personalized touches to the response at appropriate points
        if (Math.random() > 0.7) { // Only add name sometimes to avoid being repetitive
          if (responseContent.includes('\n\n')) {
            // Add name before a paragraph break
            responseContent = responseContent.replace('\n\n', `, ${userProfile.display_name}.\n\n`);
          } else {
            // Add at the beginning if no good spot found
            responseContent = `${userProfile.display_name}, ${responseContent.charAt(0).toLowerCase()}${responseContent.slice(1)}`;
          }
        }
      }
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response in case of error
      const errorResponse: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an issue while searching our knowledge base. Please try again later.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleStarterClick = (starter: string) => {
    setInputValue(starter);
    // Focus the input after setting the value
    const inputElement = document.getElementById('message-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-10 bg-background">
        <div className="container max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Lopi AI</h1>
                <p className="text-xs text-muted-foreground">Your spiritual companion</p>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Sparkles className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat area */}
      <ScrollArea className="flex-1 p-4 container max-w-md mx-auto">
        <div className="space-y-4 pb-20">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted border border-border'}`}
              >
                <div className="whitespace-pre-line">{message.content}</div>
                <div className="text-[10px] opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted border border-border">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Conversation starters */}
      {messages.length <= 2 && !isTyping && (
        <div className="container max-w-md mx-auto px-4 mb-4">
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
      
      {/* Input area */}
      <div className="border-t border-border sticky bottom-0 bg-background pt-2 pb-20">
        <div className="container max-w-md mx-auto px-4">
          <div className="flex items-end gap-2">
            <Button variant="outline" size="icon" className="rounded-full flex-shrink-0">
              <Image className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Input
                id="message-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message Lopi..."
                className="pr-10 py-6 rounded-full"
                autoComplete="off"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="outline" size="icon" className="rounded-full flex-shrink-0">
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
