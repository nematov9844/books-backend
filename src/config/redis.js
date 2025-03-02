const Redis = require('redis');
const { promisify } = require('util');

// Redis client yaratish
const client = Redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 50, 2000);
    }
  }
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

// Promisify Redis methodlari
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    // Cache key yaratish
    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      // Cache dan ma'lumot olish
      const cachedResponse = await getAsync(key);
      
      if (cachedResponse) {
        // Cache topilsa, uni qaytarish
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }
      
      // Original send methodini saqlash
      const originalSend = res.json;
      
      // Send methodini override qilish
      res.json = function(body) {
        // Cache ga saqlash
        setAsync(key, JSON.stringify(body), 'EX', duration)
          .catch(err => console.error('Redis cache error:', err));
          
        // Original send methodini chaqirish
        originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Redis cache middleware error:', error);
      next();
    }
  };
};

// Cache ni tozalash
const clearCache = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await delAsync(keys);
    }
  } catch (error) {
    console.error('Redis clear cache error:', error);
  }
};

module.exports = {
  client,
  cache,
  clearCache,
  getAsync,
  setAsync,
  delAsync
}; 