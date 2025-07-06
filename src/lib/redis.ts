import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: 'https://whole-caiman-42557.upstash.io',
  token: 'AaY9AAIjcDE4YTQ4NDFlYjU3NmI0OWViOGE0YTkwZDBlZTJkZTlhOHAxMA',
});

// Cache duration constants (in seconds)
export const CACHE_DURATIONS = {
  PRAYER_TIMES: 86400, // 24 hours
  LOCATION_DATA: 604800, // 7 days
  USER_PREFERENCES: 86400, // 24 hours
  STREAK_DATA: 3600, // 1 hour
  LEADERBOARD: 300, // 5 minutes
} as const;

// Date revival function for JSON parsing
function reviveDates(key: string, value: any): any {
  // Check if the value is a string that looks like an ISO date
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

// Convert date strings to Date objects in an object (for Upstash auto-parsed JSON)
function convertDatesInObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const converted = { ...obj };
  for (const [key, value] of Object.entries(converted)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      converted[key] = new Date(value);
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = convertDatesInObject(value);
    }
  }
  return converted;
}

// Prayer Times Caching
export const prayerTimesCache = {
  async get(locationHash: string, date: string, method: string) {
    const key = `prayer_times:${locationHash}:${date}:${method}`;
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      
      // Handle different response types from Redis
      if (typeof cached === 'string') {
        // Manual JSON parsing with date revival
        return JSON.parse(cached, reviveDates);
      } else if (typeof cached === 'object') {
        // Upstash auto-parsed - convert date strings to Date objects
        return convertDatesInObject(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  async set(locationHash: string, date: string, method: string, data: any) {
    const key = `prayer_times:${locationHash}:${date}:${method}`;
    try {
      await redis.setex(key, CACHE_DURATIONS.PRAYER_TIMES, JSON.stringify(data));
      console.log(`✅ Cached prayer times for ${locationHash} on ${date}`);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  },

  async invalidate(locationHash: string, date: string) {
    const pattern = `prayer_times:${locationHash}:${date}:*`;
    try {
      // Note: Upstash Redis doesn't support SCAN, so we'll use a different approach
      // We'll just let the cache expire naturally for now
      console.log(`Cache invalidation requested for ${pattern}`);
    } catch (error) {
      console.error('Redis invalidate error:', error);
    }
  }
};

// Location Persistence
export const locationCache = {
  async getUserLocation(userId: string) {
    const key = `user_location:${userId}`;
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      
      // Handle different response types from Redis
      if (typeof cached === 'string') {
        // Manual JSON parsing with date revival
        return JSON.parse(cached, reviveDates);
      } else if (typeof cached === 'object') {
        // Upstash auto-parsed - convert date strings to Date objects
        return convertDatesInObject(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Redis get user location error:', error);
      return null;
    }
  },

  async setUserLocation(userId: string, locationData: any) {
    const key = `user_location:${userId}`;
    try {
      await redis.setex(key, CACHE_DURATIONS.LOCATION_DATA, JSON.stringify({
        ...locationData,
        lastUpdated: new Date().toISOString(),
        source: 'user_set'
      }));
      console.log(`✅ Cached user location for ${userId}`);
    } catch (error) {
      console.error('Redis set user location error:', error);
    }
  },

  async addToLocationHistory(userId: string, locationData: any) {
    const key = `user_locations_history:${userId}`;
    try {
      const timestamp = Date.now();
      await redis.zadd(key, { score: timestamp, member: JSON.stringify(locationData) });
      // Keep only last 10 locations
      await redis.zremrangebyrank(key, 0, -11);
      await redis.expire(key, CACHE_DURATIONS.LOCATION_DATA);
    } catch (error) {
      console.error('Redis location history error:', error);
    }
  },

  async getLocationHistory(userId: string) {
    const key = `user_locations_history:${userId}`;
    try {
      const history = await redis.zrange(key, 0, 9, { rev: true, withScores: true });
      return history.map((item: any) => ({
        location: JSON.parse(item.member as string),
        timestamp: item.score
      }));
    } catch (error) {
      console.error('Redis get location history error:', error);
      return [];
    }
  }
};

// Streak Protection
export const streakCache = {
  async getStreakData(userId: string) {
    const key = `streak:${userId}`;
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.error('Redis get streak error:', error);
      return null;
    }
  },

  async updateStreakData(userId: string, streakData: any) {
    const key = `streak:${userId}`;
    try {
      await redis.setex(key, CACHE_DURATIONS.STREAK_DATA, JSON.stringify({
        ...streakData,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Redis update streak error:', error);
    }
  }
};

// Performance Analytics
export const performanceCache = {
  async recordCacheHit(type: string) {
    const key = `cache_hits:${type}:${new Date().toISOString().split('T')[0]}`;
    try {
      await redis.incr(key);
      await redis.expire(key, 86400); // 24 hours
    } catch (error) {
      console.error('Redis record cache hit error:', error);
    }
  },

  async recordCacheMiss(type: string) {
    const key = `cache_misses:${type}:${new Date().toISOString().split('T')[0]}`;
    try {
      await redis.incr(key);
      await redis.expire(key, 86400); // 24 hours
    } catch (error) {
      console.error('Redis record cache miss error:', error);
    }
  },

  async getCacheStats(type: string) {
    const date = new Date().toISOString().split('T')[0];
    const hitsKey = `cache_hits:${type}:${date}`;
    const missesKey = `cache_misses:${type}:${date}`;
    
    try {
      const [hits, misses] = await Promise.all([
        redis.get(hitsKey),
        redis.get(missesKey)
      ]);
      
      const hitCount = hits ? parseInt(hits as string) : 0;
      const missCount = misses ? parseInt(misses as string) : 0;
      const total = hitCount + missCount;
      const hitRate = total > 0 ? (hitCount / total) * 100 : 0;
      
      return { hits: hitCount, misses: missCount, hitRate };
    } catch (error) {
      console.error('Redis get cache stats error:', error);
      return { hits: 0, misses: 0, hitRate: 0 };
    }
  }
};

// Utility function to create location hash
export function createLocationHash(lat: number, lng: number): string {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

// Health check
export async function testRedisConnection(): Promise<boolean> {
  try {
    const result = await redis.ping();
    console.log('✅ Redis connection test:', result);
    return result === 'PONG';
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

export default redis; 