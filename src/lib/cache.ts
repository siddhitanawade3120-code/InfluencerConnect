type CacheEntry<T> = { value: T; expiresAt: number };

const stores = new Map<string, Map<string, CacheEntry<unknown>>>();

function getStore(name: string): Map<string, CacheEntry<unknown>> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  return store;
}

export function cacheGet<T>(storeName: string, key: string): T | null {
  const entry = getStore(storeName).get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    getStore(storeName).delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet<T>(storeName: string, key: string, value: T, ttlMs: number): void {
  getStore(storeName).set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheInvalidate(storeName: string, key?: string): void {
  const store = getStore(storeName);
  if (key) store.delete(key);
  else store.clear();
}

export async function cacheThrough<T>(
  storeName: string,
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const hit = cacheGet<T>(storeName, key);
  if (hit !== null) return hit;
  const value = await fn();
  cacheSet(storeName, key, value, ttlMs);
  return value;
}
