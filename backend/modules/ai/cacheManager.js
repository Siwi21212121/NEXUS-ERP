const cache = new Map();
const DEFAULT_TTL_MS = 60 * 1000;

function get(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function buildKey(parts) {
  return JSON.stringify(parts);
}

module.exports = {
  buildKey,
  get,
  set,
};
