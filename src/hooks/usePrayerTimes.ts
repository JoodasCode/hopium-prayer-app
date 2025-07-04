'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  calculatePrayerTimes, 
  getNextPrayer, 
  generatePrayersForDate,
  getCurrentLocation,
  getLocationFromIP 
} from '@/lib/prayerTimes';
import type { PrayerTimes, LocationData, Prayer, UsePrayerTimesReturn } from '@/types';
import { supabase } from '@/lib/supabase';

interface UsePrayerTimesProps {
  userId?: string;
  date?: Date;
  location?: LocationData;
}

export function usePrayerTimes({ 
  userId, 
  date = new Date(),
  location 
}: UsePrayerTimesProps = {}): UsePrayerTimesReturn {
  const [userLocation, setUserLocation] = useState<LocationData | null>(location || null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user location if not provided
  useEffect(() => {
    if (!location && !userLocation) {
      const getLocation = async () => {
        try {
          // Try GPS first with timeout
          const gpsLocation = await Promise.race([
            getCurrentLocation(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('GPS timeout')), 5000)
            )
          ]);
          setUserLocation(gpsLocation as LocationData);
          setLocationError(null);
        } catch (gpsError) {
          try {
            // Fallback to IP location with timeout
            const ipLocation = await Promise.race([
              getLocationFromIP(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('IP location timeout')), 3000)
              )
            ]);
            setUserLocation(ipLocation as LocationData);
            setLocationError(null);
          } catch (ipError) {
            setLocationError('Unable to determine location. Using default location.');
            // Use default location (London for testing)
            setUserLocation({
              latitude: 51.5074,
              longitude: -0.1278,
              city: 'London',
              country: 'United Kingdom'
            });
          }
        }
      };

      getLocation();
    }
  }, [location, userLocation]);

  // Fetch prayer times
  const {
    data: prayerTimes,
    isLoading: prayerTimesLoading,
    error: prayerTimesError,
    refetch: refetchPrayerTimes
  } = useQuery({
    queryKey: ['prayerTimes', userLocation, date.toDateString()],
    queryFn: () => {
      if (!userLocation) throw new Error('Location not available');
      return calculatePrayerTimes(userLocation, date);
    },
    enabled: !!userLocation,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });

  // Fetch next prayer
  const {
    data: nextPrayerData,
    isLoading: nextPrayerLoading,
    error: nextPrayerError,
  } = useQuery({
    queryKey: ['nextPrayer', userLocation, new Date().toISOString()],
    queryFn: () => {
      if (!userLocation) throw new Error('Location not available');
      return getNextPrayer(userLocation, new Date());
    },
    enabled: !!userLocation,
    refetchInterval: 60 * 1000, // Update every minute
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch completed prayers for the user
  const {
    data: completedPrayers = [],
    isLoading: completedPrayersLoading,
  } = useQuery({
    queryKey: ['completedPrayers', userId, date.toDateString()],
    queryFn: async () => {
      if (!userId) return [];
      
      // Fetch completed prayers from Supabase for the specific date
      const dateStr = date.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('prayer_records')
        .select('prayer_type, id')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('scheduled_time', `${dateStr}T00:00:00`)
        .lte('scheduled_time', `${dateStr}T23:59:59`);
      
      if (error) {
        console.error('Error fetching completed prayers:', error);
        return [];
      }
      
      // Return array of prayer IDs in the format expected by generatePrayersForDate
      return (data || []).map(record => `${record.prayer_type}-${dateStr}`);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate prayers for the date
  const {
    data: prayers,
    isLoading: prayersLoading,
    error: prayersError,
  } = useQuery({
    queryKey: ['prayers', userLocation, date.toDateString(), completedPrayers],
    queryFn: () => {
      if (!userLocation) throw new Error('Location not available');
      return generatePrayersForDate(userLocation, date, completedPrayers);
    },
    enabled: !!userLocation,
    staleTime: 60 * 1000, // 1 minute
  });

  // Create next prayer object
  const nextPrayer: Prayer | null = nextPrayerData && prayers ? 
    prayers.find(p => p.name === nextPrayerData.prayer && p.status !== 'completed') || null : null;

  // Only consider essential queries for loading state
  const isLoading = !userLocation || prayersLoading;
  const error = locationError || 
    (prayerTimesError instanceof Error ? prayerTimesError.message : null) ||
    (nextPrayerError instanceof Error ? nextPrayerError.message : null) ||
    (prayersError instanceof Error ? prayersError.message : null);

  const refreshPrayerTimes = async () => {
    await refetchPrayerTimes();
  };

  return {
    prayerTimes: prayerTimes || null,
    nextPrayer,
    prayers: prayers || [],
    location: userLocation,
    isLoading,
    error,
    refreshPrayerTimes,
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
          const ipLocation = await getLocationFromIP();
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
