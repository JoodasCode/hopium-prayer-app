# Onboarding Implementation Plan

## Overview

This document outlines the implementation plan for Hopium's enhanced onboarding flow, focusing on integration with our existing Supabase backend and AI personalization features.

## Database Schema Updates

### New Tables

```sql
-- User onboarding state
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  motivations TEXT[] DEFAULT '{}',
  prayer_story TEXT,
  theme TEXT DEFAULT 'serene',
  prayer_baseline JSONB DEFAULT '{"fajr": false, "dhuhr": false, "asr": false, "maghrib": false, "isha": false}',
  intentions TEXT[] DEFAULT '{}',
  lopi_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- User intentions tracking
CREATE TABLE user_intentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  intention TEXT NOT NULL,
  week_starting DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Updates to Existing Tables

```sql
-- Add fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS prayer_story TEXT,
  ADD COLUMN IF NOT EXISTS motivations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'serene';
```

## Frontend Components

### Core Components

1. **OnboardingContainer**
   - Manages overall state and progression
   - Handles saving to Supabase at each step

2. **OnboardingStep**
   - Base component for each step
   - Handles transitions and animations

3. **MotivationSelector**
   - Multi-select component for "Why Are You Here?"
   - Stores selections for AI personalization

4. **PrayerBaselineForm**
   - Checkbox group for current prayer habits
   - Sets baseline for streak calculations

5. **IntentionSetter**
   - Goal selection for first week
   - Creates first intention record

### Implementation Example

```tsx
// src/components/onboarding/OnboardingContainer.tsx
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingStep } from './OnboardingStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { MotivationStep } from './steps/MotivationStep';
import { PrayerStoryStep } from './steps/PrayerStoryStep';
import { ThemeStep } from './steps/ThemeStep';
import { QiblaStep } from './steps/QiblaStep';
import { PrayerBaselineStep } from './steps/PrayerBaselineStep';
import { RemindersStep } from './steps/RemindersStep';
import { IntentionStep } from './steps/IntentionStep';
import { LopiIntroStep } from './steps/LopiIntroStep';
import { CompletionStep } from './steps/CompletionStep';

export default function OnboardingContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingState, setOnboardingState] = useState({
    step: 0,
    motivations: [],
    prayerStory: '',
    theme: 'serene',
    prayerBaseline: {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false
    },
    intentions: [],
    lopiEnabled: true
  });
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  // Fetch user ID on mount
  useEffect(() => {
    async function getUserId() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        
        // Check if user has already completed onboarding
        const { data: onboarding } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
          
        if (onboarding?.completed) {
          router.push('/');
        } else if (onboarding) {
          // Resume onboarding
          setCurrentStep(onboarding.step);
          setOnboardingState({
            ...onboardingState,
            ...onboarding
          });
        }
      } else {
        // If no authenticated user, redirect to login
        router.push('/login');
      }
    }
    
    getUserId();
  }, []);
  
  // Save progress to Supabase
  const saveProgress = async (updates = {}) => {
    if (!userId) return;
    
    const updatedState = {
      ...onboardingState,
      ...updates,
      step: currentStep
    };
    
    setOnboardingState(updatedState);
    
    await supabase
      .from('user_onboarding')
      .upsert({
        user_id: userId,
        ...updatedState,
        updated_at: new Date().toISOString()
      });
  };
  
  // Handle step navigation
  const nextStep = async (updates = {}) => {
    await saveProgress(updates);
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };
  
  // Complete onboarding
  const completeOnboarding = async () => {
    if (!userId) return;
    
    // Mark onboarding as complete
    await supabase
      .from('user_onboarding')
      .upsert({
        user_id: userId,
        ...onboardingState,
        completed: true,
        completed_at: new Date().toISOString()
      });
      
    // Update user profile with key onboarding data
    await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        prayer_story: onboardingState.prayerStory,
        motivations: onboardingState.motivations,
        theme_preference: onboardingState.theme
      })
      .eq('id', userId);
      
    // Create first intention if set
    if (onboardingState.intentions.length > 0) {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      
      await supabase
        .from('user_intentions')
        .insert({
          user_id: userId,
          intention: onboardingState.intentions[0],
          week_starting: weekStart.toISOString().split('T')[0]
        });
    }
    
    // Redirect to dashboard
    router.push('/');
  };
  
  // Render current step
  const renderStep = () => {
    switch(currentStep) {
      case 0:
        return <WelcomeStep onNext={nextStep} />;
      case 1:
        return <MotivationStep 
          onNext={(motivations) => nextStep({ motivations })} 
          selectedMotivations={onboardingState.motivations} 
        />;
      case 2:
        return <PrayerStoryStep 
          onNext={(prayerStory) => nextStep({ prayerStory })} 
          onBack={prevStep} 
          selectedStory={onboardingState.prayerStory} 
        />;
      case 3:
        return <ThemeStep 
          onNext={(theme) => nextStep({ theme })} 
          onBack={prevStep} 
          selectedTheme={onboardingState.theme} 
        />;
      case 4:
        return <QiblaStep 
          onNext={nextStep} 
          onBack={prevStep} 
        />;
      case 5:
        return <PrayerBaselineStep 
          onNext={(prayerBaseline) => nextStep({ prayerBaseline })} 
          onBack={prevStep} 
          selectedBaseline={onboardingState.prayerBaseline} 
        />;
      case 6:
        return <RemindersStep 
          onNext={nextStep} 
          onBack={prevStep} 
        />;
      case 7:
        return <IntentionStep 
          onNext={(intentions) => nextStep({ intentions })} 
          onBack={prevStep} 
          selectedIntentions={onboardingState.intentions} 
        />;
      case 8:
        return <LopiIntroStep 
          onNext={(lopiEnabled) => nextStep({ lopiEnabled })} 
          onBack={prevStep} 
          lopiEnabled={onboardingState.lopiEnabled} 
          motivations={onboardingState.motivations}
          prayerStory={onboardingState.prayerStory}
        />;
      case 9:
        return <CompletionStep 
          onComplete={completeOnboarding} 
          onBack={prevStep} 
        />;
      default:
        return <WelcomeStep onNext={nextStep} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
              <div 
                key={step}
                className={`w-3 h-3 rounded-full ${currentStep >= step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
        
        {/* Current step */}
        {renderStep()}
      </div>
    </div>
  );
}
```

## AI Personalization Integration

### Lopi AI Assistant Personalization

The onboarding data will be used to personalize Lopi's interactions with users:

1. **Motivation-Based Responses**
   - Store user motivations in Supabase
   - Include motivations in context for AI responses
   - Tailor response tone based on primary motivation

2. **Prayer Story Context**
   - Adjust difficulty of guidance based on prayer story
   - Provide more explanations for beginners
   - Offer deeper insights for experienced users

3. **Intention-Aware Conversations**
   - Reference current intention in conversations
   - Provide encouragement related to intention progress
   - Celebrate when intentions are achieved

### Implementation Example

```typescript
// src/utils/getLopiContext.ts
export async function getLopiContext(
  userId: string,
  query: string,
  customSupabase?: SupabaseClient<Database>
): Promise<string> {
  try {
    const client = customSupabase || supabaseClient;
    
    // Get user profile with onboarding data
    const { data: profile } = await client
      .from('users')
      .select('display_name, prayer_story, motivations, theme_preference')
      .eq('id', userId)
      .single();
      
    // Get current intention
    const today = new Date();
    const { data: currentIntention } = await client
      .from('user_intentions')
      .select('intention, completed')
      .eq('user_id', userId)
      .gte('week_starting', new Date(today.setDate(today.getDate() - 7)).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Get vector search results
    const searchResults = await searchKnowledge(query, client);
    
    // Build context string
    let context = '';
    
    // Add user context
    if (profile) {
      context += `USER CONTEXT:\n`;
      context += `Name: ${profile.display_name || 'User'}\n`;
      context += `Experience Level: ${profile.prayer_story || 'Unknown'}\n`;
      context += `Primary Motivations: ${profile.motivations?.join(', ') || 'Unknown'}\n`;
      context += `Theme Preference: ${profile.theme_preference || 'serene'}\n`;
    }
    
    // Add intention context
    if (currentIntention) {
      context += `\nCURRENT INTENTION:\n`;
      context += `${currentIntention.intention} (${currentIntention.completed ? 'Completed' : 'In Progress'})\n`;
    }
    
    // Add knowledge context
    if (searchResults && searchResults.length > 0) {
      context += `\nRELEVANT KNOWLEDGE:\n`;
      searchResults.forEach((result, i) => {
        context += `${i + 1}. ${result.topic}: ${result.content.substring(0, 200)}...\n`;
      });
    }
    
    return context;
  } catch (error) {
    console.error('Error getting Lopi context:', error);
    return '';
  }
}
```

## Implementation Phases

### Phase 1: Basic Structure (Week 1)

1. Create database schema updates
2. Implement core OnboardingContainer component
3. Build first three steps (Welcome, Motivation, Theme)
4. Set up basic progress saving

### Phase 2: Complete Flow (Week 2)

1. Implement remaining onboarding steps
2. Add haptic feedback integration
3. Create animations and transitions
4. Build completion and dashboard redirect

### Phase 3: AI Integration (Week 3)

1. Connect onboarding data to Lopi AI context
2. Implement personalized welcome message
3. Create intention tracking system
4. Test personalization effectiveness

## Testing Plan

1. **User Flow Testing**
   - Test complete onboarding flow
   - Verify data saving at each step
   - Test resuming interrupted onboarding

2. **AI Personalization Testing**
   - Verify onboarding data appears in AI context
   - Test different motivation combinations
   - Ensure personalized responses match user profile

3. **Performance Testing**
   - Measure load times for each step
   - Test haptic feedback timing
   - Verify animation performance on lower-end devices

## Conclusion

This implementation plan provides a structured approach to building the enhanced onboarding flow while integrating it with our existing Supabase backend and AI personalization features. By following this plan, we can create a seamless, emotionally resonant onboarding experience that sets users up for success in their prayer journey.
