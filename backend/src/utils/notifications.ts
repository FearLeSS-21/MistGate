import prisma from './db';
import { brandedEmailHtml, sendMail } from './email';
import { escapeHtml } from './html';

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
      const safeLink = params.link && params.link.startsWith('/') && !params.link.startsWith('//')
        ? `<p><a href="${escapeHtml(params.link)}">Open in MisrGate</a></p>`
        : '';
      const body = `<p>${escapeHtml(params.message)}</p>${safeLink}`;
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
