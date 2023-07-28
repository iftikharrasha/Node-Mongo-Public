const cache = require('../utils/cacheInstance');

module.exports = duration => (req, res, next) => {
    // Is the request a GET?
    if (req.method !== 'GET') {
      console.log('Cannot get non-GET requests');
      return next();
    }

    // Check if key exists in cache
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    // If it exists, send cached result
    if (cachedResponse) {
      console.log(`Cache hit for ${key}`);
      res.send(JSON.parse(cachedResponse));
    } else {
        console.log(`Cache miss for ${key}`);
        res.originalSend = res.send;
        res.send = body => {
          res.originalSend(body);
          cache.set(key, JSON.stringify(body), duration);
        };
      next();
    }
};

