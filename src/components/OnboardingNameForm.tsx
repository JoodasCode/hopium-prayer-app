/**
 * OnboardingNameForm component for collecting user's preferred display name
 * Used for AI assistant personalization
 */

'use client';

import { useState } from 'react';
import { useSupabaseClient } from '../hooks/useSupabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';

interface OnboardingNameFormProps {
  userId: string;
  initialDisplayName?: string;
  onComplete?: () => void;
}

export default function OnboardingNameForm({ 
  userId, 
  initialDisplayName = '',
  onComplete 
}: OnboardingNameFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your preferred name for a personalized experience.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update the user's display_name in the database
      const { error } = await supabase
        .from('users')
        .update({ 
          display_name: displayName.trim(),
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: `Thank you, ${displayName}! Your AI assistant will now use your preferred name.`,
      });
      
      // Call the onComplete callback if provided
      if (onComplete) onComplete();
      
    } catch (error) {
      console.error('Error updating display name:', error);
      toast({
        title: 'Update failed',
        description: 'There was a problem saving your preferred name. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Personalize Your Experience</CardTitle>
        <CardDescription>
          Let us know what name you prefer to be called. This will be used by the Mulvi AI assistant 
          to personalize your experience.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your Preferred Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your preferred name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                Let us know what name you prefer to be called. This will be used by the Mulvi AI assistant
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : 'Save Preference'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
