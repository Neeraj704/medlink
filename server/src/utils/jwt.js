const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const config = require('../config');
const prisma = require('../lib/db');
const hashUtils = require('./hash');
const logger = require('../lib/logger');

const generateTokens = async (userPayload) => {
    const accessToken = jwt.sign(userPayload, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiration,
    });
    
    const refreshToken = randomBytes(40).toString('hex');
    const tokenHash = hashUtils.hashToken(refreshToken);

    const expiresAt = new Date();
    const durationDays = parseInt(config.jwt.refreshExpiration, 10);
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await prisma.refreshToken.create({
        data: {
            userId: userPayload.id,
            tokenHash,
            expiresAt,
        },
    });

    return { accessToken, refreshToken };
};


const rotateRefreshToken = async (oldRefreshToken) => {
    const oldTokenHash = hashUtils.hashToken(oldRefreshToken);
    
    const oldTokenRecord = await prisma.refreshToken.findUnique({
        where: { tokenHash: oldTokenHash },
        include: { user: true }, // Simplified include
    });

    if (!oldTokenRecord) {
        throw new Error('Refresh token not found.');
    }

    await prisma.refreshToken.delete({ where: { id: oldTokenRecord.id } });

    if (oldTokenRecord.expiresAt < new Date()) {
        throw new Error('Refresh token has expired.');
    }

    const { user } = oldTokenRecord;
    
    // --- FIXED: Reconstruct payload from the user record ---
    // The payload is now consistent and simple: just id and role.
    const userPayload = {
        id: user.id,
        role: user.role,
    };

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(userPayload);
    
    logger.info(`Rotated refresh token for user ID: ${user.id}`);
    return { newAccessToken, newRefreshToken };
};

module.exports = {
    generateTokens,
    rotateRefreshToken,
};