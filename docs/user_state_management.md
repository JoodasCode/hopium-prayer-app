# Hopium Prayer App - User State Management Strategy

## Overview

The Hopium Prayer App needs to provide excellent experiences for both new users with no data and returning users with existing prayer history. This document outlines our approach to handling these different user states.

## 1. New Users (Zero State)

### Onboarding Flow

- **Welcome Sequence**
  - Brief app introduction with value proposition
  - Prayer calculation method selection (Hanafi, Shafi'i, ISNA, etc.)
  - Location permission request (for accurate prayer times and qibla)
  - Notification permission request (for prayer reminders)
  - Theme preference selection

- **First-time User Experience**
  - Guided tour highlighting key features
  - Sample prayer schedule for the current day
  - Quick tutorial on marking prayers as completed

### Empty State UI Components

We've created a reusable `EmptyState` component that can be used across the app to:

- Show informative placeholders instead of blank screens
- Provide clear calls-to-action
- Optionally display sample data visualizations
- Guide users to start using features

### Implementation Examples

#### Dashboard Empty State
```tsx
<EmptyState
  title="Welcome to Hopium"
  description="Track your prayers, build consistency, and deepen your spiritual connection."
  icon={<Pray className="h-6 w-6 text-primary" />}
  actionLabel="Mark Your First Prayer"
  onAction={() => setShowPrayerDialog(true)}
  showSampleData={true}
/>
```

#### Calendar Empty State
```tsx
<EmptyState
  title="Your Prayer Calendar"
  description="Your prayer history will appear here as you complete prayers."
  icon={<Calendar className="h-6 w-6 text-primary" />}
  actionLabel="Go to Today's Prayers"
  onAction={() => router.push('/')}
  showSampleData={true}
/>
```

#### Insights Empty State
```tsx
<EmptyState
  title="Insights Coming Soon"
  description="Complete prayers to see analytics about your spiritual journey."
  icon={<BarChart3 className="h-6 w-6 text-primary" />}
  actionLabel="View Sample Insights"
  onAction={() => setShowSampleInsights(true)}
  secondaryLabel="Go to Prayers"
  onSecondaryAction={() => router.push('/')}
/>
```

## 2. Returning Users (With Data)

### Data Loading States

- **Progressive Loading**
  - Show skeleton UI during data fetching
  - Load critical data first (today's prayers)
  - Load historical data in the background

- **Offline Support**
  - Cache recent prayer data for offline access
  - Allow marking prayers while offline
  - Sync when connection is restored

### Personalized Experience

- **Welcome Back Messaging**
  - Acknowledge return with personalized greeting
  - Highlight changes since last visit
  - Surface relevant insights based on prayer history

- **Continuity**
  - Remember user preferences and settings
  - Resume from last viewed section
  - Highlight streak progress and achievements

## 3. Transition Strategy

### Data Thresholds

Define clear thresholds for when to transition from "new user" to "returning user" experiences:

- **Minimal Data**: 1-3 days of prayer tracking
  - Show simplified insights
  - Continue providing guidance
  - Mix of empty states and actual data

- **Sufficient Data**: 7+ days of prayer tracking
  - Full insights experience
  - More personalized recommendations
  - Focus on trends and patterns

### Progressive Feature Revelation

- Introduce advanced features gradually as users engage with the app
- Unlock new insights types as more data becomes available
- Surface community features after establishing individual habits

## 4. Implementation Plan

### Frontend

- Create conditional rendering based on user data presence
- Implement the `EmptyState` component across all pages
- Design skeleton loaders for data-dependent components

### Backend with Supabase

- Store user onboarding status and progress in the `users` table (`onboarding_completed` field)
- Track feature discovery and usage through the `app_analytics` table
- Implement data thresholds for experience transitions using Supabase Row Level Security (RLS) policies
- Use Supabase Auth for user authentication and session management
- Leverage Supabase Realtime for live updates to prayer tracking

### Testing

- Test both new user and returning user flows
- Verify graceful handling of edge cases (partial data, interrupted onboarding)
- Ensure performance is maintained during data loading

## 5. Supabase Integration

### Frontend Connection

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Authentication Flow

```typescript
// Sign up a new user
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) {
    throw error
  }
  
  // Initialize user profile after signup
  if (data?.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      onboarding_completed: false
    })
  }
  
  return data
}

// Sign in an existing user
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw error
  }
  
  return data
}
```

### Data Fetching with React Query

```typescript
// Example of fetching user prayer records
const fetchPrayerRecords = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('prayer_records')
    .select('*')
    .eq('user_id', userId)
    .gte('scheduled_time', `${date}T00:00:00`)
    .lte('scheduled_time', `${date}T23:59:59`)
    .order('scheduled_time', { ascending: true })
  
  if (error) {
    throw error
  }
  
  return data
}

// Using React Query to manage cache and state
const usePrayerRecords = (userId: string, date: string) => {
  return useQuery(
    ['prayer_records', userId, date],
    () => fetchPrayerRecords(userId, date),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}
```

## 6. Success Metrics

- Onboarding completion rate
- Time to first prayer tracking
- Return rate after first session
- Feature discovery percentage
- Transition rate from empty states to data-rich experiences
