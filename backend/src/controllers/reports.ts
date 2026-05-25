import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

export const adminGetReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period } = req.query;
    const days = period === '90' ? 90 : period === '30' ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      applications,
      complaints,
      appointments,
      users,
      notifications,
      ratings,
      activities,
    ] = await Promise.all([
      prisma.application.findMany({
        where: { createdAt: { gte: since } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complaint.findMany({
        where: { createdAt: { gte: since } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.findMany({
        where: { createdAt: { gte: since } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
      prisma.notification.count({ where: { createdAt: { gte: since } } }),
      prisma.serviceRating.findMany({
        where: { createdAt: { gte: since } },
        include: { application: { select: { serviceType: true } } },
      }),
      prisma.activityLog.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const byService: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    applications.forEach(app => {
      byService[app.serviceType] = (byService[app.serviceType] || 0) + 1;
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;

    return res.json({
      report: {
        generatedAt: new Date().toISOString(),
        period: `${days} days`,
        totalUsers: users,
        totalApplications: applications.length,
        totalComplaints: complaints.length,
        totalAppointments: appointments.length,
        totalNotifications: notifications,
        totalRatings: ratings.length,
        averageRating: avgRating,
        byService,
        byStatus,
        applications,
        complaints,
        appointments,
        activities,
        ratings,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return res.status(500).json({ error: 'An error occurred while generating the report.' });
  }
};
