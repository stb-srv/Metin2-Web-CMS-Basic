/**
 * Simple In-Memory Caching Utility (Singleton)
 * Used to store non-sensitive frequently accessed data (settings, navigation, etc.)
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Time To Live (optional)
    }

    /**
     * Set a value in cache
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttlSeconds - Default 0 (forever until manually cleared)
     */
    set(key, value, ttlSeconds = 0) {
        this.cache.set(key, value);
        if (ttlSeconds > 0) {
            this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
        }
    }

    /**
     * Get a value from cache
     * @param {string} key 
     * @returns {any|null}
     */
    get(key) {
        if (!this.cache.has(key)) return null;

        // Check TTL
        if (this.ttl.has(key)) {
            if (Date.now() > this.ttl.get(key)) {
                this.invalidate(key);
                return null;
            }
        }

        return this.cache.get(key);
    }

    /**
     * Clear a specific key
     * @param {string} key 
     */
    invalidate(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
    }

    /**
     * Clear all cache
     */
    clearAll() {
        this.cache.clear();
        this.ttl.clear();
    }
}

module.exports = new CacheManager();
