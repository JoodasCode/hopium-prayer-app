import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface KnowledgeItem {
  id: string;
  topic: string;
  content: string;
  source?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface UseKnowledgeBaseReturn {
  knowledge: KnowledgeItem[];
  isLoading: boolean;
  error: string | null;
  searchKnowledge: (query: string) => Promise<KnowledgeItem[]>;
  getRandomTip: () => Promise<KnowledgeItem | null>;
  getKnowledgeByTopic: (topic: string) => Promise<KnowledgeItem[]>;
  getKnowledgeByTags: (tags: string[]) => Promise<KnowledgeItem[]>;
  refreshKnowledge: () => Promise<void>;
}

export function useKnowledgeBase(): UseKnowledgeBaseReturn {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledge = async () => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('mulvi_knowledge')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setKnowledge(data || []);
    } catch (err) {
      console.error('Error fetching knowledge:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch knowledge');
    } finally {
      setIsLoading(false);
    }
  };

  const searchKnowledge = async (query: string): Promise<KnowledgeItem[]> => {
    try {
      setError(null);
      
      // First try vector search if query is substantial
      if (query.length > 10) {
        const { data: vectorData, error: vectorError } = await supabase
          .rpc('search_knowledge_semantic', { 
            query_text: query,
            match_threshold: 0.7,
            match_count: 10
          });

        if (!vectorError && vectorData && vectorData.length > 0) {
          return vectorData;
        }
      }

      // Fallback to text search
      const { data, error: searchError } = await supabase
        .from('mulvi_knowledge')
        .select('*')
        .or(`topic.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchError) throw searchError;

      return data || [];
    } catch (err) {
      console.error('Error searching knowledge:', err);
      setError(err instanceof Error ? err.message : 'Failed to search knowledge');
      return [];
    }
  };

  const getRandomTip = async (): Promise<KnowledgeItem | null> => {
    try {
      setError(null);
      
      const { data, error: randomError } = await supabase
        .from('mulvi_knowledge')
        .select('*')
        .order('created_at', { ascending: false });

      if (randomError) throw randomError;

      if (!data || data.length === 0) return null;

      // Get a random item from the results
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    } catch (err) {
      console.error('Error getting random tip:', err);
      setError(err instanceof Error ? err.message : 'Failed to get random tip');
      return null;
    }
  };

  const getKnowledgeByTopic = async (topic: string): Promise<KnowledgeItem[]> => {
    try {
      setError(null);
      
      const { data, error: topicError } = await supabase
        .from('mulvi_knowledge')
        .select('*')
        .ilike('topic', `%${topic}%`)
        .order('created_at', { ascending: false });

      if (topicError) throw topicError;

      return data || [];
    } catch (err) {
      console.error('Error getting knowledge by topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to get knowledge by topic');
      return [];
    }
  };

  const getKnowledgeByTags = async (tags: string[]): Promise<KnowledgeItem[]> => {
    try {
      setError(null);
      
      const { data, error: tagsError } = await supabase
        .from('mulvi_knowledge')
        .select('*')
        .contains('tags', tags)
        .order('created_at', { ascending: false });

      if (tagsError) throw tagsError;

      return data || [];
    } catch (err) {
      console.error('Error getting knowledge by tags:', err);
      setError(err instanceof Error ? err.message : 'Failed to get knowledge by tags');
      return [];
    }
  };

  const refreshKnowledge = async () => {
    setIsLoading(true);
    await fetchKnowledge();
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  return {
    knowledge,
    isLoading,
    error,
    searchKnowledge,
    getRandomTip,
    getKnowledgeByTopic,
    getKnowledgeByTags,
    refreshKnowledge
  };
} 