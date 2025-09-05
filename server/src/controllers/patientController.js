const prisma = require('../lib/db');
const logger = require('../lib/logger');
const pdfService = require('../services/pdfService');

const getProfile = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                patientProfile: true
            }
        });

        if (!user || !user.patientProfile) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            abhaNumber: user.patientProfile.abhaNumber,
            aadharNumber: user.patientProfile.aadharNumber,
            demographics: user.patientProfile.demographics,
            createdAt: user.createdAt,
        });
    } catch (error) {
        logger.error(error, `Failed to get profile for user: ${userId}`);
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    const userId = req.user.id;
    const { name, email, demographics } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                patientProfile: {
                    update: {
                        demographics
                    }
                }
            },
            include: {
                patientProfile: true
            }
        });
        
        // Return the updated profile
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            abhaNumber: user.patientProfile.abhaNumber,
            aadharNumber: user.patientProfile.aadharNumber,
            demographics: user.patientProfile.demographics,
        });

    } catch (error) {
        // Handle potential unique constraint violation for email
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(409).json({ message: 'Email address is already in use.' });
        }
        logger.error(error, `Failed to update profile for user: ${userId}`);
        next(error);
    }
};


const getConsultations = async (req, res, next) => {
    const patientId = req.user.id; // From authMiddleware
    const { page = 1, limit = 10, sort = 'date:desc' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [sortField, sortOrder] = sort.split(':');

    try {
        const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: patientId } });
        if (!patientProfile) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }

        const consultations = await prisma.consultation.findMany({
            where: { patientId: patientProfile.id },
            skip,
            take: limitNum,
            orderBy: {
                [sortField]: sortOrder,
            },
            select: {
                id: true,
                date: true,
                diagnoses: true,
                doctor: {
                    select: {
                        user: {
                            select: { name: true },
                        },
                        speciality: true,
                    },
                },
            },
        });

        const totalRecords = await prisma.consultation.count({ where: { patientId: patientProfile.id } });
        
        const formattedConsultations = consultations.map(c => ({
            id: c.id,
            date: c.date,
            doctorName: c.doctor.user.name,
            doctorSpeciality: c.doctor.speciality,
            summary: c.diagnoses[0]?.name || 'General Consultation'
        }));

        res.status(200).json({
            data: formattedConsultations,
            meta: {
                page: pageNum,
                limit: limitNum,
                totalRecords,
                totalPages: Math.ceil(totalRecords / limitNum),
            },
        });
    } catch (error) {
        logger.error(error, `Failed to get consultations for user: ${patientId}`);
        next(error);
    }
};

const getConsultationById = async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const consultation = await prisma.consultation.findFirst({
            where: {
                id,
                patient: {
                    userId: userId,
                },
            },
            include: {
                doctor: { include: { user: { select: { name: true, } } } },
            },
        });

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found or you do not have permission to view it.' });
        }
        res.status(200).json(consultation);
    } catch (error) {
        logger.error(error, `Patient failed to fetch consultation ID: ${id}`);
        next(error);
    }
};

const downloadConsultationPdf = async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const consultation = await prisma.consultation.findFirst({
            where: {
                id,
                patient: { userId },
            },
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
            },
        });

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found or you do not have permission to view it.' });
        }

        const pdfBuffer = await pdfService.generateConsultationPdf(consultation);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="consultation-${consultation.id}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        logger.error(error, `Failed to generate PDF for consultation ID: ${id}`);
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getConsultations,
    getConsultationById,
    downloadConsultationPdf,
};