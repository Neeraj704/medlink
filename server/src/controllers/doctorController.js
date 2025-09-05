const prisma = require('../lib/db');
const fhirService = require('../services/fhirService');
const logger = require('../lib/logger');
const ocrService = require('../services/ocrService');

// --- Profile Management ---
const getProfile = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                doctorProfile: true
            }
        });

        if (!user || !user.doctorProfile) {
            return res.status(404).json({ message: 'Doctor profile not found.' });
        }

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            hprId: user.doctorProfile.hprId,
            speciality: user.doctorProfile.speciality,
            verified: user.doctorProfile.verified,
            createdAt: user.createdAt,
        });
    } catch (error) {
        logger.error(error, `Failed to get profile for doctor: ${userId}`);
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    const userId = req.user.id;
    const { name, email, speciality } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                doctorProfile: {
                    update: {
                        speciality
                    }
                }
            },
            include: {
                doctorProfile: true
            }
        });

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            hprId: user.doctorProfile.hprId,
            speciality: user.doctorProfile.speciality,
        });

    } catch (error) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(409).json({ message: 'Email address is already in use.' });
        }
        logger.error(error, `Failed to update profile for doctor: ${userId}`);
        next(error);
    }
};

// --- Dashboard ---
const getDashboardData = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId }
        });

        if (!doctorProfile) {
            return res.status(404).json({ message: 'Doctor profile not found.' });
        }

        const recentConsultations = await prisma.consultation.findMany({
            where: { doctorId: doctorProfile.id },
            take: 5,
            orderBy: { date: 'desc' },
            include: {
                patient: { include: { user: { select: { name: true } } } }
            }
        });
        
        const totalConsultations = await prisma.consultation.count({
            where: { doctorId: doctorProfile.id }
        });

        // Get count of unique patients
        const patientCountResult = await prisma.consultation.groupBy({
            by: ['patientId'],
            where: { doctorId: doctorProfile.id },
            _count: {
                patientId: true
            }
        });
        const totalPatients = patientCountResult.length;

        res.status(200).json({
            stats: {
                totalConsultations,
                totalPatients
            },
            recentConsultations: recentConsultations.map(c => ({
                id: c.id,
                date: c.date,
                patientName: c.patient.user.name,
                summary: c.diagnoses[0]?.name || 'General Consultation'
            }))
        });

    } catch (error) {
        logger.error(error, `Failed to fetch dashboard data for doctor: ${userId}`);
        next(error);
    }
};

// --- Legacy Data Import ---
const uploadLegacyPrescription = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        
        const extractedData = await ocrService.extractTextFromImage(req.file.buffer);

        if (!extractedData.success) {
            return res.status(500).json({ message: 'Failed to extract text from the document.' });
        }

        res.status(200).json({
            message: 'File processed successfully. Please review the extracted text.',
            extractedText: extractedData.text
        });

    } catch (error) {
        logger.error(error, 'Failed to process legacy prescription upload.');
        next(error);
    }
};


// --- Original Functions ---
const findPatient = async (req, res, next) => {
    const { identifier, type } = req.query;
    if (!identifier) {
        return res.status(400).json({ message: 'Patient identifier query parameter is required.' });
    }

    try {
        const whereClause = type === 'aadhar'
            ? { aadharNumber: identifier }
            : { abhaNumber: identifier };

        const patientProfile = await prisma.patientProfile.findUnique({
            where: whereClause,
            include: {
                user: {
                    select: { name: true },
                },
            },
        });

        if (!patientProfile) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        res.status(200).json({
            abhaNumber: patientProfile.abhaNumber,
            aadharNumber: patientProfile.aadharNumber,
            name: patientProfile.user.name,
            demographics: patientProfile.demographics,
        });
    } catch (error) {
        logger.error(error, `Failed to find patient by ${type}: ${identifier}`);
        next(error);
    }
};

const createConsultation = async (req, res, next) => {
    const { patientIdentifier, identifierType, diagnoses, medications, notes } = req.body;
    const doctorId = req.user.id;

    try {
        const whereClause = identifierType === 'aadhar'
            ? { aadharNumber: patientIdentifier }
            : { abhaNumber: patientIdentifier };

        const patient = await prisma.patientProfile.findUnique({
            where: whereClause,
            include: { user: true }
        });
        if (!patient) {
            return res.status(404).json({ message: `Patient with ${identifierType} number ${patientIdentifier} not found.` });
        }

        const doctor = await prisma.doctorProfile.findUnique({
            where: { userId: doctorId },
            include: { user: true }
        });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found for the current user.' });
        }

        const fhirBundle = fhirService.createFhirBundle({
            patientData: {
                id: patient.id,
                abhaNumber: patient.abhaNumber,
                name: patient.user.name,
                demographics: patient.demographics
            },
            doctorData: {
                id: doctor.id,
                hprId: doctor.hprId,
                name: doctor.user.name,
                specialty: doctor.speciality
            },
            diagnoses,
            medications
        });

        const consultation = await prisma.consultation.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                diagnoses,
                medications,
                notes,
                fhirBundle,
            },
        });

        res.status(201).json({
            message: "Consultation created successfully. This FHIR Bundle would now be sent to the patient's linked Hospital EMR via a secure API.",
            consultation,
            fhirBundle,
        });
    } catch (error) {
        logger.error(error, 'Failed to create consultation.');
        next(error);
    }
};

const getConsultationById = async (req, res, next) => {
    const { id } = req.params;
    const doctorId = req.user.id;

    try {
        const consultation = await prisma.consultation.findFirst({
            where: {
                id,
                doctor: {
                    userId: doctorId
                }
            },
            include: {
                patient: { include: { user: { select: { name: true } } } },
                doctor: { include: { user: { select: { name: true } } } },
            },
        });

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found or you do not have permission to view it.' });
        }
        res.status(200).json(consultation);
    } catch (error) {
        logger.error(error, `Doctor failed to fetch consultation ID: ${id}`);
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getDashboardData,
    uploadLegacyPrescription,
    findPatient,
    createConsultation,
    getConsultationById
};