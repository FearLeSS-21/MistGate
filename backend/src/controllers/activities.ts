import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

export const adminGetActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 30));
    const action = ((req.query.action as string) || '').slice(0, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (action) where.action = action;

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return res.json({
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin get activities error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminGetRecentActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.json({ activities });
  } catch (error) {
    console.error('Admin get recent activities error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};
