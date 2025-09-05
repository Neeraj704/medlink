const axios = require('axios');
const config = require('../config');
const logger = require('../lib/logger');
const mockDb = require('../lib/mockDb'); // <-- IMPORT MOCK DB

const abhaApiClient = axios.create({
    baseURL: config.abha.baseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.abha.apiKey}`,
    },
});

// --- MOCK ABHA SERVICE ---
const mockSendOtp = async (abhaNumber) => {
    logger.warn(`[MOCK MODE] Simulating ABHA OTP request for ${abhaNumber}`);
    const patient = mockDb.mockPatients.find(p => p.abhaNumber === abhaNumber);
    
    if (!patient) {
        const error = new Error('ABHA number not found in mock database.');
        error.response = { status: 404, data: { message: 'Mock patient not found' } };
        throw error;
    }
    
    const { txId } = mockDb.createMockTransaction(abhaNumber);
    logger.warn(`[MOCK MODE] Use OTP: ${mockDb.MOCK_OTP} for txId: ${txId}`);
    return { txId };
};

const mockVerifyOtp = async (txId, otp) => {
    logger.warn(`[MOCK MODE] Simulating ABHA OTP verification for txId ${txId}`);
    const transaction = mockDb.verifyMockTransaction(txId, otp);
    
    if (!transaction) {
        const error = new Error('Invalid OTP or Transaction ID.');
        error.response = { status: 401, data: { message: 'Mock OTP verification failed' } };
        throw error;
    }
    
    const patient = mockDb.mockPatients.find(p => p.abhaNumber === transaction.identifier);
    if (!patient) {
        const error = new Error('Patient data not found for verified transaction.');
        error.response = { status: 500, data: { message: 'Internal mock server error' } };
        throw error;
    }
    
    // Return in the same canonical format as the real service
    return {
        abhaNumber: patient.abhaNumber,
        name: patient.name,
        demographics: patient.demographics,
        abhaToken: `mock-token-for-${patient.abhaNumber}`,
    };
};

// --- LIVE ABHA SERVICE ---
const liveSendOtp = async (abhaNumber) => {
    try {
        const url = config.abha.paths.sendOtp;
        logger.info(`Sending ABHA OTP request to ${url} for ABHA number: ${abhaNumber}`);
        const requestBody = { healthid: abhaNumber, authMethod: "MOBILE_OTP" };
        const response = await abhaApiClient.post(url, requestBody);
        const txId = response.data.txnId;
        if (!txId) throw new Error('Transaction ID not found in ABHA OTP response');
        logger.info(`Successfully received txId from ABHA for ${abhaNumber}`);
        return { txId };
    } catch (error) {
        logger.error(error.response?.data || error.message, `ABHA OTP request failed for ${abhaNumber}`);
        throw error;
    }
};

const liveVerifyOtp = async (txId, otp) => {
    try {
        const url = config.abha.paths.verifyOtp;
        logger.info(`Verifying ABHA OTP for txId: ${txId}`);
        const requestBody = { txnId: txId, otp: otp };
        const response = await abhaApiClient.post(url, requestBody);
        const { healthIdNumber, name, yearOfBirth, gender, mobile } = response.data.user || {};
        if (!healthIdNumber || !name) throw new Error('Required patient data not found in ABHA verify response');
        
        return {
            abhaNumber: healthIdNumber,
            name,
            demographics: {
                yob: yearOfBirth,
                gender,
                mobile,
            },
            abhaToken: response.data.token,
        };
    } catch (error) {
        logger.error(error.response?.data || error.message, `ABHA OTP verification failed for txId: ${txId}`);
        throw error;
    }
};

// --- EXPORTED SERVICE ---
module.exports = {
    sendOtp: config.authMode === 'mock' ? mockSendOtp : liveSendOtp,
    verifyOtp: config.authMode === 'mock' ? mockVerifyOtp : liveVerifyOtp,
};