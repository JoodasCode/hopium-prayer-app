# Vector Search Integration with pgvector

## Overview

This document describes the vector search functionality implemented for the Lopi AI assistant using Supabase's pgvector extension. The integration enables semantic search of the knowledge base using OpenAI embeddings and personalized AI responses.

## Setup

1. The `vector` extension has been enabled in the Supabase project
2. The `lopi_knowledge` table has been updated with a `VECTOR(1536)` column for storing embeddings
3. An IVFFlat index has been created for efficient vector similarity search
4. SQL functions have been created to perform vector similarity search

## Database Structure

### lopi_knowledge Table

```sql
CREATE TABLE public.lopi_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    tags TEXT[],
    embedding VECTOR(1536), -- OpenAI embeddings are 1536 dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for vector similarity search
CREATE INDEX idx_lopi_knowledge_embedding ON public.lopi_knowledge USING ivfflat (embedding vector_cosine_ops);
```

## SQL Functions

### search_knowledge_with_embedding

Performs vector similarity search using the cosine distance operator `<=>` when embeddings are available.

```sql
CREATE OR REPLACE FUNCTION search_knowledge_with_embedding(query_embedding VECTOR(1536), match_threshold FLOAT DEFAULT 0.7, match_count INT DEFAULT 5)
RETURNS TABLE (
  id UUID,
  topic TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.topic,
    k.content,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM lopi_knowledge k
  WHERE k.embedding IS NOT NULL AND 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

### get_lopi_context_with_vectors

Gets context for the Lopi AI assistant based on a user query, including relevant knowledge, prayer stats, and recent prayers. Uses vector search when embeddings are available.

```sql
CREATE OR REPLACE FUNCTION get_lopi_context_with_vectors(user_id UUID, query_text TEXT, embedding VECTOR(1536))
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  context TEXT := '';
  knowledge_results RECORD;
  prayer_stats RECORD;
  recent_prayer RECORD;
BEGIN
  -- Get relevant knowledge using vector search when embedding is provided
  -- Otherwise fall back to text search
  IF embedding IS NOT NULL THEN
    FOR knowledge_results IN (
      SELECT 
        k.topic,
        k.content,
        1 - (k.embedding <=> embedding) AS similarity
      FROM lopi_knowledge k
      WHERE k.embedding IS NOT NULL
      ORDER BY k.embedding <=> embedding
      LIMIT 5
    ) LOOP
      context := context || '[Knowledge] ' || knowledge_results.topic || ' (similarity: ' || 
                ROUND(knowledge_results.similarity::numeric, 2) || '):\n' || 
                knowledge_results.content || '\n\n';
    END LOOP;
  ELSE
    -- Fall back to text search
    FOR knowledge_results IN (
      SELECT 
        k.topic,
        k.content
      FROM lopi_knowledge k
      WHERE 
        to_tsvector('english', k.content) @@ plainto_tsquery('english', query_text)
      ORDER BY ts_rank(to_tsvector('english', k.content), plainto_tsquery('english', query_text)) DESC
      LIMIT 5
    ) LOOP
      context := context || '[Knowledge] ' || knowledge_results.topic || ':\n' || knowledge_results.content || '\n\n';
    END LOOP;
  END IF;
  
  -- Get user's prayer stats and recent prayers...
  -- [Additional code omitted for brevity]
  
  RETURN context;
END;
$$;
```

## Frontend Integration

The frontend uses the OpenAI API to generate embeddings and the Supabase client to store and search for knowledge. A dedicated `useSupabaseClient` hook provides a properly typed Supabase client to avoid circular dependencies.

### Supabase Client Hook

```typescript
// src/hooks/useSupabaseClient.ts
import { supabase } from '../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

/**
 * Hook to access Supabase client
 */
export function useSupabaseClient(): SupabaseClient<Database> {
  return supabase as SupabaseClient<Database>;
}
```

### Generating Embeddings

```typescript
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
}
```

### Storing Knowledge with Embeddings

```typescript
async function storeKnowledge(topic: string, content: string, source?: string, tags?: string[]): Promise<void> {
  // Generate embedding for the content
  const embedding = await generateEmbedding(content);

  // Store in Supabase
  await supabase.from('lopi_knowledge').insert({
    topic,
    content,
    source,
    tags,
    embedding,
    updated_at: new Date().toISOString()
  });
}
```

### Searching Knowledge with Embeddings

```typescript
async function searchKnowledge(
  query: string, 
  customSupabase?: SupabaseClient<Database>,
  limit = 5
): Promise<Array<{
  id: string;
  topic: string;
  content: string;
  similarity: number;
}>> {
  // Get Supabase client
  const client = customSupabase || supabaseClient;
  
  // Generate embedding for the query
  const embedding = await generateEmbedding(query, client);

  // Search using vector similarity
  const { data, error } = await client.rpc('search_knowledge_with_embedding', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error) throw error;
  return data || [];
}
```

## Testing

A test script is provided in `scripts/test-vector-search.js` to verify the vector search functionality:

```bash
# Install dependencies
npm install dotenv @supabase/supabase-js openai

# Store test knowledge entries
node scripts/test-vector-search.js store

# Test vector search with a query
node scripts/test-vector-search.js search "benefits of prayer"
```

## AI Assistant Integration

### Personalized Responses

The Lopi AI assistant now uses vector search to provide context-aware responses and personalizes them using the user's display name:

```typescript
// src/app/lopi/page.tsx (excerpt)
const handleSendMessage = async () => {
  // ...
  try {
    // Get context from knowledge base using vector search
    const searchResults = await searchKnowledge(userMessage.content, supabase);
    
    // If we have context from vector search, enhance the response
    if (searchResults && searchResults.length > 0) {
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
  }
  // ...
}
```

### Knowledge Search Component

A dedicated `KnowledgeSearch` component allows users to search the knowledge base directly:

```typescript
// src/components/KnowledgeSearch.tsx (excerpt)
export default function KnowledgeSearch() {
  // ...
  const supabase = useSupabaseClient();

  const handleSearch = async (e: React.FormEvent) => {
    // ...
    try {
      const searchResults = await searchKnowledge(query, supabase);
      setResults(searchResults);
    } catch (err) {
      console.error('Error searching knowledge:', err);
      setError('Failed to search knowledge base. Please try again.');
    }
    // ...
  };
  // ...
}
```

## Admin Interface

A knowledge management admin interface has been implemented to:

1. Add new knowledge entries with automatic embedding generation
2. Regenerate embeddings for existing entries
3. Test vector search functionality
4. Tag and categorize knowledge entries

## Next Steps

1. ✅ Implement a UI for knowledge management with embedding generation
2. ✅ Integrate vector search with the AI assistant
3. ✅ Add personalization using user display names
4. Implement caching for frequently accessed knowledge
5. Add analytics to track most useful knowledge entries
6. Implement user onboarding to collect preferred display names
