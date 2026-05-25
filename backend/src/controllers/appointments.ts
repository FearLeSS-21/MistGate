import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';
import { createNotification } from '../utils/notifications';

const bookSchema = z.object({
  department: z.enum([
    'CIVIL_REGISTRY', 'PASSPORT_OFFICE', 'TRAFFIC_DEPARTMENT',
    'SOCIAL_INSURANCE', 'HEALTH_INSURANCE', 'TAX_AUTHORITY',
    'MILITARY_RECRUITMENT', 'GENERAL_INQUIRY',
  ]),
  date: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  notes: z.string().optional(),
});

const timeSlots = [
  '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
  '11:00-11:30', '11:30-12:00', '12:00-12:30', '12:30-13:00',
  '13:00-13:30', '14:00-14:30', '14:30-15:00', '15:00-15:30',
];

export const getAvailableSlots = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, department } = req.query;

    if (!date || !department) {
      return res.status(400).json({ error: 'Date and department are required.' });
    }

    const dateStart = new Date(date as string);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        department: department as string,
        date: { gte: dateStart, lt: dateEnd },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      select: { timeSlot: true },
    });

    const bookedSlots = existingAppointments.map(a => a.timeSlot);
    const available = timeSlots.filter(slot => !bookedSlots.includes(slot));

    return res.json({ available, allSlots: timeSlots, bookedSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const bookAppointment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const validatedData = bookSchema.parse(req.body);
    const appointmentDate = new Date(validatedData.date);
    appointmentDate.setHours(0, 0, 0, 0);

    // Check if slot is available
    const existing = await prisma.appointment.findFirst({
      where: {
        department: validatedData.department,
        date: appointmentDate,
        timeSlot: validatedData.timeSlot,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'This time slot is already booked.' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.id,
        department: validatedData.department,
        date: appointmentDate,
        timeSlot: validatedData.timeSlot,
        notes: validatedData.notes || null,
      },
    });

    return res.status(201).json({ message: 'Appointment booked successfully.', appointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Book appointment error:', error);
    return res.status(500).json({ error: 'An error occurred while booking.' });
  }
};

export const getMyAppointments = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });

    return res.json({ appointments });
  } catch (error) {
    console.error('Get my appointments error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const cancelAppointment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({ where: { id } });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    if (appointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (appointment.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Can only cancel scheduled appointments.' });
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return res.json({ message: 'Appointment cancelled successfully.' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminGetAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department, status, date } = req.query;
    const where: Record<string, unknown> = {};

    if (department && department !== 'ALL') where.department = department;
    if (status && status !== 'ALL') where.status = status;
    if (date) {
      const dateStart = new Date(date as string);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      where.date = { gte: dateStart, lt: dateEnd };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, nationalId: true, phone: true } },
      },
      orderBy: { date: 'desc' },
    });

    return res.json({ appointments });
  } catch (error) {
    console.error('Admin get appointments error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminUpdateAppointment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: status || undefined, notes: notes !== undefined ? notes : undefined },
    });

    await createNotification({
      userId: appointment.userId,
      title: 'Appointment Updated',
      message: `Your ${appointment.department} appointment on ${appointment.date.toLocaleDateString()} has been updated to ${status || appointment.status}.`,
      type: status === 'CANCELLED' ? 'error' : 'info',
      link: '/appointments',
    });

    return res.json({ message: 'Appointment updated successfully.', appointment: updated });
  } catch (error) {
    console.error('Admin update appointment error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminGetAppointmentStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const total = await prisma.appointment.count();
    const byStatus = await prisma.appointment.groupBy({
      by: ['status'], _count: { _all: true },
    });
    const byDepartment = await prisma.appointment.groupBy({
      by: ['department'], _count: { _all: true },
    });

    const statusCounts: Record<string, number> = { SCHEDULED: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 };
    byStatus.forEach(g => { statusCounts[g.status] = g._count._all; });

    return res.json({ stats: { total, byStatus: statusCounts, byDepartment } });
  } catch (error) {
    console.error('Admin appointment stats error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};
