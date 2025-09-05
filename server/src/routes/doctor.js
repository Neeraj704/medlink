const express = require('express');
const multer = require('multer');
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createConsultationSchema, findPatientSchema, updateDoctorProfileSchema } = require('../utils/validator');

const router = express.Router();

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
        }
    }
});


// All doctor routes are protected
router.use(authMiddleware);
router.use(roleMiddleware('DOCTOR'));

// Dashboard route
router.get('/dashboard', doctorController.getDashboardData);

// Profile routes
router.get('/profile', doctorController.getProfile);
router.put('/profile', validate(updateDoctorProfileSchema), doctorController.updateProfile);

// Patient search
router.get('/patients', validate(findPatientSchema), doctorController.findPatient);

// Consultation routes
router.post('/consultation', validate(createConsultationSchema), doctorController.createConsultation);
router.get('/consultation/:id', doctorController.getConsultationById);

// Legacy data import route
router.post(
    '/consultation/upload-legacy', 
    upload.single('prescription'), // 'prescription' is the field name in the form-data
    doctorController.uploadLegacyPrescription
);


module.exports = router;