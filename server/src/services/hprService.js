const axios = require('axios');
const config = require('../config');
const logger = require('../lib/logger');
const mockDb = require('../lib/mockDb'); // <-- IMPORT MOCK DB

const hprApiClient = axios.create({
    baseURL: config.hpr.baseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.hpr.apiKey}`,
    },
});

// --- MOCK HPR SERVICE ---
const mockVerifyHprId = async (hprId) => {
    logger.warn(`[MOCK MODE] Simulating HPR ID verification for ${hprId}`);
    const doctor = mockDb.mockDoctors.find(d => d.hprId === hprId);
    
    if (!doctor) {
        const error = new Error('HPR ID not found in mock database.');
        error.response = { status: 404, data: { message: 'Mock doctor not found' } };
        throw error;
    }
    
    logger.warn(`[MOCK MODE] Found doctor: ${doctor.name}, verified: ${doctor.verified}, practicing: ${doctor.isPracticing}`);
    
    // Return in the same canonical format as the real service
    return {
        hprId: doctor.hprId,
        name: doctor.name,
        specialty: doctor.specialty,
        isPracticing: doctor.isPracticing,
        verified: doctor.verified,
    };
};

// --- LIVE HPR SERVICE ---
const liveVerifyHprId = async (hprId) => {
    try {
        const url = config.hpr.paths.verify;
        logger.info(`Verifying HPR ID: ${hprId} at ${url}`);
        const requestBody = { hprId };
        const response = await hprApiClient.post(url, requestBody);
        const { hprId: respHprId, name, specialty, isPracticing, verified } = response.data;
        if (!respHprId || !name) throw new Error('Required doctor data not found in HPR response');
        
        const canonicalDoctor = {
            hprId: respHprId,
            name,
            specialty: specialty || 'General Practice',
            isPracticing: isPracticing === true,
            verified: verified === true,
        };
        
        logger.info(`Successfully verified and mapped HPR data for ${hprId}`);
        return canonicalDoctor;
    } catch (error) {
        logger.error(error.response?.data || error.message, `HPR verification failed for ${hprId}`);
        throw error;
    }
};

// --- EXPORTED SERVICE ---
module.exports = {
    verifyHprId: config.authMode === 'mock' ? mockVerifyHprId : liveVerifyHprId,
};