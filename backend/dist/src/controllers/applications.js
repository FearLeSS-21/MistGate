"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetStats = exports.cancelApplication = exports.adminUpdateStatus = exports.adminGetApplications = exports.trackApplication = exports.getMyApplications = exports.createApplication = void 0;
const zod_1 = require("zod");
const db_1 = __importDefault(require("../utils/db"));
const notifications_1 = require("../utils/notifications");
const activity_1 = require("../utils/activity");
// Zod validations for form data structure based on service types
const nationalIdDataSchema = zod_1.z.object({
    fullNameAr: zod_1.z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
    birthDate: zod_1.z.string().min(1, 'Birth date is required'),
    maritalStatus: zod_1.z.string().min(1, 'Marital status is required'),
    profession: zod_1.z.string().min(1, 'Profession is required'),
    address: zod_1.z.string().min(10, 'Full address is required'),
    motherName: zod_1.z.string().min(10, 'Mother name must be at least 10 characters'),
    reason: zod_1.z.enum(['first_time', 'renewal', 'lost_replacement', 'damaged_replacement']),
});
const militaryExemptionDataSchema = zod_1.z.object({
    fullNameAr: zod_1.z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
    reason: zod_1.z.enum(['sole_breadwinner', 'medical', 'temporary_student', 'final_exemption']),
    familyStatus: zod_1.z.string().min(5, 'Family status explanation is required'),
});
const birthCertificateDataSchema = zod_1.z.object({
    fullNameAr: zod_1.z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
    motherNameAr: zod_1.z.string().min(10, 'Mother Arabic Name must be at least 10 characters'),
    fatherNameAr: zod_1.z.string().min(10, 'Father Arabic Name must be at least 10 characters'),
    gender: zod_1.z.enum(['male', 'female']),
    placeOfBirth: zod_1.z.string().min(3, 'Place of birth is required'),
    birthDate: zod_1.z.string().min(1, 'Birth date is required'),
});
const passportDataSchema = zod_1.z.object({
    fullNameEn: zod_1.z.string().min(10, 'Full English Name must be at least 10 characters'),
    fullNameAr: zod_1.z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
    profession: zod_1.z.string().min(1, 'Profession is required'),
    maritalStatus: zod_1.z.string().min(1, 'Marital status is required'),
    qualification: zod_1.z.string().min(2, 'Educational qualification is required'),
});
const taxPaymentDataSchema = zod_1.z.object({
    fullNameAr: zod_1.z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
    taxRegistrationNumber: zod_1.z.string().min(5, 'Tax registration number is required'),
    paymentType: zod_1.z.enum(['income_tax', 'vat', 'withholding', 'stamp_duty', 'penalty']),
    taxPeriod: zod_1.z.string().min(1, 'Tax period is required'),
    amount: zod_1.z.string().min(1, 'Amount is required'),
    paymentMethod: zod_1.z.enum(['card', 'bank_transfer', 'fawry', 'wallet']),
});
const trafficFineDataSchema = zod_1.z.object({
    fullNameAr: zod_1.z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
    licensePlate: zod_1.z.string().min(3, 'License plate is required'),
    violationReference: zod_1.z.string().min(3, 'Violation reference is required'),
    governorate: zod_1.z.string().min(2, 'Governorate is required'),
    fineAmount: zod_1.z.string().min(1, 'Fine amount is required'),
});
const healthInsuranceDataSchema = zod_1.z.object({
    fullNameAr: zod_1.z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
    coverageType: zod_1.z.enum(['individual', 'family', 'student', 'retiree']),
    employerName: zod_1.z.string().optional(),
    dependentsCount: zod_1.z.string().min(1, 'Number of dependents is required'),
});
const socialInsuranceDataSchema = zod_1.z.object({
    fullNameAr: zod_1.z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
    employerName: zod_1.z.string().min(2, 'Employer name is required'),
    contributionType: zod_1.z.enum(['employee', 'voluntary', 'pension']),
    monthlyIncomeBracket: zod_1.z.enum(['under_5k', '5k_15k', '15k_30k', 'over_30k']),
});
// Helper: Generate Unique Tracking Code
async function generateUniqueTrackingCode() {
    const chars = '0123456789';
    let isUnique = false;
    let code = '';
    while (!isUnique) {
        let segment1 = '';
        let segment2 = '';
        for (let i = 0; i < 4; i++) {
            segment1 += chars.charAt(Math.floor(Math.random() * chars.length));
            segment2 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        code = `MG-${segment1}-${segment2}`;
        const existing = await db_1.default.application.findUnique({
            where: { trackingCode: code },
        });
        if (!existing) {
            isUnique = true;
        }
    }
    return code;
}
// 1. Citizen: Submit New Application
const createApplication = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized.' });
    try {
        const { serviceType, data, attachmentUrl } = req.body;
        if (!serviceType) {
            return res.status(400).json({ error: 'serviceType is required.' });
        }
        // Validate form details based on Service Type
        let parsedData = {};
        try {
            if (serviceType === 'NATIONAL_ID') {
                parsedData = nationalIdDataSchema.parse(data);
            }
            else if (serviceType === 'MILITARY_EXEMPTION') {
                parsedData = militaryExemptionDataSchema.parse(data);
            }
            else if (serviceType === 'BIRTH_CERTIFICATE') {
                parsedData = birthCertificateDataSchema.parse(data);
            }
            else if (serviceType === 'PASSPORT') {
                parsedData = passportDataSchema.parse(data);
            }
            else if (serviceType === 'TAX_PAYMENT') {
                parsedData = taxPaymentDataSchema.parse(data);
            }
            else if (serviceType === 'TRAFFIC_FINE') {
                parsedData = trafficFineDataSchema.parse(data);
            }
            else if (serviceType === 'HEALTH_INSURANCE') {
                parsedData = healthInsuranceDataSchema.parse(data);
            }
            else if (serviceType === 'SOCIAL_INSURANCE') {
                parsedData = socialInsuranceDataSchema.parse(data);
            }
            else {
                return res.status(400).json({ error: 'Invalid serviceType.' });
            }
        }
        catch (valError) {
            if (valError instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: valError.errors[0].message });
            }
            throw valError;
        }
        const trackingCode = await generateUniqueTrackingCode();
        // Create the Application record
        const application = await db_1.default.application.create({
            data: {
                trackingCode,
                serviceType: serviceType,
                data: JSON.stringify(parsedData),
                attachmentUrl: attachmentUrl || null,
                userId: req.user.id,
            },
        });
        // Create status history log
        await db_1.default.statusHistory.create({
            data: {
                applicationId: application.id,
                status: 'PENDING',
                notes: 'Application submitted successfully and is awaiting review.',
                changedBy: 'System',
            },
        });
        await (0, activity_1.logActivity)({
            userId: req.user.id,
            userName: req.user.name,
            action: 'SUBMIT_APPLICATION',
            details: `Submitted ${serviceType} application with tracking code ${trackingCode}`,
        });
        return res.status(201).json({
            message: 'Application submitted successfully',
            trackingCode,
            application,
        });
    }
    catch (error) {
        console.error('Create application error:', error);
        return res.status(500).json({ error: 'An error occurred while creating the application.' });
    }
};
exports.createApplication = createApplication;
// 2. Citizen: Get User Applications
const getMyApplications = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized.' });
    try {
        const applications = await db_1.default.application.findMany({
            where: { userId: req.user.id },
            include: {
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Parse stringified JSON before returning
        const formatted = applications.map(app => ({
            ...app,
            data: JSON.parse(app.data),
        }));
        return res.json({ applications: formatted });
    }
    catch (error) {
        console.error('Get my applications error:', error);
        return res.status(500).json({ error: 'An error occurred while fetching your applications.' });
    }
};
exports.getMyApplications = getMyApplications;
// 3. Public: Track Application by Code
const trackApplication = async (req, res) => {
    try {
        const { trackingCode } = req.params;
        if (!trackingCode) {
            return res.status(400).json({ error: 'Tracking code is required.' });
        }
        const application = await db_1.default.application.findUnique({
            where: { trackingCode },
            include: {
                statusHistory: {
                    orderBy: { createdAt: 'asc' }, // timeline order
                },
            },
        });
        if (!application) {
            return res.status(404).json({ error: 'Application not found. Please verify the tracking code.' });
        }
        // Safely strip user and detail information if required, or return clean tracking details
        return res.json({
            trackingCode: application.trackingCode,
            serviceType: application.serviceType,
            status: application.status,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
            statusHistory: application.statusHistory,
        });
    }
    catch (error) {
        console.error('Track application error:', error);
        return res.status(500).json({ error: 'An error occurred while tracking.' });
    }
};
exports.trackApplication = trackApplication;
// 4. Admin: List All Applications (with pagination and search)
const adminGetApplications = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const search = (req.query.search || '').slice(0, 100);
        const statusFilter = req.query.status || '';
        const serviceFilter = req.query.serviceType || '';
        const skip = (page - 1) * limit;
        const where = {};
        if (statusFilter && statusFilter !== 'ALL') {
            where.status = statusFilter;
        }
        if (serviceFilter && serviceFilter !== 'ALL') {
            where.serviceType = serviceFilter;
        }
        if (search) {
            where.OR = [
                { trackingCode: { contains: search } },
                { user: { name: { contains: search } } },
                { user: { nationalId: { contains: search } } },
                { user: { email: { contains: search } } },
            ];
        }
        const [applications, total] = await Promise.all([
            db_1.default.application.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            nationalId: true,
                            phone: true,
                        },
                    },
                    statusHistory: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            db_1.default.application.count({ where }),
        ]);
        const formatted = applications.map(app => ({
            ...app,
            data: JSON.parse(app.data),
        }));
        return res.json({
            applications: formatted,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Admin get applications error:', error);
        return res.status(500).json({ error: 'An error occurred while fetching applications.' });
    }
};
exports.adminGetApplications = adminGetApplications;
// 5. Admin: Update Application Status
const adminUpdateStatus = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized.' });
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid or missing status.' });
        }
        const application = await db_1.default.application.findUnique({
            where: { id },
        });
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }
        // Update status
        const updatedApplication = await db_1.default.application.update({
            where: { id },
            data: {
                status: status,
                notes: notes || null,
            },
        });
        // Log the change in history
        await db_1.default.statusHistory.create({
            data: {
                applicationId: id,
                status: status,
                notes: notes || `Status changed to ${status}.`,
                changedBy: req.user.name,
            },
        });
        // Log the activity
        await (0, activity_1.logActivity)({
            userId: req.user.id,
            userName: req.user.name,
            action: 'UPDATE_APPLICATION_STATUS',
            details: `Status changed to ${status} for application ${application.trackingCode} (${application.serviceType})`,
        });
        // Notify the citizen about the status change
        await (0, notifications_1.createNotification)({
            userId: application.userId,
            title: 'Application Status Updated',
            message: `Your ${application.serviceType} application (${application.trackingCode}) status changed to ${status}.`,
            type: status === 'APPROVED' || status === 'COMPLETED' ? 'success' : status === 'REJECTED' ? 'error' : 'info',
            link: '/dashboard',
        });
        return res.json({
            message: 'Application status updated successfully',
            application: updatedApplication,
        });
    }
    catch (error) {
        console.error('Admin update status error:', error);
        return res.status(500).json({ error: 'An error occurred while updating status.' });
    }
};
exports.adminUpdateStatus = adminUpdateStatus;
// 6. Citizen: Cancel Own Application
const cancelApplication = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized.' });
    try {
        const { id } = req.params;
        const application = await db_1.default.application.findUnique({ where: { id } });
        if (!application)
            return res.status(404).json({ error: 'Application not found.' });
        if (application.userId !== req.user.id)
            return res.status(403).json({ error: 'You can only cancel your own applications.' });
        if (application.status !== 'PENDING')
            return res.status(400).json({ error: 'Only pending applications can be cancelled.' });
        await db_1.default.application.update({ where: { id }, data: { status: 'REJECTED', notes: 'Cancelled by applicant.' } });
        await db_1.default.statusHistory.create({ data: { applicationId: id, status: 'REJECTED', notes: 'Application cancelled by citizen.', changedBy: req.user.name } });
        await (0, activity_1.logActivity)({ userId: req.user.id, userName: req.user.name, action: 'CANCEL_APPLICATION', details: `Cancelled application ${application.trackingCode}` });
        return res.json({ message: 'Application cancelled successfully.' });
    }
    catch (error) {
        console.error('Cancel application error:', error);
        return res.status(500).json({ error: 'An error occurred while cancelling.' });
    }
};
exports.cancelApplication = cancelApplication;
// 7. Admin: Get Dashboard Statistics
const adminGetStats = async (req, res) => {
    try {
        const total = await db_1.default.application.count();
        // Group counts by status
        const byStatus = await db_1.default.application.groupBy({
            by: ['status'],
            _count: {
                _all: true,
            },
        });
        // Group counts by service type
        const byService = await db_1.default.application.groupBy({
            by: ['serviceType'],
            _count: {
                _all: true,
            },
        });
        // Count of registered users
        const totalUsers = await db_1.default.user.count({
            where: { role: 'CITIZEN' },
        });
        // Clean up response structure
        const statusCounts = {
            PENDING: 0,
            UNDER_REVIEW: 0,
            APPROVED: 0,
            REJECTED: 0,
            COMPLETED: 0,
        };
        byStatus.forEach(group => {
            statusCounts[group.status] = group._count._all;
        });
        const serviceCounts = {
            NATIONAL_ID: 0,
            MILITARY_EXEMPTION: 0,
            BIRTH_CERTIFICATE: 0,
            PASSPORT: 0,
            TAX_PAYMENT: 0,
            TRAFFIC_FINE: 0,
            HEALTH_INSURANCE: 0,
            SOCIAL_INSURANCE: 0,
        };
        byService.forEach(group => {
            serviceCounts[group.serviceType] = group._count._all;
        });
        return res.json({
            stats: {
                totalApplications: total,
                totalUsers,
                byStatus: statusCounts,
                byService: serviceCounts,
            },
        });
    }
    catch (error) {
        console.error('Admin get stats error:', error);
        return res.status(500).json({ error: 'An error occurred while retrieving statistics.' });
    }
};
exports.adminGetStats = adminGetStats;
