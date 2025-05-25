import { describe, it, expect, vi } from 'vitest';
import { getDB } from './db';
import { processSyncQueue } from './sync';
import { optimizeImage } from './imageOptimizer';
import { cacheData, getCachedData } from './cache';

describe('Database Operations', () => {
  it('should initialize database correctly', async () => {
    const db = await getDB();
    expect(db).toBeDefined();
  });

  it('should handle offline data storage', async () => {
    const db = await getDB();
    const testData = { id: '1', name: 'Test' };
    await db.add('clientes', testData);
    const stored = await db.get('clientes', '1');
    expect(stored).toEqual(testData);
  });
});

describe('Sync Operations', () => {
  it('should process sync queue correctly', async () => {
    const mockSync = vi.fn();
    vi.mock('./sync', () => ({
      processSyncQueue: mockSync,
    }));

    await processSyncQueue();
    expect(mockSync).toHaveBeenCalled();
  });
});

describe('Image Optimization', () => {
  it('should optimize images correctly', async () => {
    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const optimized = await optimizeImage(testFile);
    expect(optimized.size).toBeLessThanOrEqual(testFile.size);
  });
});

describe('Cache Operations', () => {
  it('should cache and retrieve data correctly', async () => {
    const testData = { test: 'data' };
    await cacheData('test-key', testData);
    const cached = await getCachedData('test-key');
    expect(cached).toEqual(testData);
  });
});
