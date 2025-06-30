# AI Assistant Personalization

## Overview

This document describes the personalization features implemented for the Lopi AI assistant. The personalization enables the assistant to address users by their preferred display name and provide more contextually relevant responses using vector search.

## User Display Name Integration

### Database Structure

The `users` table includes a `display_name` field that stores the user's preferred name:

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fetching User Profile

The Lopi page fetches the user's profile information including their display name:

```typescript
// src/app/lopi/page.tsx
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
          
        if (profile) {
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }
  
  fetchUserProfile();
}, [supabase]);
```

## Personalized Response Generation

The AI assistant personalizes responses by incorporating the user's display name in a natural way:

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

Key features of the personalization:

1. **Selective Usage**: Names are only included in ~30% of responses to avoid sounding repetitive or unnatural
2. **Contextual Placement**: Names are inserted at natural break points in the text
3. **Grammar Adaptation**: The response is adjusted to flow naturally with the name insertion

## Context-Aware Responses

The AI assistant uses vector search to find relevant knowledge and incorporate it into responses:

```typescript
// Get context from knowledge base using vector search
const searchResults = await searchKnowledge(userMessage.content, supabase);

// If we have context from vector search, enhance the response
if (searchResults && searchResults.length > 0) {
  // In a real implementation, you would send this context to an LLM API
  // For now, we'll just append some of the knowledge to our response
  const knowledgeSnippet = searchResults[0].content.substring(0, 150) + '...';
  responseContent += '\n\n*Based on our knowledge base:* ' + knowledgeSnippet;
}
```

## User Experience Improvements

### Welcome Message

The welcome message is personalized when the user has set their display name:

```typescript
useEffect(() => {
  // Set initial welcome message
  if (messages.length === 0) {
    const welcomeMessage = {
      id: 'welcome',
      content: userProfile?.display_name 
        ? `Welcome back, ${userProfile.display_name}! How can I assist you with your prayer journey today?` 
        : "Welcome to Lopi, your personal prayer assistant. How can I help you with your prayer journey today?",
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }
}, [userProfile]);
```

## Next Steps

1. Implement an onboarding flow to collect the user's preferred display name
2. Add preferences for personalization level (more/less use of name)
3. Integrate with a full LLM API to generate more dynamic personalized responses
4. Implement user feedback mechanism to improve personalization over time
5. Add support for time-of-day greetings (Good morning/afternoon/evening)
6. Incorporate prayer history and habits into personalized recommendations
