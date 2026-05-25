import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

export const getActiveAnnouncements = async (_req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching announcements.' });
  }
};

export const adminGetAnnouncements = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ announcements });
  } catch (error) {
    console.error('Admin get announcements error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminCreateAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const announcement = await prisma.announcement.create({
      data: { title, message },
    });

    return res.status(201).json({ message: 'Announcement created.', announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminUpdateAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, message, active } = req.body;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: { ...(title !== undefined && { title }), ...(message !== undefined && { message }), ...(active !== undefined && { active }) },
    });

    return res.json({ message: 'Announcement updated.', announcement });
  } catch (error) {
    console.error('Update announcement error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminDeleteAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id } });
    return res.json({ message: 'Announcement deleted.' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};
