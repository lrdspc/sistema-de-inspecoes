import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CacheDB extends DBSchema {
  'cache-store': {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
}

const CACHE_DB_NAME = 'app-cache';
const CACHE_STORE_NAME = 'cache-store';
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CacheDB>> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<CacheDB>(CACHE_DB_NAME, VERSION, {
      upgrade(db) {
        db.createObjectStore(CACHE_STORE_NAME);
      },
    });
  }
  return dbPromise;
};

const API_CACHE_CONFIG = {
  defaultTTL: 60 * 60 * 1000, // 1 hour
  maxEntries: 100,
  versionKey: 'cache_version',
  version: '1.0',
  statsKey: 'cache_stats',
};

// Track cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  lastCleared: number;
}

function updateCacheStats(hit: boolean): void {
  try {
    const stats = JSON.parse(
      localStorage.getItem(API_CACHE_CONFIG.statsKey) || '{"hits":0,"misses":0}'
    );
    if (hit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
    localStorage.setItem(API_CACHE_CONFIG.statsKey, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to update cache stats:', error);
  }
}

export const cacheData = async (
  key: string,
  data: any,
  ttl: number = API_CACHE_CONFIG.defaultTTL
) => {
  const db = await getDB();
  const timestamp = Date.now();
  const expiresAt = timestamp + ttl;

  // Verificar versão do cache
  const cacheVersion = await db.get('meta', API_CACHE_CONFIG.versionKey);
  if (cacheVersion !== API_CACHE_CONFIG.version) {
    await clearCache();
    await db.put('meta', API_CACHE_CONFIG.version, API_CACHE_CONFIG.versionKey);
  }

  // Limitar número de entradas
  const entries = await db.getAllKeys(CACHE_STORE_NAME);
  if (entries.length >= API_CACHE_CONFIG.maxEntries) {
    const oldestKey = entries[0];
    await db.delete(CACHE_STORE_NAME, oldestKey);
  }

  await db.put(
    CACHE_STORE_NAME,
    {
      data,
      timestamp,
      expiresAt,
      version: API_CACHE_CONFIG.version,
    },
    key
  );
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  const db = await getDB();
  const cached = await db.get(CACHE_STORE_NAME, key);

  if (!cached) {
    updateCacheStats(false);
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    await db.delete(CACHE_STORE_NAME, key);
    updateCacheStats(false);
    return null;
  }

  updateCacheStats(true);
  return cached.data as T;
};

export const clearCache = async () => {
  const db = await getDB();
  await db.clear(CACHE_STORE_NAME);
};

export const invalidateCache = async (pattern: RegExp): Promise<void> => {
  const db = await getDB();
  const keys = await db.getAllKeys(CACHE_STORE_NAME);

  for (const key of keys) {
    if (pattern.test(key.toString())) {
      await db.delete(CACHE_STORE_NAME, key);
    }
  }
};
