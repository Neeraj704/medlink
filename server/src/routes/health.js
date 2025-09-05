const express = require('express');
const prisma = require('../lib/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            db: 'connected',
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            uptime: process.uptime(),
            db: 'disconnected',
            error: error.message,
        });
    }
});

module.exports = router;