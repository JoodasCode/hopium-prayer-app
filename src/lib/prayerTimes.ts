import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Qibla } from 'adhan';
import type { PrayerTimes, LocationData, Prayer, PrayerName } from '@/types';

/**
 * Calculate prayer times for a given location and date
 */
export function calculatePrayerTimes(
  location: LocationData,
  date: Date = new Date()
): PrayerTimes {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = CalculationMethod.MuslimWorldLeague();
  
  const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);
  
  return {
    fajr: prayerTimes.fajr,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    sunrise: prayerTimes.sunrise,
    sunset: prayerTimes.sunset,
  };
}

/**
 * Get the next prayer and its time
 */
export function getNextPrayer(
  location: LocationData,
  date: Date = new Date()
): { prayer: PrayerName; time: Date } | null {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = CalculationMethod.MuslimWorldLeague();
  
  const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);
  const nextPrayer = prayerTimes.nextPrayer(date);
  
  if (!nextPrayer) {
    // If no prayer today, get first prayer of next day
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPrayers = new AdhanPrayerTimes(coordinates, tomorrow, params);
    
    return {
      prayer: 'Fajr',
      time: tomorrowPrayers.fajr,
    };
  }
  
  // Map prayer to name
  const prayerName = getPrayerName(nextPrayer);
  const prayerTime = prayerTimes.timeForPrayer(nextPrayer);
  
  if (!prayerTime) return null;
  
  return {
    prayer: prayerName,
    time: prayerTime,
  };
}

/**
 * Calculate Qibla direction for a given location
 */
export function calculateQiblaDirection(location: LocationData): number {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const qibla = new (Qibla as any)(coordinates);
  return qibla.direction;
}

/**
 * Generate prayer objects for a specific date
 */
export function generatePrayersForDate(
  location: LocationData,
  date: Date = new Date(),
  completedPrayers: string[] = []
): Prayer[] {
  const prayerTimes = calculatePrayerTimes(location, date);
  const now = new Date();
  
  const prayers: Prayer[] = [
    {
      id: `fajr-${date.toISOString().split('T')[0]}`,
      name: 'Fajr',
      time: prayerTimes.fajr,
      scheduledTime: prayerTimes.fajr.toISOString(),
      completed: completedPrayers.includes(`fajr-${date.toISOString().split('T')[0]}`),
      status: getPrayerStatus(prayerTimes.fajr, now, completedPrayers.includes(`fajr-${date.toISOString().split('T')[0]}`)),
    },
    {
      id: `dhuhr-${date.toISOString().split('T')[0]}`,
      name: 'Dhuhr',
      time: prayerTimes.dhuhr,
      scheduledTime: prayerTimes.dhuhr.toISOString(),
      completed: completedPrayers.includes(`dhuhr-${date.toISOString().split('T')[0]}`),
      status: getPrayerStatus(prayerTimes.dhuhr, now, completedPrayers.includes(`dhuhr-${date.toISOString().split('T')[0]}`)),
    },
    {
      id: `asr-${date.toISOString().split('T')[0]}`,
      name: 'Asr',
      time: prayerTimes.asr,
      scheduledTime: prayerTimes.asr.toISOString(),
      completed: completedPrayers.includes(`asr-${date.toISOString().split('T')[0]}`),
      status: getPrayerStatus(prayerTimes.asr, now, completedPrayers.includes(`asr-${date.toISOString().split('T')[0]}`)),
    },
    {
      id: `maghrib-${date.toISOString().split('T')[0]}`,
      name: 'Maghrib',
      time: prayerTimes.maghrib,
      scheduledTime: prayerTimes.maghrib.toISOString(),
      completed: completedPrayers.includes(`maghrib-${date.toISOString().split('T')[0]}`),
      status: getPrayerStatus(prayerTimes.maghrib, now, completedPrayers.includes(`maghrib-${date.toISOString().split('T')[0]}`)),
    },
    {
      id: `isha-${date.toISOString().split('T')[0]}`,
      name: 'Isha',
      time: prayerTimes.isha,
      scheduledTime: prayerTimes.isha.toISOString(),
      completed: completedPrayers.includes(`isha-${date.toISOString().split('T')[0]}`),
      status: getPrayerStatus(prayerTimes.isha, now, completedPrayers.includes(`isha-${date.toISOString().split('T')[0]}`)),
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
 * Map Adhan prayer enum to our prayer name
 */
function getPrayerName(prayer: any): PrayerName {
  switch (prayer) {
    case 'fajr':
      return 'Fajr';
    case 'dhuhr':
      return 'Dhuhr';
    case 'asr':
      return 'Asr';
    case 'maghrib':
      return 'Maghrib';
    case 'isha':
      return 'Isha';
    default:
      return 'Fajr';
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
 * Get user's location using browser geolocation API
 */
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise(async (resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Get coordinates
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Try to get city/country using reverse geocoding
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            resolve({
              latitude: coords.latitude,
              longitude: coords.longitude,
              city: data.city || data.locality || 'Current Location',
              country: data.countryName || 'Unknown'
            });
          } catch (geocodeError) {
            // If reverse geocoding fails, still return coordinates
            resolve({
              latitude: coords.latitude,
              longitude: coords.longitude,
              city: 'Current Location',
              country: 'Unknown'
            });
          }
        } catch (error) {
          reject(new Error(`Location processing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // Increased timeout for better accuracy
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Get location from IP address (fallback)
 */
export async function getLocationFromIP(): Promise<LocationData> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || 'Failed to get location from IP');
    }
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      country: data.country_name,
      timezone: data.timezone,
    };
  } catch (error) {
    throw new Error(`IP geolocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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