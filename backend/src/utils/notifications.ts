import prisma from './db';

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'info',
      link: params.link || null,
    },
  });
}
