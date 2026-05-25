import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

const createComplaintSchema = z.object({
  category: z.enum(['SERVICE_QUALITY', 'TECHNICAL_ISSUE', 'SUGGESTION', 'STAFF_CONDUCT', 'DELAY_COMPLAINT', 'OTHER']),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be under 2000 characters'),
});

const respondComplaintSchema = z.object({
  response: z.string().min(1, 'Response is required').max(2000, 'Response must be under 2000 characters'),
});

export const createComplaint = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const validatedData = createComplaintSchema.parse(req.body);

    const complaint = await prisma.complaint.create({
      data: {
        userId: req.user.id,
        category: validatedData.category,
        subject: validatedData.subject,
        message: validatedData.message,
      },
    });

    return res.status(201).json({ message: 'Complaint submitted successfully.', complaint });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create complaint error:', error);
    return res.status(500).json({ error: 'An error occurred while submitting complaint.' });
  }
};

export const getMyComplaints = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const complaints = await prisma.complaint.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ complaints });
  } catch (error) {
    console.error('Get my complaints error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminGetComplaints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, status } = req.query;

    const where: Record<string, unknown> = {};
    if (category && category !== 'ALL') where.category = category;
    if (status && status !== 'ALL') where.status = status;

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, nationalId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ complaints });
  } catch (error) {
    console.error('Admin get complaints error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminRespondToComplaint = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const { id } = req.params;
    const validatedData = respondComplaintSchema.parse(req.body);

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        response: validatedData.response,
        status: 'RESOLVED',
        respondedBy: req.user.name,
      },
    });

    await prisma.notification.create({
      data: {
        userId: complaint.userId,
        title: 'Complaint Response',
        message: `Your complaint "${complaint.subject}" has been responded to.`,
        type: 'success',
        link: '/dashboard',
      },
    });

    return res.json({ message: 'Response submitted successfully.', complaint: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Respond to complaint error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminGetComplaintStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const total = await prisma.complaint.count();
    const byStatus = await prisma.complaint.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const byCategory = await prisma.complaint.groupBy({
      by: ['category'],
      _count: { _all: true },
    });

    const statusCounts: Record<string, number> = { OPEN: 0, UNDER_REVIEW: 0, RESOLVED: 0, CLOSED: 0 };
    byStatus.forEach(g => { statusCounts[g.status] = g._count._all; });

    const categoryCounts: Record<string, number> = {};
    byCategory.forEach(g => { categoryCounts[g.category] = g._count._all; });

    return res.json({ stats: { total, byStatus: statusCounts, byCategory: categoryCounts } });
  } catch (error) {
    console.error('Admin complaint stats error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};
