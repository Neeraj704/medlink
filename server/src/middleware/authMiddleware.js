const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../lib/logger');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.accessSecret);
        req.user = decoded; // Attach user payload (id, role, etc.) to the request
        next();
    } catch (error) {
        logger.warn(`Invalid JWT token provided: ${error.message}`);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired.' });
        }
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;