# Lopi AI Assistant Features

## Overview

This document provides an overview of the AI features implemented in the Hopium Prayer App, specifically focusing on the Lopi AI assistant's vector search capabilities and personalization features.

## Key Features

### 1. Vector Search with pgvector

The app uses Supabase's pgvector extension to enable semantic search across the knowledge base:

- **Embedding Generation**: Uses OpenAI's `text-embedding-ada-002` model to convert text into 1536-dimensional vectors
- **Vector Storage**: Stores embeddings in Supabase PostgreSQL using the pgvector extension
- **Similarity Search**: Performs cosine similarity search to find relevant knowledge entries
- **Context Injection**: Incorporates search results into AI assistant responses

### 2. User Personalization

The AI assistant personalizes responses using the user's display name:

- **Profile Integration**: Fetches the user's preferred display name from their profile
- **Natural Insertion**: Adds the user's name at natural points in the response
- **Randomized Usage**: Only includes the name in ~30% of responses to avoid repetition
- **Grammatical Adaptation**: Adjusts response text to flow naturally with name insertions

## Technical Implementation

### Vector Search

1. **Database Setup**:
   - PostgreSQL with pgvector extension
   - Knowledge table with embedding column
   - SQL functions for vector similarity search

2. **Embedding Generation**:
   ```typescript
   async function generateEmbedding(text: string): Promise<number[]> {
     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
     const response = await openai.embeddings.create({
       model: "text-embedding-ada-002",
       input: text,
     });
     return response.data[0].embedding;
   }
   ```

3. **Vector Search**:
   ```typescript
   async function searchKnowledge(
     query: string, 
     customSupabase?: SupabaseClient<Database>,
     limit = 5
   ) {
     const client = customSupabase || supabaseClient;
     const embedding = await generateEmbedding(query, client);
     
     const { data, error } = await client.rpc('search_knowledge_with_embedding', {
       query_embedding: embedding,
       match_threshold: 0.7,
       match_count: limit,
     });
     
     if (error) throw error;
     return data || [];
   }
   ```

### Personalization

1. **User Profile Fetching**:
   ```typescript
   async function fetchUserProfile() {
     const { data: { user } } = await supabase.auth.getUser();
     if (user) {
       const { data: profile } = await supabase
         .from('users')
         .select('display_name')
         .eq('id', user.id)
         .single();
         
       if (profile) {
         setUserProfile(profile);
       }
     }
   }
   ```

2. **Response Personalization**:
   ```typescript
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
   ```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │     │  Supabase       │     │  OpenAI API     │
│  - Next.js      │────▶│  - PostgreSQL   │────▶│  - Embeddings   │
│  - TypeScript   │     │  - pgvector     │     │  - API Key      │
│                 │     │  - Auth         │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        ▲                      │
        │                        │                      │
        ▼                        │                      ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  User Interface │     │  Database       │     │  Knowledge Base │
│  - Chat UI      │────▶│  - User Profiles│◀────│  - Embeddings   │
│  - Knowledge UI │     │  - Messages     │     │  - Content      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Future Improvements

1. **Onboarding Flow**: Implement a dedicated onboarding process to collect user's preferred display name
2. **Personalization Settings**: Allow users to control the level of personalization
3. **Caching**: Implement caching for frequently accessed knowledge entries
4. **Analytics**: Track which knowledge entries are most useful
5. **Feedback Loop**: Allow users to rate AI responses to improve quality
6. **Multi-modal Support**: Add support for images and other media in knowledge base

## Resources

- [Vector Search Documentation](./docs/vector_search.md)
- [AI Assistant Personalization](./docs/ai_assistant_personalization.md)
- [Backend Integration Plan](./docs/backend_integration_plan.md)
- [Project Plan Update](./docs/project_plan_update.md)
- [Supabase pgvector Documentation](https://supabase.com/docs/guides/database/extensions/pgvector)
- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
