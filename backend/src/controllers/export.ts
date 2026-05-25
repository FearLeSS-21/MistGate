import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
}

export const exportApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apps = await prisma.application.findMany({
      include: { user: { select: { name: true, email: true, nationalId: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Tracking Code', 'Service Type', 'Status', 'Citizen Name', 'National ID', 'Email', 'Created At', 'Updated At'];
    const rows = apps.map(a => [
      a.trackingCode, a.serviceType, a.status,
      a.user?.name || '', a.user?.nationalId || '', a.user?.email || '',
      a.createdAt.toISOString(), a.updatedAt.toISOString(),
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
    return res.send(toCSV(headers, rows));
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Export failed.' });
  }
};

export const exportComplaints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await prisma.complaint.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Category', 'Subject', 'Status', 'Citizen', 'Email', 'Created At'];
    const rows = data.map(c => [
      c.id, c.category, c.subject, c.status,
      c.user?.name || '', c.user?.email || '',
      c.createdAt.toISOString(),
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
    return res.send(toCSV(headers, rows));
  } catch (error) {
    console.error('Export complaints error:', error);
    return res.status(500).json({ error: 'Export failed.' });
  }
};

export const exportAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await prisma.appointment.findMany({
      include: { user: { select: { name: true, nationalId: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Department', 'Date', 'Time Slot', 'Status', 'Citizen', 'National ID', 'Created At'];
    const rows = data.map(a => [
      a.id, a.department, a.date.toISOString().split('T')[0], a.timeSlot, a.status,
      a.user?.name || '', a.user?.nationalId || '',
      a.createdAt.toISOString(),
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments.csv');
    return res.send(toCSV(headers, rows));
  } catch (error) {
    console.error('Export appointments error:', error);
    return res.status(500).json({ error: 'Export failed.' });
  }
};
