import prisma from './db';
import { brandedEmailHtml, sendMail } from './email';

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'info',
      link: params.link || null,
    },
  });

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, name: true },
    });
    if (user?.email) {
      const body = `<p>${params.message}</p>${params.link ? `<p><a href="${params.link}">Open in MisrGate</a></p>` : ''}`;
      await sendMail({
        to: user.email,
        subject: `MisrGate · ${params.title}`,
        html: brandedEmailHtml({ title: params.title, body }),
        text: params.message,
      });
    }
  } catch (err) {
    console.error('[Email] Notification mail failed:', err);
  }

  return notification;
}
