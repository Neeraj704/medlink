const prisma = require('../lib/db');
const logger = require('../lib/logger');

const searchTerminology = async (req, res, next) => {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
        return res.status(400).json({ message: "Search query 'q' must be at least 2 characters long." });
    }

    try {
        // This raw query uses the pg_trgm extension for fuzzy matching.
        // Make sure to create the extension and GIN indexes as described in the README.
        const results = await prisma.$queryRaw`
            SELECT 
                id, 
                term, 
                aliases, 
                codes, 
                similarity(term, ${q}) AS confidence
            FROM "Terminology"
            WHERE term % ${q} OR aliases::text % ${q}
            ORDER BY confidence DESC
            LIMIT ${parseInt(limit, 10)};
        `;

        const formattedResults = results.map(r => ({
            displayName: r.term,
            aliases: r.aliases,
            codes: r.codes,
            confidence: r.confidence
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        logger.error(error, `Terminology search failed for query: ${q}`);
        // Check for specific error related to pg_trgm not being installed
        if (error.message.includes('function similarity(character varying, unknown) does not exist')) {
            logger.error('The pg_trgm extension might not be enabled in your database. See README for instructions.');
            return res.status(500).json({ message: 'Terminology search is not configured correctly on the server.'});
        }
        next(error);
    }
};

module.exports = {
    searchTerminology,
};