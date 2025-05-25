import { openDB, DBSchema } from 'idb';

interface ImageCacheDB extends DBSchema {
  'image-cache': {
    key: string;
    value: {
      blob: Blob;
      timestamp: number;
      size: number;
    };
  };
}

const IMAGE_CACHE_NAME = 'image-cache';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ImageCacheDB>> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<ImageCacheDB>(IMAGE_CACHE_NAME, VERSION, {
      upgrade(db) {
        db.createObjectStore('image-cache');
      },
    });
  }
  return dbPromise;
};

export const cacheImage = async (key: string, blob: Blob) => {
  const db = await getDB();
  
  // Check current cache size
  const entries = await db.getAll('image-cache');
  const currentSize = entries.reduce((acc, entry) => acc + entry.size, 0);
  
  // If adding this image would exceed the limit, remove oldest entries
  if (currentSize + blob.size > MAX_CACHE_SIZE) {
    const sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp);
    let sizeToFree = (currentSize + blob.size) - MAX_CACHE_SIZE;
    
    for (const entry of sortedEntries) {
      if (sizeToFree <= 0) break;
      await db.delete('image-cache', entry.key);
      sizeToFree -= entry.size;
    }
  }
  
  await db.put('image-cache', {
    blob,
    timestamp: Date.now(),
    size: blob.size
  }, key);
};

export const getCachedImage = async (key: string): Promise<Blob | null> => {
  const db = await getDB();
  const cached = await db.get('image-cache', key);
  return cached?.blob || null;
};

export const clearImageCache = async () => {
  const db = await getDB();
  await db.clear('image-cache');
};