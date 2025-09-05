const logger = require('../lib/logger');
const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
    logger.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: err.errors,
        });
    }

    // Handle specific API errors from ABHA/HPR services
    if (err.isAxiosError) {
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || 'External service error';
        return res.status(status).json({ message });
    }
    
    // Generic error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred on the server.';

    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;