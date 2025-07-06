'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { 
  calculatePrayerTimes, 
  generatePrayersForDate, 
  getNextPrayer, 
  getCurrentLocation,
  type CalculationMethodKey
} from '@/lib/prayerTimes';
import type { LocationData, PrayerTimes, Prayer } from '@/types';
import { supabase } from '@/lib/supabase';

export interface UsePrayerTimesProps {
  userId?: string;
  date?: Date;
  location?: LocationData;
  calculationMethod?: CalculationMethodKey;
}

export interface UsePrayerTimesReturn {
  prayerTimes: PrayerTimes | null;
  prayers: Prayer[];
  nextPrayer: Prayer | null;
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePrayerTimes({ 
  userId, 
  date = new Date(),
  location,
  calculationMethod = 'MWL'
}: UsePrayerTimesProps = {}): UsePrayerTimesReturn {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;

  // Get user's completed prayers for the day
  const { data: completedPrayers = [] } = useQuery({
    queryKey: ['completedPrayers', effectiveUserId, date.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      
      const dateStr = date.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('prayer_records')
        .select('prayer_type, id')
        .eq('user_id', effectiveUserId)
        .eq('completed', true)
        .gte('scheduled_time', `${dateStr}T00:00:00`)
        .lte('scheduled_time', `${dateStr}T23:59:59`);
      
      if (error) {
        console.error('Error fetching completed prayers:', error);
        return [];
      }
      
      return (data || []).map(record => `${record.prayer_type.toLowerCase()}-${dateStr}`);
    },
    enabled: !!effectiveUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user location with caching and fallbacks
  const {
    data: userLocation,
    isLoading: locationLoading,
    error: locationError
  } = useQuery({
    queryKey: ['userLocation', effectiveUserId],
    queryFn: async () => {
      try {
        // Use provided location or get current location
        const loc = location || await getCurrentLocation(effectiveUserId);
        console.log(`📍 Location resolved:`, loc.city, loc.country);
        return loc;
      } catch (error) {
        console.error('❌ Location detection failed:', error);
        // Return fallback location instead of throwing
        return {
          latitude: 21.4225,
          longitude: 39.8262,
          city: 'Mecca',
          country: 'Saudi Arabia',
          source: 'manual' as const,
        };
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - location doesn't change often
    gcTime: 2 * 60 * 60 * 1000, // 2 hours garbage collection
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry location errors, use fallback instead
      console.warn(`Location query failed (attempt ${failureCount + 1}):`, error);
      return false;
    },
  });

  // Single unified query for all prayer data to avoid multiple API calls
  const {
    data: prayerData,
    isLoading: prayerDataLoading,
    error: prayerDataError,
    refetch: refetchPrayerData
  } = useQuery({
    queryKey: [
      'prayerData', 
      userLocation?.latitude, 
      userLocation?.longitude, 
      date.toISOString().split('T')[0],
      calculationMethod,
      completedPrayers.length // Include completed prayers count to trigger refetch when prayers are marked complete
    ],
    queryFn: async () => {
      if (!userLocation) {
        throw new Error('Location not available for prayer times calculation');
      }
      
      console.log(`🕌 Calculating prayer data for ${userLocation.city} on ${date.toISOString().split('T')[0]}`);
      
      try {
        // Get prayer times once and derive everything else from it
        const prayerTimes = await Promise.race([
          calculatePrayerTimes(userLocation, date, calculationMethod),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Prayer times calculation timeout')), 15000)
          )
        ]) as PrayerTimes;
        
        // Generate prayers from the prayer times data (using correct parameters)
        const prayers = await generatePrayersForDate(userLocation, date, completedPrayers, calculationMethod);
        
        // Find next prayer from the generated prayers
        const now = new Date();
        const nextPrayer = prayers.find(p => p.time > now && p.status !== 'completed') || null;
        
        console.log(`✅ Prayer data calculated successfully for ${userLocation.city}`);
        
        return {
          prayerTimes,
          prayers: prayers as Prayer[],
          nextPrayer,
          location: userLocation,
        };
      } catch (error) {
        console.error('❌ Prayer data calculation failed:', error);
        
        // Return fallback data instead of throwing
        const fallbackTime = new Date();
        const fallbackPrayerTimes: PrayerTimes = {
          fajr: new Date(fallbackTime.getFullYear(), fallbackTime.getMonth(), fallbackTime.getDate(), 5, 30),
          dhuhr: new Date(fallbackTime.getFullYear(), fallbackTime.getMonth(), fallbackTime.getDate(), 12, 30),
          asr: new Date(fallbackTime.getFullYear(), fallbackTime.getMonth(), fallbackTime.getDate(), 15, 45),
          maghrib: new Date(fallbackTime.getFullYear(), fallbackTime.getMonth(), fallbackTime.getDate(), 18, 15),
          isha: new Date(fallbackTime.getFullYear(), fallbackTime.getMonth(), fallbackTime.getDate(), 20, 0),
          sunrise: new Date(fallbackTime.getFullYear(), fallbackTime.getMonth(), fallbackTime.getDate(), 6, 0),
          sunset: new Date(fallbackTime.getFullYear(), fallbackTime.getMonth(), fallbackTime.getDate(), 18, 0),
        };
        
        const fallbackPrayers: Prayer[] = [
          { id: 'fajr', name: 'Fajr', time: fallbackPrayerTimes.fajr, scheduledTime: fallbackPrayerTimes.fajr.toISOString(), completed: false, status: 'upcoming' },
          { id: 'dhuhr', name: 'Dhuhr', time: fallbackPrayerTimes.dhuhr, scheduledTime: fallbackPrayerTimes.dhuhr.toISOString(), completed: false, status: 'upcoming' },
          { id: 'asr', name: 'Asr', time: fallbackPrayerTimes.asr, scheduledTime: fallbackPrayerTimes.asr.toISOString(), completed: false, status: 'upcoming' },
          { id: 'maghrib', name: 'Maghrib', time: fallbackPrayerTimes.maghrib, scheduledTime: fallbackPrayerTimes.maghrib.toISOString(), completed: false, status: 'upcoming' },
          { id: 'isha', name: 'Isha', time: fallbackPrayerTimes.isha, scheduledTime: fallbackPrayerTimes.isha.toISOString(), completed: false, status: 'upcoming' },
        ];
        
        console.warn('🔄 Using fallback prayer data due to API issues');
        
        return {
          prayerTimes: fallbackPrayerTimes,
          prayers: fallbackPrayers,
          nextPrayer: fallbackPrayers.find(p => p.name === 'Dhuhr') || null,
          location: userLocation,
        };
      }
    },
    enabled: !!userLocation, // Only run when we have a location
    staleTime: 30 * 60 * 1000, // 30 minutes - prayer times are stable
    gcTime: 2 * 60 * 60 * 1000, // 2 hours garbage collection
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000, // Refresh every minute for next prayer updates
    retry: (failureCount, error) => {
      // Retry up to 2 times, but not for location errors
      if (error?.message?.includes('Location not available')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Extract data with fallbacks
  const prayerTimes = prayerData?.prayerTimes || null;
  const prayers = prayerData?.prayers || [];
  const nextPrayer = prayerData?.nextPrayer || null;

  // Consolidated loading state
  const isLoading = locationLoading || (!!userLocation && prayerDataLoading);
  
  // Consolidated error state
  const error = locationError?.message || prayerDataError?.message || null;

  return {
    prayerTimes,
    prayers,
    nextPrayer,
    location: userLocation || null,
    isLoading,
    error,
    refetch: refetchPrayerData,
  };
}

// Additional hook for just getting current location
export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLoading(true);
        const gpsLocation = await getCurrentLocation();
        setLocation(gpsLocation);
        setError(null);
      } catch (gpsError) {
        try {
          const ipLocation = await getCurrentLocation();
          setLocation(ipLocation);
          setError(null);
        } catch (ipError) {
          setError('Unable to determine location');
          // Use default location
          setLocation({
            latitude: 51.5074,
            longitude: -0.1278,
            city: 'London',
            country: 'United Kingdom'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, isLoading, error };
}
