import { useState, useEffect, useCallback } from 'react';
import { performanceCache } from '../lib/redis';

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  lastUpdated: number;
}

export interface PerformanceMetrics {
  prayerTimes: CacheStats;
  location: CacheStats;
  streak: CacheStats;
  overall: CacheStats;
}

export function useRedisPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load performance metrics
  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [prayerTimes, location, streak] = await Promise.all([
        performanceCache.getCacheStats('prayer_times'),
        performanceCache.getCacheStats('location'),
        performanceCache.getCacheStats('streak')
      ]);

      const totalHits = prayerTimes.hits + location.hits + streak.hits;
      const totalMisses = prayerTimes.misses + location.misses + streak.misses;
      const overallHitRate = totalHits + totalMisses > 0 
        ? (totalHits / (totalHits + totalMisses)) * 100 
        : 0;

      const performanceMetrics: PerformanceMetrics = {
        prayerTimes: { ...prayerTimes, lastUpdated: Date.now() },
        location: { ...location, lastUpdated: Date.now() },
        streak: { ...streak, lastUpdated: Date.now() },
        overall: {
          hits: totalHits,
          misses: totalMisses,
          hitRate: overallHitRate,
          lastUpdated: Date.now()
        }
      };

      setMetrics(performanceMetrics);
    } catch (err) {
      console.error('Failed to load Redis performance metrics:', err);
      setError('Failed to load performance metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Record cache hit
  const recordCacheHit = useCallback(async (type: 'prayer_times' | 'location' | 'streak') => {
    try {
      await performanceCache.recordCacheHit(type);
    } catch (err) {
      console.error('Failed to record cache hit:', err);
    }
  }, []);

  // Record cache miss
  const recordCacheMiss = useCallback(async (type: 'prayer_times' | 'location' | 'streak') => {
    try {
      await performanceCache.recordCacheMiss(type);
    } catch (err) {
      console.error('Failed to record cache miss:', err);
    }
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    if (!metrics) return null;

    const { overall } = metrics;
    const total = overall.hits + overall.misses;
    
    return {
      totalRequests: total,
      cacheHits: overall.hits,
      cacheMisses: overall.misses,
      hitRate: overall.hitRate,
      status: overall.hitRate > 80 ? 'excellent' : 
              overall.hitRate > 60 ? 'good' : 
              overall.hitRate > 40 ? 'fair' : 'poor',
      recommendations: getRecommendations(overall.hitRate)
    };
  }, [metrics]);

  // Get performance recommendations
  const getRecommendations = (hitRate: number): string[] => {
    const recommendations: string[] = [];
    
    if (hitRate < 40) {
      recommendations.push('Consider increasing cache duration for frequently accessed data');
      recommendations.push('Check if location data is being invalidated too frequently');
    }
    
    if (hitRate < 60) {
      recommendations.push('Review prayer time calculation frequency');
      recommendations.push('Optimize location-based caching strategy');
    }
    
    if (hitRate < 80) {
      recommendations.push('Fine-tune cache expiration times');
      recommendations.push('Consider pre-warming cache for common locations');
    }
    
    if (hitRate >= 80) {
      recommendations.push('Cache performance is excellent');
      recommendations.push('Consider expanding caching to additional data types');
    }
    
    return recommendations;
  };

  // Load metrics on mount and set up refresh interval
  useEffect(() => {
    loadMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadMetrics]);

  return {
    metrics,
    isLoading,
    error,
    loadMetrics,
    recordCacheHit,
    recordCacheMiss,
    getPerformanceSummary,
    refresh: loadMetrics
  };
} 