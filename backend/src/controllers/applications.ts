import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';
import { createNotification } from '../utils/notifications';

// Enums from Prisma Schema
type ServiceType =
  | 'NATIONAL_ID'
  | 'MILITARY_EXEMPTION'
  | 'BIRTH_CERTIFICATE'
  | 'PASSPORT'
  | 'TAX_PAYMENT'
  | 'TRAFFIC_FINE'
  | 'HEALTH_INSURANCE'
  | 'SOCIAL_INSURANCE';
type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

// Zod validations for form data structure based on service types
const nationalIdDataSchema = z.object({
  fullNameAr: z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
  birthDate: z.string().min(1, 'Birth date is required'),
  maritalStatus: z.string().min(1, 'Marital status is required'),
  profession: z.string().min(1, 'Profession is required'),
  address: z.string().min(10, 'Full address is required'),
  motherName: z.string().min(10, 'Mother name must be at least 10 characters'),
  reason: z.enum(['first_time', 'renewal', 'lost_replacement', 'damaged_replacement']),
});

const militaryExemptionDataSchema = z.object({
  fullNameAr: z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
  reason: z.enum(['sole_breadwinner', 'medical', 'temporary_student', 'final_exemption']),
  familyStatus: z.string().min(5, 'Family status explanation is required'),
});

const birthCertificateDataSchema = z.object({
  fullNameAr: z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
  motherNameAr: z.string().min(10, 'Mother Arabic Name must be at least 10 characters'),
  fatherNameAr: z.string().min(10, 'Father Arabic Name must be at least 10 characters'),
  gender: z.enum(['male', 'female']),
  placeOfBirth: z.string().min(3, 'Place of birth is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
});

const passportDataSchema = z.object({
  fullNameEn: z.string().min(10, 'Full English Name must be at least 10 characters'),
  fullNameAr: z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
  profession: z.string().min(1, 'Profession is required'),
  maritalStatus: z.string().min(1, 'Marital status is required'),
  qualification: z.string().min(2, 'Educational qualification is required'),
});

const taxPaymentDataSchema = z.object({
  fullNameAr: z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
  taxRegistrationNumber: z.string().min(5, 'Tax registration number is required'),
  paymentType: z.enum(['income_tax', 'vat', 'withholding', 'stamp_duty', 'penalty']),
  taxPeriod: z.string().min(1, 'Tax period is required'),
  amount: z.string().min(1, 'Amount is required'),
  paymentMethod: z.enum(['card', 'bank_transfer', 'fawry', 'wallet']),
});

const trafficFineDataSchema = z.object({
  fullNameAr: z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
  licensePlate: z.string().min(3, 'License plate is required'),
  violationReference: z.string().min(3, 'Violation reference is required'),
  governorate: z.string().min(2, 'Governorate is required'),
  fineAmount: z.string().min(1, 'Fine amount is required'),
});

const healthInsuranceDataSchema = z.object({
  fullNameAr: z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
  coverageType: z.enum(['individual', 'family', 'student', 'retiree']),
  employerName: z.string().optional(),
  dependentsCount: z.string().min(1, 'Number of dependents is required'),
});

const socialInsuranceDataSchema = z.object({
  fullNameAr: z.string().min(10, 'Full Arabic Name must be at least 10 characters'),
  employerName: z.string().min(2, 'Employer name is required'),
  contributionType: z.enum(['employee', 'voluntary', 'pension']),
  monthlyIncomeBracket: z.enum(['under_5k', '5k_15k', '15k_30k', 'over_30k']),
});

// Helper: Generate Unique Tracking Code
async function generateUniqueTrackingCode(): Promise<string> {
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

    const existing = await prisma.application.findUnique({
      where: { trackingCode: code },
    });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
}

// 1. Citizen: Submit New Application
export const createApplication = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

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
      } else if (serviceType === 'MILITARY_EXEMPTION') {
        parsedData = militaryExemptionDataSchema.parse(data);
      } else if (serviceType === 'BIRTH_CERTIFICATE') {
        parsedData = birthCertificateDataSchema.parse(data);
      } else if (serviceType === 'PASSPORT') {
        parsedData = passportDataSchema.parse(data);
      } else if (serviceType === 'TAX_PAYMENT') {
        parsedData = taxPaymentDataSchema.parse(data);
      } else if (serviceType === 'TRAFFIC_FINE') {
        parsedData = trafficFineDataSchema.parse(data);
      } else if (serviceType === 'HEALTH_INSURANCE') {
        parsedData = healthInsuranceDataSchema.parse(data);
      } else if (serviceType === 'SOCIAL_INSURANCE') {
        parsedData = socialInsuranceDataSchema.parse(data);
      } else {
        return res.status(400).json({ error: 'Invalid serviceType.' });
      }
    } catch (valError) {
      if (valError instanceof z.ZodError) {
        return res.status(400).json({ error: valError.errors[0].message });
      }
      throw valError;
    }

    const trackingCode = await generateUniqueTrackingCode();

    // Create the Application record
    const application = await prisma.application.create({
      data: {
        trackingCode,
        serviceType: serviceType as ServiceType,
        data: JSON.stringify(parsedData),
        attachmentUrl: attachmentUrl || null,
        userId: req.user.id,
      },
    });

    // Create status history log
    await prisma.statusHistory.create({
      data: {
        applicationId: application.id,
        status: 'PENDING',
        notes: 'Application submitted successfully and is awaiting review.',
        changedBy: 'System',
      },
    });

    return res.status(201).json({
      message: 'Application submitted successfully',
      trackingCode,
      application,
    });
  } catch (error) {
    console.error('Create application error:', error);
    return res.status(500).json({ error: 'An error occurred while creating the application.' });
  }
};

// 2. Citizen: Get User Applications
export const getMyApplications = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const applications = await prisma.application.findMany({
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
  } catch (error) {
    console.error('Get my applications error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching your applications.' });
  }
};

// 3. Public: Track Application by Code
export const trackApplication = async (req: Request, res: Response) => {
  try {
    const { trackingCode } = req.params;

    if (!trackingCode) {
      return res.status(400).json({ error: 'Tracking code is required.' });
    }

    const application = await prisma.application.findUnique({
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
  } catch (error) {
    console.error('Track application error:', error);
    return res.status(500).json({ error: 'An error occurred while tracking.' });
  }
};

// 4. Admin: List All Applications (with pagination and search)
export const adminGetApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const statusFilter = (req.query.status as string) || '';
    const serviceFilter = (req.query.serviceType as string) || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

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
      prisma.application.findMany({
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
      prisma.application.count({ where }),
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
  } catch (error) {
    console.error('Admin get applications error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching applications.' });
  }
};

// 5. Admin: Update Application Status
export const adminUpdateStatus = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses: ApplicationStatus[] = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid or missing status.' });
    }

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Update status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: status as ApplicationStatus,
        notes: notes || null,
      },
    });

    // Log the change in history
    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        status: status as ApplicationStatus,
        notes: notes || `Status changed to ${status}.`,
        changedBy: req.user.name,
      },
    });

    // Notify the citizen about the status change
    await createNotification({
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
  } catch (error) {
    console.error('Admin update status error:', error);
    return res.status(500).json({ error: 'An error occurred while updating status.' });
  }
};

// 6. Admin: Get Dashboard Statistics
export const adminGetStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const total = await prisma.application.count();
    
    // Group counts by status
    const byStatus = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    // Group counts by service type
    const byService = await prisma.application.groupBy({
      by: ['serviceType'],
      _count: {
        _all: true,
      },
    });

    // Count of registered users
    const totalUsers = await prisma.user.count({
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

    const serviceCounts: Record<string, number> = {
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
  } catch (error) {
    console.error('Admin get stats error:', error);
    return res.status(500).json({ error: 'An error occurred while retrieving statistics.' });
  }
};
