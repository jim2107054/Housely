import env from './env.js';

// ─── In-memory store (fallback when Redis is not available) ───

class MemoryStore {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, ...args) {
    let ttl = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === 'EX' && args[i + 1]) {
        ttl = parseInt(args[i + 1], 10) * 1000;
        i++;
      }
    }

    const item = { value };
    if (ttl) {
      item.expiresAt = Date.now() + ttl;
      if (this.timers.has(key)) clearTimeout(this.timers.get(key));
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.timers.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }
    this.store.set(key, item);
    return 'OK';
  }

  async del(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.store.delete(key) ? 1 : 0;
  }

  async incr(key) {
    const current = await this.get(key);
    const newVal = (parseInt(current, 10) || 0) + 1;
    const item = this.store.get(key);
    if (item) {
      item.value = String(newVal);
    } else {
      this.store.set(key, { value: String(newVal) });
    }
    return newVal;
  }

  async expire(key, seconds) {
    const item = this.store.get(key);
    if (!item) return 0;
    item.expiresAt = Date.now() + seconds * 1000;
    if (this.timers.has(key)) clearTimeout(this.timers.get(key));
    const timer = setTimeout(() => {
      this.store.delete(key);
      this.timers.delete(key);
    }, seconds * 1000);
    this.timers.set(key, timer);
    return 1;
  }

  async ttl(key) {
    const item = this.store.get(key);
    if (!item) return -2;
    if (!item.expiresAt) return -1;
    const remaining = Math.ceil((item.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }
}

// ─── Create redis client or fallback ───

let redis;

if (env.REDIS_URL) {
  try {
    const Redis = (await import('ioredis')).default;
    redis = new Redis(env.REDIS_URL);
    redis.on('error', (err) => console.error('Redis error:', err));
    redis.on('connect', () => console.log('✅ Connected to Redis'));
  } catch {
    console.warn('⚠️  ioredis not installed, using in-memory store');
    redis = new MemoryStore();
  }
} else {
  console.warn('⚠️  REDIS_URL not set, using in-memory store (not for production)');
  redis = new MemoryStore();
}

export default redis;
