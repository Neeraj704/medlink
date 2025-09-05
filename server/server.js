const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');

const config = require('./src/config');
const logger = require('./src/lib/logger');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimit');

const authRoutes = require('./src/routes/auth');
const patientRoutes = require('./src/routes/patient');
const doctorRoutes = require('./src/routes/doctor');
const terminologyRoutes = require('./src/routes/terminology');
const healthRoutes = require('./src/routes/health');
const mlRoutes = require('./src/routes/ml');

const app = express();
const server = http.createServer(app);

// --- Core Middleware ---
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS
const corsOptions = {
    origin: config.cors.origins,
    credentials: true,
};
app.use(cors(corsOptions));

// Rate Limiting (applied to all routes, can be configured per route)
app.use(rateLimiter.global);

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/patient', patientRoutes);
app.use('/doctor', doctorRoutes);
app.use('/terminology', terminologyRoutes);
app.use('/health', healthRoutes);
app.use('/ml', mlRoutes);

// --- Error Handling ---
app.use(errorHandler);

// --- Start Server ---
const startServer = () => {
    server.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
    });
};

startServer();

// --- Graceful Shutdown ---
const gracefulShutdown = (signal) => {
    logger.warn(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
        logger.info('HTTP server closed.');
        // You can add database connection closing here if needed
        process.exit(0);
    });

    // Force shutdown after a timeout
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000); // 10 seconds
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;