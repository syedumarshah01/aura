const NodeCache = require('node-cache');

// Standard TTL is 5 minutes (300 seconds)
const myCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

module.exports = myCache;
