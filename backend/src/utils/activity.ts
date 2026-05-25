import prisma from './db';

export async function logActivity(params: {
  userId?: string;
  userName: string;
  action: string;
  details?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName,
        action: params.action,
        details: params.details || null,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
