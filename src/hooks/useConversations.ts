import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

  // Fetch all conversations for the user
  const fetchConversations = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lopi_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  };

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

      // Get messages for this conversation
      const { data: messagesData, error: msgError } = await supabase
        .from('lopi_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      const formattedMessages: Message[] = (messagesData || []).map(msg => ({
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

      // Add welcome message
      await supabase
        .from('lopi_messages')
        .insert([{
          conversation_id: data.id,
          content: "Assalamu alaikum! I'm your Mulvi prayer assistant. I'm here to help you stay consistent with your prayers. How can I assist you today?",
          role: 'assistant',
          created_at: new Date().toISOString()
        }]);

      // Refresh conversations list
      await fetchConversations();
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

      // Add user message to local state immediately
      const newUserMessage: Message = {
        id: userMessage.id,
        content,
        role: 'user',
        timestamp: new Date(),
        conversation_id: currentConversation.id
      };
      setMessages(prev => [...prev, newUserMessage]);

      // Generate AI response (simplified for now)
      const aiResponse = generateAIResponse(content);

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
      setMessages(prev => [...prev, newAiMessage]);

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

  // Simple AI response generator (can be replaced with actual AI service)
  const generateAIResponse = (userMessage: string): string => {
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

      // Refresh conversations list
      await fetchConversations();
      
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
    fetchConversations();
  }, [userId]);

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