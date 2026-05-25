import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { AuthenticatedRequest } from './auth';

const ratingSchema = z.object({
  score: z.number().int().min(1, 'Score must be at least 1').max(5, 'Score must be at most 5'),
  review: z.string().max(500, 'Review must be under 500 characters').optional(),
});

export const submitRating = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const { applicationId } = req.params;
    const validatedData = ratingSchema.parse(req.body);

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    if (application.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (application.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only rate completed applications.' });
    }

    const existing = await prisma.serviceRating.findUnique({ where: { applicationId } });
    if (existing) {
      return res.status(400).json({ error: 'You have already rated this application.' });
    }

    const rating = await prisma.serviceRating.create({
      data: {
        applicationId,
        userId: req.user.id,
        score: validatedData.score,
        review: validatedData.review || null,
      },
    });

    return res.status(201).json({ message: 'Rating submitted successfully.', rating });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Submit rating error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const getApplicationRating = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicationId } = req.params;

    const rating = await prisma.serviceRating.findUnique({
      where: { applicationId },
    });

    return res.json({ rating });
  } catch (error) {
    console.error('Get rating error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

export const adminGetRatingStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ratings = await prisma.serviceRating.findMany({
      include: {
        application: { select: { serviceType: true, trackingCode: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const aggregate = await prisma.serviceRating.aggregate({
      _avg: { score: true },
      _count: { _all: true },
    });

    const byService = await prisma.serviceRating.groupBy({
      by: ['applicationId'],
      _avg: { score: true },
      _count: { _all: true },
    });

    return res.json({
      ratings,
      stats: {
        total: aggregate._count._all,
        averageScore: aggregate._avg.score || 0,
      },
    });
  } catch (error) {
    console.error('Admin rating stats error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};
