const logger = require('../lib/logger');

/**
 * Mocks the process of extracting text from an image buffer.
 * @param {Buffer} imageBuffer - The buffer of the image file.
 * @returns {Promise<{success: boolean, text: string|null}>}
 */
const extractTextFromImage = async (imageBuffer) => {
    logger.warn('[MOCK MODE] Simulating OCR text extraction.');

    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        const mockExtractedText = `
Dr. Anjali Desai (Pediatrics)
Date: 2024-08-15

Patient: Vivaan Singh

Diagnosis:
- Viral Fever (ICD-11: 1D01)

Prescription:
1. Paracetamol 250mg Syrup
   - Dosage: 5ml
   - Frequency: Thrice a day
   - Duration: 3 days

2. Ondansetron 2mg Syrup
   - Dosage: 2.5ml
   - Frequency: Twice a day (if nausea)
   - Duration: 2 days

Notes:
Ensure adequate hydration. Monitor temperature.
Follow up if fever persists beyond 3 days.
        `.trim();
        
        logger.info('[MOCK MODE] OCR simulation successful.');
        return {
            success: true,
            text: mockExtractedText
        };
    } catch (error) {
        logger.error(error, '[MOCK MODE] OCR simulation failed.');
        return {
            success: false,
            text: null,
        };
    }
};

module.exports = {
    extractTextFromImage,
};