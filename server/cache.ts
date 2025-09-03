// Simple in-memory cache with TTL
class CacheManager {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  set(key: string, value: any, ttlSeconds: number = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

export const cache = new CacheManager();

// Run cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Crypto rates caching with fallback
export class CryptoRateCache {
  private static readonly CACHE_KEY = 'crypto_rates';
  private static readonly FALLBACK_KEY = 'crypto_rates_fallback';
  private static readonly CACHE_TTL = 30; // 30 seconds
  private static readonly FALLBACK_TTL = 3600; // 1 hour

  static setCurrent(rates: any): void {
    cache.set(this.CACHE_KEY, rates, this.CACHE_TTL);
    // Also update fallback with longer TTL
    cache.set(this.FALLBACK_KEY, rates, this.FALLBACK_TTL);
  }

  static getCurrent(): any | null {
    return cache.get(this.CACHE_KEY);
  }

  static getFallback(): any | null {
    return cache.get(this.FALLBACK_KEY);
  }

  static clear(): void {
    cache.delete(this.CACHE_KEY);
    cache.delete(this.FALLBACK_KEY);
  }
}