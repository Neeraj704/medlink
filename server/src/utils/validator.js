// FILE: server/src/utils/validator.js

const { z } = require('zod');

// --- Auth Schemas ---
// ... (no changes to auth schemas)
const sendAbhaOtpSchema = z.object({
    body: z.object({
        abhaNumber: z.string().min(1, 'ABHA number is required.'),
    }),
});
const verifyAbhaOtpSchema = z.object({
    body: z.object({
        txId: z.string().min(1, 'Transaction ID is required.'),
        otp: z.string().length(6, 'OTP must be 6 digits.'),
    }),
});
const sendAadhaarOtpSchema = z.object({
    body: z.object({
        aadharNumber: z.string().length(12, 'Aadhaar number must be 12 digits.'),
    }),
});
const verifyAadhaarOtpSchema = z.object({
    body: z.object({
        txId: z.string().min(1, 'Transaction ID is required.'),
        otp: z.string().length(6, 'OTP must be 6 digits.'),
    }),
});
const hprRegisterSchema = z.object({
    body: z.object({
        hprId: z.string().min(1, 'HPR ID is required.'),
        password: z.string().min(8, 'Password must be at least 8 characters long.'),
    }),
});
const hprLoginSchema = z.object({
    body: z.object({
        hprId: z.string().min(1, 'HPR ID is required.'),
        password: z.string().min(1, 'Password is required.'),
    }),
});
const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required.'),
    }),
});


// --- Patient Schemas ---
const updatePatientProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters long.').optional(),
        email: z.string().email('Invalid email address.').optional(),
        demographics: z.object({
            yob: z.string().optional(),
            gender: z.string().optional(),
            mobile: z.string().optional()
        }).optional()
    })
});


// --- Doctor Schemas ---
const findPatientSchema = z.object({
    query: z.object({
        identifier: z.string().min(1, 'Patient identifier query parameter is required.'),
        type: z.enum(['abha', 'aadhar']).default('abha'),
    })
});

const codeSchema = z.object({
    system: z.string(),
    code: z.string(),
    display: z.string(),
});
const diagnosisSchema = z.object({
    name: z.string(),
    codes: z.array(codeSchema),
});
const medicationSchema = z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
});

const createConsultationSchema = z.object({
    body: z.object({
        patientIdentifier: z.string().min(1, 'Patient identifier is required.'),
        vitals: z.object({
            height: z.string().optional(),
            weight: z.string().optional(),
            bloodPressure: z.string().optional(),
            temperature: z.string().optional(),
            pulse: z.string().optional(),
        }).optional(),
        diagnoses: z.array(diagnosisSchema).min(1, 'At least one diagnosis is required.'),
        medications: z.array(medicationSchema).min(1, 'At least one medication is required.'),
        notes: z.string().optional(),
    }),
});

const updateDoctorProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters long.').optional(),
        email: z.string().email('Invalid email address.').optional(),
        speciality: z.string().min(2, 'Speciality must be at least 2 characters long.').optional(),
    })
});

// --- ML Schemas ---
const mlQuerySchema = z.object({
    body: z.object({
        query: z.string().min(3, "Query must be at least 3 characters long.")
    })
});

module.exports = {
    sendAbhaOtpSchema,
    verifyAbhaOtpSchema,
    sendAadhaarOtpSchema,
    verifyAadhaarOtpSchema,
    hprRegisterSchema,
    hprLoginSchema,
    refreshTokenSchema,
    findPatientSchema,
    createConsultationSchema,
    updatePatientProfileSchema,
    updateDoctorProfileSchema,
    mlQuerySchema
};