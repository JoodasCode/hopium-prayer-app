import type { PrayerTimes, LocationData, Prayer, PrayerName } from '@/types';
import { prayerTimesCache, locationCache, createLocationHash, performanceCache } from './redis';

// AlAdhan API Configuration
const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Calculation Methods mapping
export const CALCULATION_METHODS = {
  ISNA: 2,     // Islamic Society of North America
  MWL: 3,      // Muslim World League (default)
  EGYPT: 5,    // Egyptian General Authority of Survey
  MAKKAH: 4,   // Umm Al-Qura University, Makkah
  KARACHI: 1,  // University of Islamic Sciences, Karachi
  TEHRAN: 7,   // Institute of Geophysics, University of Tehran
  JAFARI: 0,   // Shia Ithna-Ashari, Leva Institute, Qum
} as const;

export type CalculationMethodKey = keyof typeof CALCULATION_METHODS;

// Cache interface
interface CachedPrayerData {
  prayerTimes: PrayerTimes;
  prayers: Prayer[];
  nextPrayer: { prayer: PrayerName; time: Date } | null;
  timestamp: number;
  location: LocationData;
  date: string;
}

// In-memory cache
const prayerCache = new Map<string, CachedPrayerData>();

/**
 * Validate location data to ensure it's valid for API calls
 */
function validateLocation(location: LocationData): boolean {
  if (!location) {
    console.error('❌ Location is null or undefined');
    return false;
  }
  
  const { latitude, longitude } = location;
  
  // Check if coordinates are numbers
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    console.error('❌ Invalid coordinate types:', { latitude: typeof latitude, longitude: typeof longitude });
    return false;
  }
  
  // Check if coordinates are within valid ranges
  if (isNaN(latitude) || isNaN(longitude)) {
    console.error('❌ Coordinates are NaN:', { latitude, longitude });
    return false;
  }
  
  // Check latitude range (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    console.error('❌ Invalid latitude range:', latitude);
    return false;
  }
  
  // Check longitude range (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    console.error('❌ Invalid longitude range:', longitude);
    return false;
  }
  
  return true;
}

/**
 * Validate date to ensure it's valid for API calls
 */
function validateDate(date: Date): boolean {
  if (!date || !(date instanceof Date)) {
    console.error('❌ Invalid date object:', date);
    return false;
  }
  
  if (isNaN(date.getTime())) {
    console.error('❌ Date is invalid (NaN):', date);
    return false;
  }
  
  // Check if date is within reasonable range (not too far in past/future)
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  if (date < oneYearAgo || date > oneYearFromNow) {
    console.warn('⚠️ Date is outside reasonable range:', date);
    // Don't return false, just warn - API might still handle it
  }
  
  return true;
}

/**
 * Generate cache key for consistent caching
 */
function generateCacheKey(
  location: LocationData, 
  date: Date, 
  method: CalculationMethodKey = 'MWL'
): string {
  const dateStr = date.toISOString().split('T')[0];
  return `${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}_${method}_${dateStr}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cachedData: CachedPrayerData): boolean {
  const now = Date.now();
  const cacheAge = now - cachedData.timestamp;
  return cacheAge < CACHE_DURATION;
}

/**
 * Fetch prayer times from AlAdhan API with enhanced error handling
 */
async function fetchPrayerTimesFromAPI(
  location: LocationData,
  date: Date,
  method: CalculationMethodKey = 'MWL'
): Promise<any> {
  // Validate inputs before making API call
  if (!validateLocation(location)) {
    throw new Error('Invalid location data for API call');
  }
  
  if (!validateDate(date)) {
    throw new Error('Invalid date for API call');
  }
  
  const dateStr = date.toISOString().split('T')[0];
  const methodId = CALCULATION_METHODS[method];
  
  // Ensure coordinates are properly formatted (max 6 decimal places)
  const lat = Number(location.latitude.toFixed(6));
  const lng = Number(location.longitude.toFixed(6));
  
  // Build URL with proper encoding
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    method: methodId.toString()
  });
  
  const url = `${ALADHAN_BASE_URL}/timings/${dateStr}?${params.toString()}`;
  
  console.log(`🌐 Fetching prayer times from: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mulvi-Prayer-App/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ AlAdhan API HTTP error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`AlAdhan API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate API response
    if (!data) {
      throw new Error('Empty response from AlAdhan API');
    }
    
    if (data.code !== 200) {
      console.error('❌ AlAdhan API returned error code:', data);
      throw new Error(`AlAdhan API returned error: ${data.status || 'Unknown error'}`);
    }
    
    if (!data.data || !data.data.timings) {
      throw new Error('Invalid response structure from AlAdhan API');
    }
    
    console.log(`✅ Successfully fetched prayer times for ${lat}, ${lng} on ${dateStr}`);
    return data.data;
    
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AlAdhan API request timed out');
    }
    throw error;
  }
}

/**
 * Convert AlAdhan API response to our PrayerTimes format with validation
 */
function convertAPIToPrayerTimes(apiData: any, date: Date): PrayerTimes {
  const timings = apiData.timings;
  const dateStr = date.toISOString().split('T')[0];
  
  // Validate that we have all required prayer times
  const requiredPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Sunrise', 'Sunset'];
  for (const prayer of requiredPrayers) {
    if (!timings[prayer]) {
      throw new Error(`Missing ${prayer} time in API response`);
    }
  }
  
  // Helper function to create Date object from time string with validation
  const createDateTime = (timeStr: string, prayerName: string): Date => {
    try {
      const [time] = timeStr.split(' '); // Remove timezone info
      const dateTime = new Date(`${dateStr}T${time}:00`);
      
      if (isNaN(dateTime.getTime())) {
        throw new Error(`Invalid time format for ${prayerName}: ${timeStr}`);
      }
      
      return dateTime;
    } catch (error: unknown) {
      console.error(`❌ Error parsing ${prayerName} time:`, error);
      // Return a fallback time (current time + offset based on prayer)
      const fallbackTime = new Date(date);
      const prayerOffsets: Record<string, number> = {
        'Fajr': 5,
        'Dhuhr': 12,
        'Asr': 15,
        'Maghrib': 18,
        'Isha': 20,
        'Sunrise': 6,
        'Sunset': 19
      };
      fallbackTime.setHours(prayerOffsets[prayerName] || 12, 0, 0, 0);
      return fallbackTime;
    }
  };
  
  return {
    fajr: createDateTime(timings.Fajr, 'Fajr'),
    dhuhr: createDateTime(timings.Dhuhr, 'Dhuhr'),
    asr: createDateTime(timings.Asr, 'Asr'),
    maghrib: createDateTime(timings.Maghrib, 'Maghrib'),
    isha: createDateTime(timings.Isha, 'Isha'),
    sunrise: createDateTime(timings.Sunrise, 'Sunrise'),
    sunset: createDateTime(timings.Sunset, 'Sunset'),
  };
}

/**
 * Calculate prayer times for a given location and date with Redis caching
 */
export async function calculatePrayerTimes(
  location: LocationData,
  date: Date = new Date(),
  method: CalculationMethodKey = 'MWL'
): Promise<PrayerTimes> {
  const locationHash = createLocationHash(location.latitude, location.longitude);
  const dateStr = date.toISOString().split('T')[0];
  
  // Try Redis cache first
  const cachedData = await prayerTimesCache.get(locationHash, dateStr, method);
  if (cachedData) {
    await performanceCache.recordCacheHit('prayer_times');
    console.log(`🚀 Redis cache hit for prayer times: ${locationHash} on ${dateStr}`);
    return cachedData.prayerTimes;
  }
  
  await performanceCache.recordCacheMiss('prayer_times');
  
  // Fallback to in-memory cache
  const cacheKey = generateCacheKey(location, date, method);
  const memCachedData = prayerCache.get(cacheKey);
  
  if (memCachedData && isCacheValid(memCachedData)) {
    console.log(`💾 Memory cache hit for prayer times: ${cacheKey}`);
    // Also cache in Redis for next time
    await prayerTimesCache.set(locationHash, dateStr, method, {
      prayerTimes: memCachedData.prayerTimes,
      prayers: memCachedData.prayers,
      nextPrayer: memCachedData.nextPrayer,
      location: memCachedData.location,
      timestamp: memCachedData.timestamp
    });
    return memCachedData.prayerTimes;
  }
  
  try {
    console.log(`🌐 Fetching fresh prayer times from AlAdhan API for ${locationHash}`);
    const apiData = await fetchPrayerTimesFromAPI(location, date, method);
    const prayerTimes = convertAPIToPrayerTimes(apiData, date);
    
    // Cache the result in both Redis and memory
    const prayers = generatePrayersFromTimes(prayerTimes, date, location, []);
    const nextPrayer = findNextPrayer(prayers);
    
    const cacheData = {
      prayerTimes,
      prayers,
      nextPrayer,
      timestamp: Date.now(),
      location,
      date: dateStr,
    };
    
    // Cache in memory
    prayerCache.set(cacheKey, cacheData);
    
    // Cache in Redis
    await prayerTimesCache.set(locationHash, dateStr, method, cacheData);
    
    return prayerTimes;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    
    // Fallback to any cached data (Redis or memory)
    if (cachedData) {
      console.warn('Using Redis cached prayer times due to API error');
      return cachedData.prayerTimes;
    }
    
    if (memCachedData) {
      console.warn('Using expired memory cached prayer times due to API error');
      return memCachedData.prayerTimes;
    }
    
    throw error;
  }
}

/**
 * Get the next prayer and its time with caching
 */
export async function getNextPrayer(
  location: LocationData,
  date: Date = new Date(),
  method: CalculationMethodKey = 'MWL'
): Promise<{ prayer: PrayerName; time: Date } | null> {
  const cacheKey = generateCacheKey(location, date, method);
  const cachedData = prayerCache.get(cacheKey);
  
  // Return cached data if valid
  if (cachedData && isCacheValid(cachedData)) {
    return cachedData.nextPrayer;
  }
  
  try {
    const prayerTimes = await calculatePrayerTimes(location, date, method);
    const prayers = generatePrayersFromTimes(prayerTimes, date, location, []);
    const nextPrayer = findNextPrayer(prayers);
    
    return nextPrayer;
  } catch (error) {
    console.error('Error getting next prayer:', error);
    
    // Fallback to cached data even if expired
    if (cachedData) {
      console.warn('Using expired cached next prayer due to API error');
      return cachedData.nextPrayer;
    }
    
    return null;
  }
}

/**
 * Ensure prayer times are Date objects (fix for Redis string dates)
 */
function ensureDateObjects(prayerTimes: any): PrayerTimes {
  const ensureDate = (value: any): Date => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return new Date(); // fallback
  };

  return {
    fajr: ensureDate(prayerTimes.fajr),
    dhuhr: ensureDate(prayerTimes.dhuhr),
    asr: ensureDate(prayerTimes.asr),
    maghrib: ensureDate(prayerTimes.maghrib),
    isha: ensureDate(prayerTimes.isha),
    sunrise: ensureDate(prayerTimes.sunrise),
    sunset: ensureDate(prayerTimes.sunset)
  };
}

/**
 * Generate prayer objects from prayer times
 */
function generatePrayersFromTimes(
  prayerTimes: PrayerTimes,
  date: Date,
  location: LocationData,
  completedPrayers: string[]
): Prayer[] {
  // Ensure all prayer times are Date objects (fix Redis string issue)
  const safePrayerTimes = ensureDateObjects(prayerTimes);
  
  const now = new Date();
  const dateStr = date.toISOString().split('T')[0];
  
  const prayers: Prayer[] = [
    {
      id: `fajr-${dateStr}`,
      name: 'Fajr',
      time: safePrayerTimes.fajr,
      scheduledTime: safePrayerTimes.fajr.toISOString(),
      completed: completedPrayers.includes(`fajr-${dateStr}`),
      status: getPrayerStatus(safePrayerTimes.fajr, now, completedPrayers.includes(`fajr-${dateStr}`)),
    },
    {
      id: `dhuhr-${dateStr}`,
      name: 'Dhuhr',
      time: safePrayerTimes.dhuhr,
      scheduledTime: safePrayerTimes.dhuhr.toISOString(),
      completed: completedPrayers.includes(`dhuhr-${dateStr}`),
      status: getPrayerStatus(safePrayerTimes.dhuhr, now, completedPrayers.includes(`dhuhr-${dateStr}`)),
    },
    {
      id: `asr-${dateStr}`,
      name: 'Asr',
      time: safePrayerTimes.asr,
      scheduledTime: safePrayerTimes.asr.toISOString(),
      completed: completedPrayers.includes(`asr-${dateStr}`),
      status: getPrayerStatus(safePrayerTimes.asr, now, completedPrayers.includes(`asr-${dateStr}`)),
    },
    {
      id: `maghrib-${dateStr}`,
      name: 'Maghrib',
      time: safePrayerTimes.maghrib,
      scheduledTime: safePrayerTimes.maghrib.toISOString(),
      completed: completedPrayers.includes(`maghrib-${dateStr}`),
      status: getPrayerStatus(safePrayerTimes.maghrib, now, completedPrayers.includes(`maghrib-${dateStr}`)),
    },
    {
      id: `isha-${dateStr}`,
      name: 'Isha',
      time: safePrayerTimes.isha,
      scheduledTime: safePrayerTimes.isha.toISOString(),
      completed: completedPrayers.includes(`isha-${dateStr}`),
      status: getPrayerStatus(safePrayerTimes.isha, now, completedPrayers.includes(`isha-${dateStr}`)),
    },
  ];
  
  // Add time remaining/ago for each prayer
  prayers.forEach(prayer => {
    if (prayer.status === 'completed') {
      prayer.timeAgo = getTimeAgo(prayer.time);
    } else if (prayer.status === 'upcoming') {
      prayer.timeRemaining = getTimeRemaining(prayer.time);
    }
  });
  
  return prayers;
}

/**
 * Find the next prayer from a list of prayers
 */
function findNextPrayer(prayers: Prayer[]): { prayer: PrayerName; time: Date } | null {
  const now = new Date();
  
  // Find the next upcoming prayer
  const nextPrayer = prayers.find(prayer => 
    prayer.time > now && prayer.status !== 'completed'
  );
  
  if (nextPrayer) {
    return {
      prayer: nextPrayer.name,
      time: nextPrayer.time,
    };
  }
  
  // If no prayer today, return first prayer of tomorrow
  return {
    prayer: 'Fajr',
    time: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow's date, will be recalculated
  };
}

/**
 * Generate prayer objects for a specific date with caching
 */
export async function generatePrayersForDate(
  location: LocationData,
  date: Date = new Date(),
  completedPrayers: string[] = [],
  method: CalculationMethodKey = 'MWL'
): Promise<Prayer[]> {
  const cacheKey = generateCacheKey(location, date, method);
  const cachedData = prayerCache.get(cacheKey);
  
  // Return cached data if valid
  if (cachedData && isCacheValid(cachedData)) {
    // Update completion status based on current completedPrayers
    return cachedData.prayers.map(prayer => ({
      ...prayer,
      completed: completedPrayers.includes(prayer.id),
      status: getPrayerStatus(prayer.time, new Date(), completedPrayers.includes(prayer.id)),
    }));
  }
  
  try {
    const prayerTimes = await calculatePrayerTimes(location, date, method);
    const prayers = generatePrayersFromTimes(prayerTimes, date, location, completedPrayers);
    
    return prayers;
  } catch (error) {
    console.error('Error generating prayers for date:', error);
    
    // Fallback to cached data even if expired
    if (cachedData) {
      console.warn('Using expired cached prayers due to API error');
      return cachedData.prayers.map(prayer => ({
        ...prayer,
        completed: completedPrayers.includes(prayer.id),
        status: getPrayerStatus(prayer.time, new Date(), completedPrayers.includes(prayer.id)),
      }));
    }
    
    throw error;
  }
}

/**
 * Determine prayer status based on time and completion
 */
function getPrayerStatus(prayerTime: Date, currentTime: Date, isCompleted: boolean): Prayer['status'] {
  if (isCompleted) return 'completed';
  
  const timeDiff = prayerTime.getTime() - currentTime.getTime();
  const isWithinWindow = Math.abs(timeDiff) <= 30 * 60 * 1000; // 30 minutes window
  
  if (timeDiff > 0) {
    return isWithinWindow ? 'current' : 'upcoming';
  } else {
    return isWithinWindow ? 'current' : 'missed';
  }
}

/**
 * Calculate time remaining until prayer
 */
function getTimeRemaining(prayerTime: Date): string {
  const now = new Date();
  const diff = prayerTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Calculate time ago since prayer
 */
function getTimeAgo(prayerTime: Date): string {
  const now = new Date();
  const diff = now.getTime() - prayerTime.getTime();
  
  if (diff <= 0) return 'Now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ago`;
  } else {
    return `${minutes}m ago`;
  }
}

/**
 * Enhanced location detection with Redis persistence and multiple fallbacks
 */
export async function getCurrentLocation(userId?: string): Promise<LocationData> {
  console.log(`🔍 Getting location for user: ${userId || 'anonymous'}`);
  
  // If we have a userId, check Redis for persisted location first
  if (userId) {
    try {
      const persistedLocation = await locationCache.getUserLocation(userId);
      if (persistedLocation && validateLocation(persistedLocation)) {
        console.log(`📍 Using persisted location for user ${userId}:`, persistedLocation.city);
        return persistedLocation;
      }
    } catch (error) {
      console.warn('Failed to get persisted location from Redis:', error);
    }
  }

  // Try GPS first - but only in browser environment
  if (typeof window !== 'undefined' && navigator?.geolocation) {
    try {
      console.log('🛰️ Attempting GPS location detection...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('GPS timeout'));
        }, 8000); // Shorter timeout

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (error) => {
            clearTimeout(timeoutId);
            reject(error);
          },
          {
            enableHighAccuracy: false, // Faster response
            timeout: 7000,
            maximumAge: 600000, // 10 minutes cache
          }
        );
      });
      
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      
      // Validate GPS coordinates
      if (!validateLocation(coords as LocationData)) {
        throw new Error('Invalid GPS coordinates received');
      }
      
      // Get location details with timeout
      let locationDetails;
      try {
        locationDetails = await Promise.race([
          getLocationDetails(coords.latitude, coords.longitude),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Geocoding timeout')), 5000)
          )
        ]) as { city: string; country: string; timezone?: string };
      } catch (geocodingError) {
        console.warn('Geocoding failed, using coordinates only:', geocodingError);
        locationDetails = {
          city: `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
          country: 'Unknown'
        };
      }
      
      const locationData: LocationData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        city: locationDetails.city,
        country: locationDetails.country,
        timezone: locationDetails.timezone,
        accuracy: position.coords.accuracy,
        source: 'gps',
      };

      // Cache this location for the user if we have userId
      if (userId) {
        try {
          await locationCache.setUserLocation(userId, locationData);
          await locationCache.addToLocationHistory(userId, locationData);
          console.log(`💾 Cached GPS location for user ${userId}: ${locationData.city}`);
        } catch (cacheError) {
          console.warn('Failed to cache GPS location:', cacheError);
        }
      }
      
      console.log(`✅ GPS location successful: ${locationData.city}, ${locationData.country}`);
      return locationData;
    } catch (gpsError) {
      console.warn('GPS location failed:', gpsError instanceof Error ? gpsError.message : 'Unknown error');
    }
  } else {
    console.log('📱 GPS not available (server-side or no geolocation API)');
  }
  
  // Fallback to IP geolocation
  try {
    console.log('🌐 Attempting IP-based location detection...');
    const ipLocation = await getLocationFromIP();
    
    if (!validateLocation(ipLocation)) {
      throw new Error('Invalid IP location data received');
    }
    
    // Cache IP location for the user if we have userId
    if (userId) {
      try {
        await locationCache.setUserLocation(userId, ipLocation);
        await locationCache.addToLocationHistory(userId, ipLocation);
        console.log(`💾 Cached IP location for user ${userId}: ${ipLocation.city}`);
      } catch (cacheError) {
        console.warn('Failed to cache IP location:', cacheError);
      }
    }
    
    console.log(`✅ IP location successful: ${ipLocation.city}, ${ipLocation.country}`);
    return ipLocation;
  } catch (ipError) {
    console.error('IP location failed:', ipError instanceof Error ? ipError.message : 'Unknown error');
  }
  
  // Return default location (Mecca) as last resort
  console.warn('🕋 All location methods failed, using default location (Mecca)');
  const defaultLocation: LocationData = {
    latitude: 21.4225,
    longitude: 39.8262,
    city: 'Mecca',
    country: 'Saudi Arabia',
    accuracy: undefined,
    source: 'manual',
  };

  // Cache default location for the user if we have userId
  if (userId) {
    try {
      await locationCache.setUserLocation(userId, defaultLocation);
      console.log(`💾 Cached default location for user ${userId}: ${defaultLocation.city}`);
    } catch (cacheError) {
      console.warn('Failed to cache default location:', cacheError);
    }
  }

  return defaultLocation;
}

/**
 * Get location details from coordinates using reverse geocoding
 */
async function getLocationDetails(lat: number, lng: number): Promise<{
  city: string;
  country: string;
  timezone?: string;
}> {
  try {
    // Try BigDataCloud first (free, no API key required)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    
    if (response.ok) {
      const data = await response.json();
      return {
        city: data.city || data.locality || 'Current Location',
        country: data.countryName || 'Unknown',
        timezone: data.timezone?.ianaName,
      };
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
  }
  
  // Fallback to simple location names
  return {
    city: 'Current Location',
    country: 'Unknown',
  };
}

/**
 * Enhanced IP geolocation with multiple providers
 */
export async function getLocationFromIP(): Promise<LocationData> {
  const providers = [
    {
      name: 'ipapi.co',
      url: 'https://ipapi.co/json/',
      parser: (data: any) => ({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country_name,
        timezone: data.timezone,
      }),
    },
    {
      name: 'ip-api.com',
      url: 'http://ip-api.com/json/',
      parser: (data: any) => ({
        latitude: data.lat,
        longitude: data.lon,
        city: data.city,
        country: data.country,
        timezone: data.timezone,
      }),
    },
  ];
  
  for (const provider of providers) {
    try {
      const response = await fetch(provider.url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'API error');
      }
      
      const location = provider.parser(data);
      
      return {
        ...location,
        source: 'ip',
      };
    } catch (error) {
      console.warn(`${provider.name} failed:`, error);
    }
  }
  
  throw new Error('All IP geolocation providers failed');
}

/**
 * Calculate Qibla direction using AlAdhan API
 */
export async function calculateQiblaDirection(location: LocationData): Promise<number> {
  try {
    const response = await fetch(
      `${ALADHAN_BASE_URL}/qibla/${location.latitude}/${location.longitude}`
    );
    
    if (!response.ok) {
      throw new Error(`Qibla API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(`Qibla API returned error: ${data.status}`);
    }
    
    return data.data.direction;
  } catch (error) {
    console.error('Error calculating Qibla direction:', error);
    
    // Fallback calculation (simple great circle bearing to Mecca)
    const mecca = { lat: 21.4225, lng: 39.8262 };
    const userLat = location.latitude * Math.PI / 180;
    const userLng = location.longitude * Math.PI / 180;
    const meccaLat = mecca.lat * Math.PI / 180;
    const meccaLng = mecca.lng * Math.PI / 180;
    
    const deltaLng = meccaLng - userLng;
    const y = Math.sin(deltaLng) * Math.cos(meccaLat);
    const x = Math.cos(userLat) * Math.sin(meccaLat) - Math.sin(userLat) * Math.cos(meccaLat) * Math.cos(deltaLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return bearing;
  }
}

/**
 * Format prayer time for display
 */
export function formatPrayerTime(time: Date, format: '12h' | '24h' = '12h'): string {
  if (format === '24h') {
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  } else {
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  }
}

/**
 * Clear prayer cache (useful for testing or manual refresh)
 */
export function clearPrayerCache(): void {
  prayerCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  const entries = Array.from(prayerCache.entries());
  const timestamps = entries.map(([_, data]) => data.timestamp);
  
  return {
    size: prayerCache.size,
    keys: Array.from(prayerCache.keys()),
    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
  };
}

/**
 * Manually set user location and persist it
 */
export async function setUserLocation(userId: string, locationData: LocationData): Promise<void> {
  try {
    await locationCache.setUserLocation(userId, {
      ...locationData,
      source: 'manual',
      timestamp: Date.now()
    });
    await locationCache.addToLocationHistory(userId, locationData);
    console.log(`✅ Manually set location for user ${userId}: ${locationData.city}`);
  } catch (error) {
    console.error('Error setting user location:', error);
    throw error;
  }
}

/**
 * Get user's location history
 */
export async function getUserLocationHistory(userId: string): Promise<Array<{location: LocationData, timestamp: number}>> {
  try {
    return await locationCache.getLocationHistory(userId);
  } catch (error) {
    console.error('Error getting user location history:', error);
    return [];
  }
}

/**
 * Clear user's persisted location (force re-detection)
 */
export async function clearUserLocation(userId: string): Promise<void> {
  try {
    const key = `user_location:${userId}`;
    // Since we don't have direct Redis access here, we'll set an expired location
    await locationCache.setUserLocation(userId, {
      latitude: 0,
      longitude: 0,
      city: 'EXPIRED',
      country: 'EXPIRED',
      source: 'manual',
      timestamp: 0 // This will be considered expired
    });
    console.log(`🗑️ Cleared persisted location for user ${userId}`);
  } catch (error) {
    console.error('Error clearing user location:', error);
    throw error;
  }
} 