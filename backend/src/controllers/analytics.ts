import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

export const adminGetAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const days = Math.min(90, Math.max(1, parseInt(req.query.days as string) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalApps, totalUsers, totalComplaints, totalAppointments, totalRatings] = await Promise.all([
      prisma.application.count(),
      prisma.user.count(),
      prisma.complaint.count(),
      prisma.appointment.count(),
      prisma.serviceRating.count(),
    ]);

    const [appsByService, appsByStatus, appsTrend] = await Promise.all([
      prisma.application.groupBy({ by: ['serviceType'], _count: { _all: true } }),
      prisma.application.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.$queryRawUnsafe<Array<{ date: string; count: bigint }>>(
        `SELECT DATE(createdAt) as date, COUNT(*) as count FROM Application WHERE createdAt >= ? GROUP BY DATE(createdAt) ORDER BY date ASC`,
        since
      ),
    ]);

    const [complaintsByCategory, appointmentsByDept, ratingAgg] = await Promise.all([
      prisma.complaint.groupBy({ by: ['category'], _count: { _all: true } }),
      prisma.appointment.groupBy({ by: ['department'], _count: { _all: true } }),
      prisma.serviceRating.aggregate({ _avg: { score: true }, _count: { _all: true } }),
    ]);

    const appsByServiceMap: Record<string, number> = {};
    appsByService.forEach(g => { appsByServiceMap[g.serviceType] = g._count._all; });

    const appsByStatusMap: Record<string, number> = {};
    appsByStatus.forEach(g => { appsByStatusMap[g.status] = g._count._all; });

    const trendData = appsTrend.map(r => ({
      date: r.date,
      count: Number(r.count),
    }));

    const complaintsByCategoryMap: Record<string, number> = {};
    complaintsByCategory.forEach(g => { complaintsByCategoryMap[g.category] = g._count._all; });

    const appointmentsByDeptMap: Record<string, number> = {};
    appointmentsByDept.forEach(g => { appointmentsByDeptMap[g.department] = g._count._all; });

    return res.json({
      overview: {
        totalApplications: totalApps,
        totalUsers,
        totalComplaints,
        totalAppointments,
        totalRatings,
        averageRating: ratingAgg._avg.score || 0,
      },
      appsByService: appsByServiceMap,
      appsByStatus: appsByStatusMap,
      appsTrend: trendData,
      complaintsByCategory: complaintsByCategoryMap,
      appointmentsByDepartment: appointmentsByDeptMap,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'An error occurred fetching analytics.' });
  }
};
