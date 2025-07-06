import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { locationCache } from '../lib/redis';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
  source: 'gps' | 'ip' | 'manual' | 'cached';
  timestamp: number;
}

export interface LocationHistory {
  locations: LocationData[];
  lastUpdated: number;
}

export function useLocationPersistence() {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [history, setHistory] = useState<LocationHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load persisted location on mount
  useEffect(() => {
    const loadPersistedLocation = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load current location
        const persistedLocation = await locationCache.getUserLocation(user.id);
        if (persistedLocation) {
          setLocation(persistedLocation);
        }

        // Load location history
        const locationHistory = await locationCache.getLocationHistory(user.id);
        if (locationHistory && locationHistory.length > 0) {
          setHistory({
            locations: locationHistory.map(item => item.location),
            lastUpdated: Date.now()
          });
        }
      } catch (err) {
        console.error('Failed to load persisted location:', err);
        setError('Failed to load saved location');
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedLocation();
  }, [user?.id]);

  // Save location to Redis
  const saveLocation = useCallback(async (locationData: LocationData) => {
    if (!user?.id) return;

    try {
      setError(null);
      await locationCache.setUserLocation(user.id, locationData);
      await locationCache.addToLocationHistory(user.id, locationData);
      setLocation(locationData);

      // Update history
      const updatedHistory = await locationCache.getLocationHistory(user.id);
      if (updatedHistory && updatedHistory.length > 0) {
        setHistory({
          locations: updatedHistory.map(item => item.location),
          lastUpdated: Date.now()
        });
      }
    } catch (err) {
      console.error('Failed to save location:', err);
      setError('Failed to save location');
    }
  }, [user?.id]);

  // Clear saved location
  const clearLocation = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      // Note: We don't have a clear method in locationCache, so we'll just set location to null
      setLocation(null);
      setHistory(null);
    } catch (err) {
      console.error('Failed to clear location:', err);
      setError('Failed to clear location');
    }
  }, [user?.id]);

  // Get current location with fallback chain
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    // First try persisted location
    if (location && Date.now() - location.timestamp < 7 * 24 * 60 * 60 * 1000) {
      return location;
    }

    // Try GPS if available
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });

        const gpsLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: 'gps',
          timestamp: Date.now()
        };

        // Save GPS location
        await saveLocation(gpsLocation);
        return gpsLocation;
      } catch (err) {
        console.warn('GPS location failed:', err);
      }
    }

    // Fallback to IP-based location
    try {
      const response = await fetch('/api/location');
      const ipLocation = await response.json();
      
      const fallbackLocation: LocationData = {
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
        city: ipLocation.city,
        country: ipLocation.country,
        timezone: ipLocation.timezone,
        source: 'ip',
        timestamp: Date.now()
      };

      await saveLocation(fallbackLocation);
      return fallbackLocation;
    } catch (err) {
      console.warn('IP location failed:', err);
    }

    // Final fallback to Mecca
    const meccaLocation: LocationData = {
      latitude: 21.4225,
      longitude: 39.8262,
      city: 'Mecca',
      country: 'Saudi Arabia',
      timezone: 'Asia/Riyadh',
      source: 'manual',
      timestamp: Date.now()
    };

    await saveLocation(meccaLocation);
    return meccaLocation;
  }, [location, saveLocation]);

  // Set manual location
  const setManualLocation = useCallback(async (
    latitude: number, 
    longitude: number, 
    city?: string, 
    country?: string,
    timezone?: string
  ) => {
    const manualLocation: LocationData = {
      latitude,
      longitude,
      city,
      country,
      timezone,
      source: 'manual',
      timestamp: Date.now()
    };

    await saveLocation(manualLocation);
    return manualLocation;
  }, [saveLocation]);

  // Check if location is stale
  const isLocationStale = useCallback((maxAge: number = 7 * 24 * 60 * 60 * 1000) => {
    if (!location) return true;
    return Date.now() - location.timestamp > maxAge;
  }, [location]);

  return {
    location,
    history,
    isLoading,
    error,
    saveLocation,
    clearLocation,
    getCurrentLocation,
    setManualLocation,
    isLocationStale,
    hasPersistedLocation: !!location
  };
} 