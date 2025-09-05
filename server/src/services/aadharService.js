const axios = require('axios');
const config = require('../config');
const logger = require('../lib/logger');
const mockDb = require('../lib/mockDb'); // <-- IMPORT MOCK DB

const aadharApiClient = axios.create({
    baseURL: config.aadhar.baseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.aadhar.apiKey,
    },
});

// --- MOCK AADHAAR SERVICE ---
const mockSendOtp = async (aadharNumber) => {
    logger.warn(`[MOCK MODE] Simulating Aadhaar OTP request for ${aadharNumber}`);
    const patient = mockDb.mockPatients.find(p => p.aadharNumber === aadharNumber);

    if (!patient) {
        const error = new Error('Aadhaar number not found in mock database.');
        error.response = { status: 404, data: { message: 'Mock patient not found' } };
        throw error;
    }

    const { txId } = mockDb.createMockTransaction(aadharNumber);
    logger.warn(`[MOCK MODE] Use OTP: ${mockDb.MOCK_OTP} for txId: ${txId}`);
    return { txId };
};

const mockVerifyOtp = async (txId, otp) => {
    logger.warn(`[MOCK MODE] Simulating Aadhaar OTP verification for txId ${txId}`);
    const transaction = mockDb.verifyMockTransaction(txId, otp);

    if (!transaction) {
        const error = new Error('Invalid OTP or Transaction ID.');
        error.response = { status: 401, data: { message: 'Mock OTP verification failed' } };
        throw error;
    }

    const patient = mockDb.mockPatients.find(p => p.aadharNumber === transaction.identifier);
    if (!patient) { // Should not happen if createMockTransaction worked
        const error = new Error('Patient data not found for verified transaction.');
        error.response = { status: 500, data: { message: 'Internal mock server error' } };
        throw error;
    }

    // Return in the same canonical format as the real service
    return {
        aadharNumber: patient.aadharNumber,
        name: patient.name,
        demographics: patient.demographics,
    };
};

// --- LIVE AADHAAR SERVICE ---
const liveSendOtp = async (aadharNumber) => {
    try {
        const url = config.aadhar.paths.sendOtp;
        logger.info(`Sending Aadhaar OTP request to ${url} for Aadhaar number.`);
        const requestBody = { uid: aadharNumber, authType: "otp" };
        const response = await aadharApiClient.post(url, requestBody);
        const txId = response.data.txnId;
        if (!txId) throw new Error('Transaction ID not found in Aadhaar OTP response');
        logger.info(`Successfully received txId from Aadhaar service.`);
        return { txId };
    } catch (error) {
        logger.error(error.response?.data || error.message, `Aadhaar OTP request failed.`);
        throw error;
    }
};

const liveVerifyOtp = async (txId, otp) => {
    try {
        const url = config.aadhar.paths.verifyOtp;
        logger.info(`Verifying Aadhaar OTP for txId: ${txId}`);
        const requestBody = { txnId: txId, otp: otp };
        const response = await aadharApiClient.post(url, requestBody);
        const { uid, name, gender, yob, mobile } = response.data.kyc || {};
        if (!uid || !name) throw new Error('Required patient data not found in Aadhaar verify response');

        return {
            aadharNumber: uid,
            name,
            demographics: {
                yob,
                gender: gender === 'M' ? 'male' : gender === 'F' ? 'female' : 'other',
                mobile,
            },
        };
    } catch (error) {
        logger.error(error.response?.data || error.message, `Aadhaar OTP verification failed for txId: ${txId}`);
        throw error;
    }
};

// --- EXPORTED SERVICE ---
module.exports = {
    sendOtp: config.authMode === 'mock' ? mockSendOtp : liveSendOtp,
    verifyOtp: config.authMode === 'mock' ? mockVerifyOtp : liveVerifyOtp,
};