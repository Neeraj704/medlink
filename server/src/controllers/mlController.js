const axios = require('axios');
const logger = require('../lib/logger');

// The URL for the Python ML service. This should be in an environment variable.
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001/query';

const queryAssistant = async (req, res, next) => {
    const { query } = req.body;

    try {
        logger.info(`Forwarding query to ML service: "${query}"`);

        const response = await axios.post(ML_SERVICE_URL, { query });

        res.status(200).json(response.data);

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            logger.error(`Connection to ML service at ${ML_SERVICE_URL} refused.`);
            return res.status(503).json({ message: 'The AI assistant service is currently unavailable. Please try again later.' });
        }
        logger.error(error, `Error querying ML service for: "${query}"`);
        next(error);
    }
};

module.exports = {
    queryAssistant,
};