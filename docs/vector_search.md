# Vector Search Integration with pgvector

## Overview

This document describes the vector search functionality implemented for the Lopi AI assistant using Supabase's pgvector extension. The integration enables semantic search of the knowledge base using OpenAI embeddings.

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

The frontend uses the OpenAI API to generate embeddings and the Supabase client to store and search for knowledge.

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
async function searchKnowledge(query: string, limit = 5): Promise<Array<{
  id: string;
  topic: string;
  content: string;
  similarity: number;
}>> {
  // Generate embedding for the query
  const embedding = await generateEmbedding(query);

  // Search using vector similarity
  const { data } = await supabase.rpc('search_knowledge_with_vectors', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit,
  });

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

## Next Steps

1. Implement a scheduled job to generate embeddings for new knowledge entries
2. Add a UI for knowledge management with embedding generation
3. Monitor and optimize vector search performance
4. Implement caching for frequently accessed knowledge
