const { randomUUID } = require('crypto');

// A simple in-memory store for OTP transactions.
// In a real app, this would be Redis or another fast cache.
const otpTransactionStore = new Map();
const MOCK_OTP = "123456"; // Static OTP for all mock transactions

const mockPatients = [
  {
    aadharNumber: '123456789012',
    abhaNumber: '12-3456-7890-1234',
    name: 'Aarav Sharma',
    demographics: { yob: '1985', gender: 'male', mobile: '9876543210' },
  },
  {
    aadharNumber: '234567890123',
    abhaNumber: '23-4567-8901-2345',
    name: 'Saanvi Gupta',
    demographics: { yob: '1992', gender: 'female', mobile: '9876543211' },
  },
  {
    aadharNumber: '345678901234',
    abhaNumber: '34-5678-9012-3456',
    name: 'Vivaan Singh',
    demographics: { yob: '1978', gender: 'male', mobile: '9876543212' },
  },
  {
    aadharNumber: '456789012345',
    abhaNumber: '45-6789-0123-4567',
    name: 'Diya Patel',
    demographics: { yob: '2001', gender: 'female', mobile: '9876543213' },
  },
  {
    aadharNumber: '567890123456',
    abhaNumber: '56-7890-1234-5678',
    name: 'Arjun Reddy',
    demographics: { yob: '1988', gender: 'male', mobile: '9876543214' },
  },
  {
    aadharNumber: '678901234567',
    abhaNumber: '67-8901-2345-6789',
    name: 'Ananya Iyer',
    demographics: { yob: '1995', gender: 'female', mobile: '9876543215' },
  },
  {
    aadharNumber: '789012345678',
    abhaNumber: '78-9012-3456-7890',
    name: 'Rohan Mehta',
    demographics: { yob: '1965', gender: 'male', mobile: '9876543216' },
  },
  {
    aadharNumber: '890123456789',
    abhaNumber: '89-0123-4567-8901',
    name: 'Ishita Kumar',
    demographics: { yob: '1999', gender: 'female', mobile: '9876543217' },
  },
  {
    aadharNumber: '901234567890',
    abhaNumber: '90-1234-5678-9012',
    name: 'Kabir Khan',
    demographics: { yob: '1980', gender: 'male', mobile: '9876543218' },
  },
  {
    aadharNumber: '012345678901',
    abhaNumber: '01-2345-6789-0123',
    name: 'Zara Ali',
    demographics: { yob: '1993', gender: 'female', mobile: '9876543219' },
  },
];

const mockDoctors = [
  {
    hprId: 'DR1001',
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiology',
    isPracticing: true,
    verified: true,
  },
  {
    hprId: 'DR1002',
    name: 'Dr. Rahul Verma',
    specialty: 'Neurology',
    isPracticing: true,
    verified: true,
  },
  {
    hprId: 'DR1003',
    name: 'Dr. Anjali Desai',
    specialty: 'Pediatrics',
    isPracticing: true,
    verified: true,
  },
  {
    hprId: 'DR1004',
    name: 'Dr. Vikram Rathore',
    specialty: 'Orthopedics',
    isPracticing: true,
    verified: true,
  },
  {
    hprId: 'DR1005',
    name: 'Dr. Sunita Nair',
    specialty: 'Dermatology',
    isPracticing: false, // Example of a non-practicing doctor
    verified: true,
  },
  {
    hprId: 'DR1006',
    name: 'Dr. Manish Malhotra',
    specialty: 'General Medicine',
    isPracticing: true,
    verified: true,
  },
  {
    hprId: 'DR1007',
    name: 'Dr. Fatima Ahmed',
    specialty: 'Gynecology',
    isPracticing: true,
    verified: true,
  },
  {
    hprId: 'DR1008',
    name: 'Dr. Alok Nath',
    specialty: 'Oncology',
    isPracticing: true,
    verified: true,
  },
  {
    hprId: 'DR1009',
    name: 'Dr. Sameer Joshi',
    specialty: 'Psychiatry',
    isPracticing: true,
    verified: false, // Example of a non-verified doctor
  },
  {
    hprId: 'DR1010',
    name: 'Dr. Sneha Patil',
    specialty: 'Endocrinology',
    isPracticing: true,
    verified: true,
  },
];

/**
 * Creates a mock OTP transaction.
 * @param {string} identifier - The Aadhar or ABHA number.
 * @returns {{txId: string}}
 */
const createMockTransaction = (identifier) => {
  const txId = randomUUID();
  otpTransactionStore.set(txId, { identifier, otp: MOCK_OTP, createdAt: new Date() });
  return { txId };
};

/**
 * Verifies a mock OTP transaction.
 * @param {string} txId - The transaction ID.
 * @param {string} otp - The OTP to verify.
 * @returns {{identifier: string}|null}
 */
const verifyMockTransaction = (txId, otp) => {
  const transaction = otpTransactionStore.get(txId);
  if (transaction && transaction.otp === otp) {
    // In a real scenario, you'd also check if it expired.
    otpTransactionStore.delete(txId); // One-time use
    return { identifier: transaction.identifier };
  }
  return null;
};


module.exports = {
  mockPatients,
  mockDoctors,
  createMockTransaction,
  verifyMockTransaction,
  MOCK_OTP
};