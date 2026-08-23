/**
 * Stale-While-Revalidate Caching Utility for My Academia Web
 */

const CACHE_PREFIX = 'my_academia_cache_';
const DEFAULT_TTL = 1000 * 60 * 15; // 15 minutes

export const getCache = (key) => {
  try {
    const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!item) return null;
    const parsed = JSON.parse(item);
    return parsed.data;
  } catch (e) {
    console.warn(`[Cache] Error reading cache for ${key}`, e);
    return null;
  }
};

export const setCache = (key, data, ttl = DEFAULT_TTL) => {
  try {
    const item = {
      data,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch (e) {
    console.warn(`[Cache] Error saving cache for ${key}`, e);
  }
};

export const clearCache = (key) => {
  try {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    }
  } catch (e) {
    console.warn('[Cache] Error clearing cache', e);
  }
};

/**
 * Fetch with Stale-While-Revalidate Strategy
 * 1. Calls onCachedData callback instantly if cache exists.
 * 2. Fetches fresh data over network in background and updates cache.
 */
export const fetchWithCache = async (url, options = {}, { cacheKey, onCachedData, ttl = DEFAULT_TTL } = {}) => {
  const key = cacheKey || url;
  
  // 1. Instant cache hit
  const cached = getCache(key);
  if (cached && typeof onCachedData === 'function') {
    onCachedData(cached);
  }

  // 2. Network Fetch in background / foreground
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const freshData = await response.json();
    
    // Save to cache
    setCache(key, freshData, ttl);
    return freshData;
  } catch (err) {
    // If offline or network error, return cached data if available
    if (cached) {
      console.warn(`[Cache] Network failed for ${url}, falling back to cache`);
      return cached;
    }
    throw err;
  }
};
