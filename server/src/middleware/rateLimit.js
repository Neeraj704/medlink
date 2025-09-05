const rateLimit = require('express-rate-limit');
const config = require('../config');

const globalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Stricter limiter for sensitive endpoints like auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per window
    message: 'Too many authentication attempts, please try again later.',
});

module.exports = {
    global: globalLimiter,
    auth: authLimiter,
};