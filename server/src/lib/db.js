const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
    ],
});

prisma.$on('query', (e) => {
    logger.trace(`Query: ${e.query}, Params: ${e.params}, Duration: ${e.duration}ms`);
});

module.exports = prisma;