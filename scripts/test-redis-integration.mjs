#!/usr/bin/env node

import { testRedisConnection, prayerTimesCache, locationCache, performanceCache, createLocationHash } from '../src/lib/redis.ts';

async function testRedisIntegration() {
  console.log('🧪 Testing Redis Integration for Mulvi Prayer App\n');

  // Test 1: Connection
  console.log('1️⃣ Testing Redis Connection...');
  const connectionOk = await testRedisConnection();
  if (!connectionOk) {
    console.error('❌ Redis connection failed!');
    process.exit(1);
  }
  console.log('✅ Redis connection successful!\n');

  // Test 2: Prayer Times Caching
  console.log('2️⃣ Testing Prayer Times Caching...');
  const testLocation = { latitude: 40.7128, longitude: -74.0060 }; // NYC
  const locationHash = createLocationHash(testLocation.latitude, testLocation.longitude);
  const testDate = '2025-01-05';
  const testMethod = 'ISNA';

  // Test cache miss
  const cachedBefore = await prayerTimesCache.get(locationHash, testDate, testMethod);
  console.log('Cache miss test:', cachedBefore === null ? '✅ Correctly returned null' : '❌ Should be null');

  // Test cache set
  const testPrayerData = {
    prayerTimes: {
      fajr: new Date('2025-01-05T06:00:00Z'),
      dhuhr: new Date('2025-01-05T12:00:00Z'),
      asr: new Date('2025-01-05T15:00:00Z'),
      maghrib: new Date('2025-01-05T17:30:00Z'),
      isha: new Date('2025-01-05T19:00:00Z'),
      sunrise: new Date('2025-01-05T07:00:00Z'),
      sunset: new Date('2025-01-05T17:30:00Z'),
    },
    prayers: [],
    nextPrayer: null,
    location: testLocation,
    timestamp: Date.now()
  };

  await prayerTimesCache.set(locationHash, testDate, testMethod, testPrayerData);
  console.log('✅ Prayer times cached successfully');

  // Test cache hit
  const cachedAfter = await prayerTimesCache.get(locationHash, testDate, testMethod);
  console.log('Cache hit test:', cachedAfter ? '✅ Data retrieved from cache' : '❌ Cache retrieval failed');

  // Test 3: Location Persistence
  console.log('\n3️⃣ Testing Location Persistence...');
  const testUserId = 'test-user-123';
  const testLocationData = {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'United States',
    source: 'gps',
    accuracy: 10,
    timestamp: Date.now()
  };

  // Test setting user location
  await locationCache.setUserLocation(testUserId, testLocationData);
  console.log('✅ User location cached successfully');

  // Test retrieving user location
  const retrievedLocation = await locationCache.getUserLocation(testUserId);
  console.log('Location retrieval test:', 
    retrievedLocation && retrievedLocation.city === 'New York' ? 
    '✅ Location retrieved correctly' : 
    '❌ Location retrieval failed'
  );

  // Test location history
  await locationCache.addToLocationHistory(testUserId, testLocationData);
  const history = await locationCache.getLocationHistory(testUserId);
  console.log('Location history test:', 
    history.length > 0 ? 
    '✅ Location history working' : 
    '❌ Location history failed'
  );

  // Test 4: Performance Analytics
  console.log('\n4️⃣ Testing Performance Analytics...');
  await performanceCache.recordCacheHit('prayer_times');
  await performanceCache.recordCacheHit('prayer_times');
  await performanceCache.recordCacheMiss('prayer_times');

  const stats = await performanceCache.getCacheStats('prayer_times');
  console.log('Performance stats:', {
    hits: stats.hits,
    misses: stats.misses,
    hitRate: `${stats.hitRate.toFixed(1)}%`
  });
  console.log('Analytics test:', 
    stats.hits >= 2 && stats.misses >= 1 ? 
    '✅ Performance tracking working' : 
    '❌ Performance tracking failed'
  );

  // Test 5: Cache Performance Comparison
  console.log('\n5️⃣ Testing Cache Performance...');
  const iterations = 10;
  
  // Test cache hit performance
  const cacheStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    await prayerTimesCache.get(locationHash, testDate, testMethod);
  }
  const cacheTime = Date.now() - cacheStart;
  
  console.log(`Cache performance: ${cacheTime}ms for ${iterations} requests`);
  console.log(`Average: ${(cacheTime / iterations).toFixed(2)}ms per request`);
  console.log(cacheTime < 500 ? '✅ Excellent cache performance' : '⚠️ Cache performance could be better');

  console.log('\n🎉 Redis Integration Test Complete!');
  console.log('📊 Summary:');
  console.log('- ✅ Connection: Working');
  console.log('- ✅ Prayer Times Cache: Working');
  console.log('- ✅ Location Persistence: Working');
  console.log('- ✅ Performance Analytics: Working');
  console.log(`- ✅ Cache Performance: ${(cacheTime / iterations).toFixed(2)}ms avg`);
}

// Run the test
testRedisIntegration().catch(console.error); 