import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

export const getMyTimeline = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const [applications, appointments, complaints, ratings] = await Promise.all([
      prisma.application.findMany({
        where: { userId: req.user.id },
        include: { statusHistory: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complaint.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.serviceRating.findMany({
        where: { userId: req.user.id },
        include: { application: { select: { serviceType: true, trackingCode: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const events: {
      id: string;
      type: 'application' | 'appointment' | 'complaint' | 'rating' | 'status_change';
      title: string;
      description: string;
      status: string;
      date: string;
    }[] = [];

    applications.forEach(app => {
      events.push({
        id: `app-${app.id}`,
        type: 'application',
        title: `${app.serviceType} - ${app.trackingCode}`,
        description: `Application submitted for ${app.serviceType.toLowerCase().replace(/_/g, ' ')}`,
        status: app.status,
        date: app.createdAt.toISOString(),
      });
      app.statusHistory.forEach(sh => {
        events.push({
          id: `sh-${sh.id}`,
          type: 'status_change',
          title: `${app.trackingCode} - ${sh.status}`,
          description: sh.notes || `Status changed to ${sh.status}`,
          status: sh.status,
          date: sh.createdAt.toISOString(),
        });
      });
    });

    appointments.forEach(appt => {
      events.push({
        id: `appt-${appt.id}`,
        type: 'appointment',
        title: `Appointment - ${appt.department}`,
        description: `${appt.date.toISOString().split('T')[0]} at ${appt.timeSlot}`,
        status: appt.status,
        date: appt.createdAt.toISOString(),
      });
    });

    complaints.forEach(c => {
      events.push({
        id: `cmp-${c.id}`,
        type: 'complaint',
        title: `Complaint - ${c.category}`,
        description: c.subject,
        status: c.status,
        date: c.createdAt.toISOString(),
      });
    });

    ratings.forEach(r => {
      events.push({
        id: `rtg-${r.id}`,
        type: 'rating',
        title: `Rating - ${r.application?.serviceType || 'Unknown'}`,
        description: `${r.score} stars${r.review ? ` - ${r.review}` : ''}`,
        status: 'COMPLETED',
        date: r.createdAt.toISOString(),
      });
    });

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({ events, total: events.length });
  } catch (error) {
    console.error('Timeline error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching timeline.' });
  }
};
