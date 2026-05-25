import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

export const getMyFavorites = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const favorites = await prisma.favoriteService.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ favorites: favorites.map(f => f.serviceType) });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching favorites.' });
  }
};

export const toggleFavorite = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const { serviceType } = req.body;

    if (!serviceType) {
      return res.status(400).json({ error: 'Service type is required.' });
    }

    const existing = await prisma.favoriteService.findUnique({
      where: { userId_serviceType: { userId: req.user.id, serviceType } },
    });

    if (existing) {
      await prisma.favoriteService.delete({ where: { id: existing.id } });
      return res.json({ message: 'Removed from favorites.', favorited: false });
    }

    await prisma.favoriteService.create({
      data: { userId: req.user.id, serviceType },
    });

    return res.json({ message: 'Added to favorites.', favorited: true });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};
