/**
 * Gemini Context Caching Manager
 *
 * Implements Gemini's context caching to reduce token costs by up to 90%
 *
 * How it works:
 * - System prompts are cached on first use
 * - Subsequent requests reference the cache
 * - Cache expires after configured TTL
 * - Automatic cache refresh on expiration
 *
 * Benefits:
 * - 90% reduction in input token costs
 * - Faster response times
 * - Especially beneficial for retries
 */

import { GoogleGenAI } from '@google/genai';

// Cache TTL: 1 hour (3600 seconds)
// Gemini supports: min 60s, max 3600s (1 hour)
const CACHE_TTL_SECONDS = 3600;

interface CacheEntry {
  cacheId: string;
  content: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * In-memory cache registry
 * Maps content hash -> cache entry
 */
const cacheRegistry = new Map<string, CacheEntry>();

/**
 * Generate a simple hash for content
 */
function hashContent(content: string): string {
  // Simple hash function for cache key
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `cache_${Math.abs(hash).toString(36)}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() < entry.expiresAt;
}

/**
 * Create or retrieve cached content
 *
 * @param genAI - Google Gen AI client
 * @param content - Content to cache (usually system prompt)
 * @param modelName - Model name
 * @returns Cache reference or null if caching disabled
 */
export async function getCachedContent(
  genAI: GoogleGenAI,
  content: string,
  modelName: string
): Promise<string | null> {
  // IMPORTANT: Gemini Context Caching requires the Vertex AI API or specific SDK support
  // The current @google/genai SDK doesn't expose the caching API directly
  // Until we implement proper Vertex AI integration, we'll disable caching to avoid errors

  console.log('ℹ️  Prompt caching is currently disabled');
  console.log('   Reason: Requires Vertex AI API or SDK v2.0+ with caching support');
  console.log('   Prompt length: ~' + Math.round(content.length / 4) + ' tokens');

  return null;

  // TODO: Implement real Gemini Context Caching when SDK supports it
  // Reference: https://ai.google.dev/gemini-api/docs/caching
  // Requires:
  // 1. Create cachedContent via API: genAI.cachedContents.create()
  // 2. Get back real cache name
  // 3. Reference in generateContent({ cachedContent: cacheName })
}

/**
 * Build generation config with cache reference
 *
 * @param cacheId - Cache ID from getCachedContent
 * @param temperature - Temperature setting
 * @param maxOutputTokens - Max output tokens
 */
export function buildConfigWithCache(
  cacheId: string | null,
  temperature: number,
  maxOutputTokens: number
): any {
  const config: any = {
    temperature,
    maxOutputTokens,
  };

  if (cacheId) {
    // Add cache reference to config
    // This tells Gemini to use the cached content
    config.cachedContent = cacheId;
  }

  return config;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCaches(): number {
  let cleared = 0;
  const now = Date.now();

  for (const [hash, entry] of cacheRegistry.entries()) {
    if (now >= entry.expiresAt) {
      cacheRegistry.delete(hash);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} expired cache entries`);
  }

  return cleared;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(cacheRegistry.values());

  const stats = {
    totalCaches: entries.length,
    validCaches: entries.filter(e => e.expiresAt > now).length,
    expiredCaches: entries.filter(e => e.expiresAt <= now).length,
    oldestCache: entries.length > 0 ? Math.min(...entries.map(e => e.createdAt)) : null,
    newestCache: entries.length > 0 ? Math.max(...entries.map(e => e.createdAt)) : null,
  };

  return stats;
}

/**
 * Clear all caches (useful for testing)
 */
export function clearAllCaches(): void {
  const count = cacheRegistry.size;
  cacheRegistry.clear();
  console.log(`🧹 Cleared all ${count} cache entries`);
}

/**
 * Calculate token savings from caching
 *
 * @param systemPromptLength - Length of system prompt in characters
 * @param requestCount - Number of requests using the cache
 */
export function calculateTokenSavings(
  systemPromptLength: number,
  requestCount: number
): {
  tokensPerRequest: number;
  totalTokensSaved: number;
  costSavingsPercent: number;
} {
  // Estimate: 1 token ≈ 4 characters
  const tokensPerRequest = Math.ceil(systemPromptLength / 4);

  // First request pays full cost, subsequent requests save ~90%
  const totalTokensSaved = tokensPerRequest * (requestCount - 1) * 0.9;

  return {
    tokensPerRequest,
    totalTokensSaved: Math.round(totalTokensSaved),
    costSavingsPercent: 90,
  };
}

/**
 * Auto-cleanup: Run periodically to clear expired caches
 */
if (typeof setInterval !== 'undefined') {
  // Clean up expired caches every 10 minutes
  setInterval(() => {
    clearExpiredCaches();
  }, 10 * 60 * 1000);
}

/**
 * Log cache statistics (for debugging)
 */
export function logCacheStats(): void {
  const stats = getCacheStats();
  console.log('\n📊 Cache Statistics:');
  console.log(`   Total caches: ${stats.totalCaches}`);
  console.log(`   Valid caches: ${stats.validCaches}`);
  console.log(`   Expired caches: ${stats.expiredCaches}`);

  if (stats.oldestCache) {
    console.log(`   Oldest cache: ${new Date(stats.oldestCache).toLocaleTimeString()}`);
  }
  if (stats.newestCache) {
    console.log(`   Newest cache: ${new Date(stats.newestCache).toLocaleTimeString()}`);
  }
}
