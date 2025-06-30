/**
 * Onboarding AI Integration Utilities
 * 
 * Functions to connect onboarding data with Lopi AI assistant
 * for personalized user experiences based on motivations and preferences
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Get personalized welcome message for user based on onboarding data
 */
export async function getPersonalizedWelcome(
  userId: string,
  supabaseClient: SupabaseClient<Database>
): Promise<string> {
  try {
    // Get user profile with onboarding data
    const { data: profile } = await supabaseClient
      .from('users')
      .select('display_name, prayer_story, motivations, theme_preference')
      .eq('id', userId)
      .single();
    
    if (!profile) {
      return getDefaultWelcome();
    }
    
    // Extract key information
    const name = profile.display_name || 'friend';
    const motivations = profile.motivations || [];
    const prayerStory = profile.prayer_story || '';
    
    // Determine primary motivation
    let primaryMotivation = '';
    if (motivations.length > 0) {
      primaryMotivation = motivations[0];
    }
    
    // Generate personalized welcome based on motivation
    return generateMotivationBasedWelcome(name, primaryMotivation, prayerStory);
  } catch (error) {
    console.error('Error generating personalized welcome:', error);
    return getDefaultWelcome();
  }
}

/**
 * Generate welcome message based on user's primary motivation
 */
function generateMotivationBasedWelcome(
  name: string,
  motivation: string,
  prayerStory: string
): string {
  // Default welcome
  let welcome = `Assalamu alaikum ${name}! I'm Lopi, your prayer companion. I'm here to support your journey.`;
  
  // Personalize based on motivation
  if (motivation.includes('reconnect')) {
    welcome = `Assalamu alaikum ${name}! I'm Lopi, your prayer companion. It's beautiful that you're seeking to reconnect with prayer. Each step back to prayer is a step toward peace.`;
  } 
  else if (motivation.includes('peace')) {
    welcome = `Assalamu alaikum ${name}! I'm Lopi, your prayer companion. In the midst of life's chaos, I'm here to help you find moments of tranquility through prayer.`;
  }
  else if (motivation.includes('forget') || motivation.includes('miss')) {
    welcome = `Assalamu alaikum ${name}! I'm Lopi, your prayer companion. I'll be your gentle reminder for prayers, making it easier to stay consistent in your practice.`;
  }
  else if (motivation.includes('habit')) {
    welcome = `Assalamu alaikum ${name}! I'm Lopi, your prayer companion. Together, we'll build a beautiful prayer habit that becomes a natural part of your day.`;
  }
  
  // Add prayer story context if available
  if (prayerStory === 'Returning after a break') {
    welcome += " It's never too late to return to what matters. We'll take it one prayer at a time.";
  }
  else if (prayerStory === 'Just starting my journey') {
    welcome += " Every journey begins with a single step. I'm honored to be with you from the beginning.";
  }
  else if (prayerStory === 'Maintaining my practice') {
    welcome += " I'm here to help you deepen and enrich your existing practice.";
  }
  else if (prayerStory === 'Seeking deeper connection') {
    welcome += " The search for deeper meaning is sacred. I'm here to support your spiritual growth.";
  }
  
  return welcome;
}

/**
 * Default welcome message when personalization data isn't available
 */
function getDefaultWelcome(): string {
  return "Assalamu alaikum! I'm Lopi, your prayer companion. I'm here to support your journey toward a more consistent and meaningful prayer practice.";
}

/**
 * Enhance AI context with onboarding data
 */
export async function enhanceAIContextWithOnboarding(
  userId: string,
  baseContext: string,
  supabaseClient: SupabaseClient<Database>
): Promise<string> {
  try {
    // Get onboarding data
    const { data: onboarding } = await supabaseClient
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!onboarding) {
      return baseContext;
    }
    
    // Build enhanced context
    let enhancedContext = baseContext;
    
    // Add onboarding insights
    enhancedContext += '\n\nUSER ONBOARDING INSIGHTS:\n';
    
    // Add motivations
    if (onboarding.motivations && onboarding.motivations.length > 0) {
      enhancedContext += `Primary Motivations: ${onboarding.motivations.join(', ')}\n`;
    }
    
    // Add prayer baseline
    if (onboarding.prayer_baseline) {
      const baseline = onboarding.prayer_baseline as Record<string, boolean>;
      const observedPrayers = Object.entries(baseline)
        .filter(([_, observed]) => observed)
        .map(([prayer]) => prayer);
      
      if (observedPrayers.length > 0) {
        enhancedContext += `Currently Observes: ${observedPrayers.join(', ')}\n`;
      } else {
        enhancedContext += 'Currently building prayer practice from the beginning\n';
      }
    }
    
    // Add current intention
    if (onboarding.intentions && onboarding.intentions.length > 0) {
      enhancedContext += `Current Intention: ${onboarding.intentions[0]}\n`;
    }
    
    return enhancedContext;
  } catch (error) {
    console.error('Error enhancing AI context:', error);
    return baseContext;
  }
}

/**
 * Update getLopiContext to include onboarding data
 */
export async function getEnhancedLopiContext(
  userId: string,
  query: string,
  customSupabase?: SupabaseClient<Database>
): Promise<string> {
  // This would be integrated with your existing getLopiContext function
  // Here's a simplified version showing the integration
  
  try {
    const client = customSupabase || supabaseClient;
    
    // Get base context (vector search results, etc.)
    // This would call your existing context gathering logic
    const baseContext = await getBaseContext(userId, query, client);
    
    // Enhance with onboarding data
    return enhanceAIContextWithOnboarding(userId, baseContext, client);
  } catch (error) {
    console.error('Error getting enhanced Lopi context:', error);
    return '';
  }
}

// Placeholder for your existing context function
async function getBaseContext(
  userId: string,
  query: string,
  client: SupabaseClient<Database>
): Promise<string> {
  // This would be replaced with your actual implementation
  return 'Base context from vector search';
}

// Placeholder for supabase client
const supabaseClient = null as unknown as SupabaseClient<Database>;
