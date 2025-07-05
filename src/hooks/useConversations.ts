import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from './useSupabaseClient';

interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: any;
  tokens_used?: number;
  model_used?: string;
}

interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  context?: any;
  is_archived: boolean;
  category?: string;
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

export function useConversations(userId: string | undefined): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  // Load messages for a specific conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      
      // Get conversation details
      const { data: conversation, error: convError } = await supabase
        .from('mulvi_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;
      setCurrentConversation(conversation);

      // Get the last 20 messages for this conversation (for performance and consistency)
      const { data: messagesData, error: msgError } = await supabase
        .from('mulvi_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (msgError) throw msgError;

      // Reverse the messages to show chronological order (oldest first)
      const reversedMessages = (messagesData || []).reverse();
      setMessages(reversedMessages);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Create a new conversation
  const createConversation = async (): Promise<string | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('mulvi_conversations')
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

        // Get today's progress
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

        welcomeMessage += " How can I support your spiritual journey today?";
      } catch (contextError) {
        console.log('Could not load user context for welcome message:', contextError);
      }

      // Add welcome message
      await supabase
        .from('mulvi_messages')
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
      setIsLoading(true);

      // Save user message
      const { data: userMessage, error: userError } = await supabase
        .from('mulvi_messages')
        .insert([{
          conversation_id: currentConversation.id,
          content,
          role: 'user',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Update messages immediately for better UX
      setMessages(prev => [...prev, userMessage]);

      // Generate AI response
      const aiResponse = await generateAIResponse(content);

      // Save AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('mulvi_messages')
        .insert([{
          conversation_id: currentConversation.id,
          content: aiResponse,
          role: 'assistant',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (aiError) throw aiError;

      // Update messages with AI response
      setMessages(prev => [...prev, aiMessage]);

      // Update conversation's updated_at and last_message
      await supabase
        .from('mulvi_conversations')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentConversation.id);

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI response
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: userId,
          conversationId: currentConversation?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response || generateSimpleResponse(userMessage);
    } catch (error) {
      console.error('Error generating AI response:', error);
      return generateSimpleResponse(userMessage);
    }
  };

  // Simple fallback response generator
  const generateSimpleResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('prayer') || lowerMessage.includes('salah')) {
      return "Prayer is indeed the foundation of our faith. Remember that consistency in prayer brings peace and guidance. How can I help you with your prayer journey today?";
    }
    
    if (lowerMessage.includes('streak') || lowerMessage.includes('habit')) {
      return "Building consistent prayer habits is a beautiful journey. Every step forward is progress, and Allah appreciates our sincere efforts. What specific aspect of your prayer routine would you like to discuss?";
    }
    
    if (lowerMessage.includes('missed') || lowerMessage.includes('qada')) {
      return "Don't be discouraged by missed prayers - what matters is your intention to make them up. Allah is Most Forgiving. Would you like guidance on making up missed prayers?";
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
      return "Prayer times are a beautiful rhythm that connects us throughout the day. I can help you understand prayer timings or create a schedule that works for your lifestyle.";
    }
    
    return "Thank you for sharing that with me. As your spiritual companion, I'm here to support your prayer journey and answer any questions about Islamic practices. How can I assist you today?";
  };

  // Delete a conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('mulvi_conversations')
        .update({ is_archived: true })
        .eq('id', conversationId);

      if (error) throw error;

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
          .from('mulvi_conversations')
          .select('*')
          .eq('user_id', userId)
          .eq('is_archived', false)
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
  }, [userId, supabase, loadConversation, currentConversation]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    createConversation,
    loadConversation,
    sendMessage,
    deleteConversation,
  };
} 