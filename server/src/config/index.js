const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    authMode: process.env.AUTH_MODE || 'live', // <-- ADD THIS LINE
    databaseUrl: process.env.DATABASE_URL,
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '30d',
    },
    cors: {
        origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    },
    rateLimit: {
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    },
    abha: {
        baseUrl: process.env.ABHA_BASE_URL,
        apiKey: process.env.ABHA_API_KEY,
        paths: {
            sendOtp: process.env.ABHA_PATH_SEND_OTP,
            verifyOtp: process.env.ABHA_PATH_VERIFY_OTP,
        },
    },
    hpr: {
        baseUrl: process.env.HPR_BASE_URL,
        apiKey: process.env.HPR_API_KEY,
        paths: {
            verify: process.env.HPR_PATH_VERIFY,
        },
    },
    // --- ADDED: Aadhaar config ---
    aadhar: {
        baseUrl: process.env.AADHAAR_BASE_URL,
        apiKey: process.env.AADHAAR_API_KEY,
        paths: {
            sendOtp: process.env.AADHAAR_PATH_SEND_OTP,
            verifyOtp: process.env.AADHAAR_PATH_VERIFY_OTP,
        },
    },
    logLevel: process.env.LOG_LEVEL || 'info',
};

// Basic validation
if (!config.databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
}
if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
    throw new Error('JWT secret keys are not set in environment variables.');
}

module.exports = config;