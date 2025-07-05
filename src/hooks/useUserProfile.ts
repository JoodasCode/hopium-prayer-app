import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string | null;
  onboarding_completed: boolean;
  prayer_method: string;
  theme_preference: string;
  notification_settings: any;
  location: any;
  last_active?: string;
  prayer_story?: string;
  motivations: string[];
  created_at: string;
  updated_at: string;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  uploadAvatar: (file: File) => Promise<string | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  deleteAvatar: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

export function useUserProfile(userId?: string): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!userId) return null;

    try {
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);

      return avatarUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      return null;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!userId) return false;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  const deleteAvatar = async (): Promise<boolean> => {
    if (!userId || !profile?.avatar_url) return false;

    try {
      setError(null);

      // Extract file path from URL
      const url = new URL(profile.avatar_url);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Get last two parts (bucket/filename)

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('user-uploads')
        .remove([filePath]);

      if (deleteError) {
        console.warn('Error deleting file from storage:', deleteError);
        // Continue with profile update even if file deletion fails
      }

      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);

      return true;
    } catch (err) {
      console.error('Error deleting avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete avatar');
      return false;
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return {
    profile,
    isLoading,
    error,
    uploadAvatar,
    updateProfile,
    deleteAvatar,
    refreshProfile
  };
} 