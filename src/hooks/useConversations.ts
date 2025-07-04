import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from './useSupabaseClient';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  conversation_id: string;
}

interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  createConversation: () => Promise<string | null>;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

export function useConversations(userId?: string): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  // Load messages for a specific conversation
  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      
      // Get conversation details
      const { data: conversation, error: convError } = await supabase
        .from('lopi_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;
      setCurrentConversation(conversation);

      // Get the last 20 messages for this conversation (for performance and consistency)
      const { data: messagesData, error: msgError } = await supabase
        .from('lopi_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (msgError) throw msgError;

      // Reverse the messages to show chronological order (oldest first)
      const reversedMessages = (messagesData || []).reverse();

      const formattedMessages: Message[] = reversedMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at),
        conversation_id: msg.conversation_id
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new conversation
  const createConversation = async (): Promise<string | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('lopi_conversations')
        .insert([{
          user_id: userId,
          title: 'New Conversation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate contextual welcome message
      let welcomeMessage = "Assalamu alaikum! I'm Mulvi, your AI spiritual companion.";
      
      try {
        // Get user stats for contextual welcome
        const { data: userStats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        // Get user profile for personalization
        const { data: userProfile } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', userId)
          .single();

        // Get onboarding data for deeper personalization
        const { data: onboardingData } = await supabase
          .from('user_onboarding')
          .select('motivations, prayer_story')
          .eq('user_id', userId)
          .single();

        // Get today's progress - Use created_at instead of completed_at
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCount } = await supabase
          .from('prayer_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('completed', true)
          .gte('created_at', today + 'T00:00:00')
          .lt('created_at', today + 'T23:59:59');

        const userName = userProfile?.display_name || 'friend';

        if (userStats && userStats.current_streak > 0) {
          if (userStats.current_streak >= 30) {
            welcomeMessage = `Assalamu alaikum, ${userName}! MashaAllah, your ${userStats.current_streak}-day prayer streak is truly inspiring! I'm Mulvi, and I'm here to support your continued spiritual journey.`;
          } else if (userStats.current_streak >= 7) {
            welcomeMessage = `Assalamu alaikum, ${userName}! I see you're on a wonderful ${userStats.current_streak}-day prayer streak! I'm Mulvi, your spiritual companion, ready to help you maintain this momentum.`;
          } else {
            welcomeMessage = `Assalamu alaikum, ${userName}! You're building great habits with your ${userStats.current_streak}-day streak! I'm Mulvi, and I'm here to support your prayer journey.`;
          }
        } else if (todayCount && todayCount > 0) {
          welcomeMessage = `Assalamu alaikum, ${userName}! I see you've completed ${todayCount} prayer${todayCount > 1 ? 's' : ''} today - excellent work! I'm Mulvi, your spiritual companion.`;
        } else {
          welcomeMessage = `Assalamu alaikum, ${userName}! I'm Mulvi, your AI spiritual companion.`;
        }

        // Add personalized context based on onboarding data
        if (onboardingData?.motivations && onboardingData.motivations.length > 0) {
          const primaryMotivation = onboardingData.motivations[0];
          if (primaryMotivation === 'spiritual_growth') {
            welcomeMessage += " I remember you're focused on spiritual growth - I'm here to help deepen your connection with Allah through consistent prayer.";
          } else if (primaryMotivation === 'habit_building') {
            welcomeMessage += " I know building prayer habits is important to you - let's work together to strengthen your routine.";
          } else if (primaryMotivation === 'community_connection') {
            welcomeMessage += " I remember you value community connection - I can help you stay motivated through shared spiritual goals.";
          }
        }

        // Add contextual guidance
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) {
          welcomeMessage += " How can I help you start your day with spiritual strength?";
        } else if (currentHour >= 12 && currentHour < 17) {
          welcomeMessage += " How can I support your prayer consistency this afternoon?";
        } else if (currentHour >= 17 && currentHour < 20) {
          welcomeMessage += " How can I help you maintain your prayer momentum this evening?";
        } else {
          welcomeMessage += " How can I assist with your spiritual journey today?";
        }

      } catch (contextError) {
        console.error('Error getting context for welcome message:', contextError);
        // Fallback to default message
        welcomeMessage = "Assalamu alaikum! I'm Mulvi, your AI spiritual companion. I'm here to help you stay consistent with your prayers and provide Islamic guidance. How can I assist you today?";
      }

      // Add welcome message
      await supabase
        .from('lopi_messages')
        .insert([{
          conversation_id: data.id,
          content: welcomeMessage,
          role: 'assistant',
          created_at: new Date().toISOString()
        }]);

      // Update conversations list manually instead of refetching
      setConversations(prev => [data, ...prev]);
      setCurrentConversation(data);
      
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  };

  // Send a message and get AI response
  const sendMessage = async (content: string) => {
    if (!currentConversation || !userId) return;

    try {
      // Save user message
      const { data: userMessage, error: userError } = await supabase
        .from('lopi_messages')
        .insert([{
          conversation_id: currentConversation.id,
          content,
          role: 'user',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Add user message to local state
      const newUserMessage: Message = {
        id: userMessage.id,
        content,
        role: 'user',
        timestamp: new Date(),
        conversation_id: currentConversation.id
      };
      
      // Add message and maintain 20-message limit
      setMessages(prev => {
        const updated = [...prev, newUserMessage];
        return updated.length > 20 ? updated.slice(-20) : updated;
      });

      // Generate AI response
      const aiResponse = await generateAIResponse(content);

      // Save AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('lopi_messages')
        .insert([{
          conversation_id: currentConversation.id,
          content: aiResponse,
          role: 'assistant',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (aiError) throw aiError;

      // Add AI message to local state
      const newAiMessage: Message = {
        id: aiMessage.id,
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
        conversation_id: currentConversation.id
      };
      
      // Add AI message and maintain 20-message limit
      setMessages(prev => {
        const updated = [...prev, newAiMessage];
        return updated.length > 20 ? updated.slice(-20) : updated;
      });

      // Update conversation's updated_at and last_message
      await supabase
        .from('lopi_conversations')
        .update({
          updated_at: new Date().toISOString(),
          last_message: content.substring(0, 100)
        })
        .eq('id', currentConversation.id);

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  // Enhanced AI response generator with API route
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Fetch user's current prayer data for context with proper error handling
      const [userStatsResult, todayRecordsResult, recentRecordsResult, userProfileResult, onboardingResult] = await Promise.allSettled([
        // Get user stats
        supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single(),
        
        // Get today's prayer records - Use scheduled_time for filtering
        supabase
          .from('prayer_records')
          .select('*')
          .eq('user_id', userId)
          .gte('scheduled_time', new Date().toISOString().split('T')[0] + 'T00:00:00')
          .lt('scheduled_time', new Date().toISOString().split('T')[0] + 'T23:59:59'),
        
        // Get recent prayer records (last 7 days)
        supabase
          .from('prayer_records')
          .select('*')
          .eq('user_id', userId)
          .gte('scheduled_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

        // Get user profile information
        supabase
          .from('users')
          .select('display_name, email, prayer_method, theme_preference, created_at')
          .eq('id', userId)
          .single(),

        // Get onboarding data for personalization
        supabase
          .from('user_onboarding')
          .select('motivations, prayer_story, theme, prayer_baseline, intentions')
          .eq('user_id', userId)
          .single()
      ]);

      // Safely extract data from settled promises
      const userStats = userStatsResult.status === 'fulfilled' ? userStatsResult.value.data : null;
      const todayRecords = todayRecordsResult.status === 'fulfilled' ? (todayRecordsResult.value.data || []) : [];
      const recentRecords = recentRecordsResult.status === 'fulfilled' ? (recentRecordsResult.value.data || []) : [];
      const userProfile = userProfileResult.status === 'fulfilled' ? userProfileResult.value.data : null;
      const onboardingData = onboardingResult.status === 'fulfilled' ? onboardingResult.value.data : null;

      // Calculate current prayer context
      const now = new Date();
      const currentHour = now.getHours();
      
      // Determine current prayer period
      let currentPrayerPeriod = '';
      let nextPrayerInfo = '';
      
      if (currentHour >= 5 && currentHour < 12) {
        currentPrayerPeriod = 'morning (between Fajr and Dhuhr)';
        nextPrayerInfo = 'Dhuhr prayer is approaching';
      } else if (currentHour >= 12 && currentHour < 15) {
        currentPrayerPeriod = 'midday (around Dhuhr time)';
        nextPrayerInfo = 'Asr prayer will be next';
      } else if (currentHour >= 15 && currentHour < 18) {
        currentPrayerPeriod = 'afternoon (around Asr time)';
        nextPrayerInfo = 'Maghrib prayer is coming';
      } else if (currentHour >= 18 && currentHour < 20) {
        currentPrayerPeriod = 'evening (around Maghrib time)';
        nextPrayerInfo = 'Isha prayer will follow';
      } else {
        currentPrayerPeriod = 'night (after Isha or before Fajr)';
        nextPrayerInfo = 'Fajr prayer will start the new day';
      }

      // Find struggling prayers
      const strugglingPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(prayer => {
        const prayerRecords = recentRecords.filter(r => r.prayer_type === prayer);
        const rate = prayerRecords.length > 0 ? (prayerRecords.filter(r => r.completed).length / prayerRecords.length) : 0;
        return rate < 0.6;
      });

      // Build context for API
      const context = {
        // Personal information
        userName: userProfile?.display_name || 'friend',
        userEmail: userProfile?.email,
        accountAge: userProfile?.created_at ? Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        
        // Prayer statistics
        currentStreak: userStats?.current_streak || 0,
        completionRate: userStats?.completion_rate || 0,
        todayCompleted: todayRecords.filter(r => r.completed).length,
        todayTotal: todayRecords.length || 5,
        
        // Time context
        currentTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        currentPrayerPeriod,
        nextPrayerInfo,
        
        // Personalization data
        motivations: onboardingData?.motivations || [],
        prayerStory: onboardingData?.prayer_story || '',
        userTheme: onboardingData?.theme || userProfile?.theme_preference || 'serene',
        intentions: onboardingData?.intentions || [],
        prayerBaseline: onboardingData?.prayer_baseline || {},
        
        // Prayer preferences
        prayerMethod: userProfile?.prayer_method || 'ISNA',
        strugglingPrayers: strugglingPrayers.length > 0 ? strugglingPrayers : undefined
      };

      // Get recent conversation messages for context
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the current user message
      recentMessages.push({
        role: 'user',
        content: userMessage
      });

      // Call our API route instead of direct OpenAI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: recentMessages,
          userContext: context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;

    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to simple response
      return generateSimpleResponse(userMessage);
    }
  };

  // Fallback simple response generator
  const generateSimpleResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('consistent') || lowerMessage.includes('consistency')) {
      return "Consistency in prayers comes from building good habits. Try setting specific prayer times in your daily schedule, creating dedicated prayer spaces, and using reminders effectively. Would you like me to help you set up a prayer routine?";
    } else if (lowerMessage.includes('miss') || lowerMessage.includes('missed')) {
      return "If you miss a prayer, try to make it up as soon as you remember. This is called 'qada'. Our app can help you track missed prayers and remind you to complete them. Would you like to set up qada reminders?";
    } else if (lowerMessage.includes('work') || lowerMessage.includes('workplace')) {
      return "Praying at work can be challenging. Consider finding a quiet space, using your lunch break for prayers, and speaking with your supervisor about short prayer breaks if needed. Would you like some specific strategies for your workplace?";
    } else if (lowerMessage.includes('fajr') || lowerMessage.includes('wake up')) {
      return "Waking up for Fajr is one of the biggest challenges! Try using multiple alarms, placing your alarm away from your bed, having wudu before sleeping, and making dua to wake up. Would you like to see more Fajr-specific strategies?";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return "I'm here to help you with your prayer journey! I can assist with setting reminders, tracking missed prayers, providing prayer tips, and answering questions about Islamic prayer practices. What specific area would you like help with?";
    } else {
      return `I understand you're asking about "${userMessage}". As your prayer assistant, I'm focused on helping you maintain consistent prayers. What specific challenge are you facing with your prayer routine?`;
    }
  };

  // Delete a conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      // Delete all messages first
      await supabase
        .from('lopi_messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete the conversation
      await supabase
        .from('lopi_conversations')
        .delete()
        .eq('id', conversationId);

      // Update conversations list manually instead of refetching
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Clear current conversation if it was deleted
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  };

  useEffect(() => {
    const initializeConversations = async () => {
      if (!userId) return;
      
      try {
        // Fetch conversations
        const { data, error } = await supabase
          .from('lopi_conversations')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setConversations(data || []);

        // Auto-load the most recent conversation if no conversation is currently loaded
        if (!currentConversation && data && data.length > 0) {
          await loadConversation(data[0].id);
        }
      } catch (err) {
        console.error('Error initializing conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      }
    };

    initializeConversations();
  }, [userId, supabase]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    createConversation,
    loadConversation,
    sendMessage,
    deleteConversation
  };
} 