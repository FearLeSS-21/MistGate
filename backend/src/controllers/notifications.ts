import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });

    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching notifications.' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};
