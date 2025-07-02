import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import type { Database } from '../types/supabase';

// Lazy-load OpenAI client to avoid initialization errors
let openai: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not found - AI features will be disabled');
      return null;
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
};

// Initialize Supabase client
const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Generate embeddings for text using OpenAI's API
 */
export async function generateEmbedding(text: string, customSupabase?: SupabaseClient<Database>): Promise<number[]> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI client not available - check API key configuration');
    }
    
    const response = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Store knowledge in the database with embeddings
 */
export async function storeKnowledge(
  topic: string, 
  content: string, 
  source?: string, 
  tags?: string[], 
  customSupabase?: SupabaseClient<Database>
): Promise<void> {
  const client = customSupabase || supabaseClient;
  
  // Generate embedding for the content
  const embedding = await generateEmbedding(content);

  // Store in Supabase
  const { error } = await client.from('lopi_knowledge').insert({
    topic,
    content,
    source,
    tags,
    embedding,
    updated_at: new Date().toISOString()
  });

  if (error) throw error;
}

/**
 * Search for relevant knowledge using vector similarity
 */
export async function searchKnowledge(
  query: string, 
  customSupabase?: SupabaseClient<Database>, 
  limit = 5
): Promise<Array<{
  id: string;
  topic: string;
  content: string;
  similarity: number;
}>> {
  try {
    const client = customSupabase || supabaseClient;
    
    // Generate embedding for the query
    const embedding = await generateEmbedding(query, customSupabase);

    // Search using vector similarity
    const { data, error } = await client.rpc('search_knowledge_with_embedding', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching knowledge:', error);
    throw error;
  }
}

/**
 * Get context for Lopi AI assistant based on user query
 */
export async function getLopiContext(
  userId: string, 
  query: string, 
  customSupabase?: SupabaseClient<Database>
): Promise<string> {
  try {
    const client = customSupabase || supabaseClient;
    
    const { data, error } = await client.rpc('get_lopi_context', {
      input_user_id: userId,
      query_text: query
    });

    if (error) throw error;
    return data || '';
  } catch (error) {
    console.error('Error getting Lopi context:', error);
    throw error;
  }
}

/**
 * Get context for Lopi AI assistant using the database vector function
 */
export async function getLopiContextWithVectors(
  userId: string, 
  query: string, 
  customSupabase?: SupabaseClient<Database>
): Promise<string> {
  try {
    const client = customSupabase || supabaseClient;
    
    // Generate embedding for the query
    const embedding = await generateEmbedding(query, customSupabase);

    // Call the database function that handles vector search
    const { data, error } = await client.rpc('get_lopi_context_with_vectors', {
      input_user_id: userId,
      query_text: query,
      query_embedding: embedding
    });

    if (error) {
      console.warn('Error using vector search, falling back to text search:', error);
      // Fall back to the original function if there's an error
      return getLopiContext(userId, query, customSupabase);
    }

    return data || '';
  } catch (error) {
    console.error('Error getting Lopi context with vectors:', error);
    // Fall back to the original function if there's an error
    return getLopiContext(userId, query, customSupabase);
  }
}
