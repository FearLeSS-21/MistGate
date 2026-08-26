import { Request, Response } from 'express';
import { z } from 'zod';
import { brandedEmailHtml, CONTACT_TO, sendMail } from '../utils/email';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject is required').max(160),
  message: z.string().min(10, 'Message must be at least 10 characters').max(4000),
  locale: z.enum(['en', 'ar']).optional(),
  website: z.string().optional(),
});

export const submitContact = async (req: Request, res: Response) => {
  try {
    const data = contactSchema.parse(req.body);

    if (data.website) {
      return res.json({ message: 'Message received.' });
    }

    const locale = data.locale === 'ar' ? 'ar' : 'en';
    const adminTitle = locale === 'ar' ? `رسالة اتصال: ${data.subject}` : `Contact: ${data.subject}`;
    const confirmTitle = locale === 'ar' ? 'تم استلام رسالتك — بوابة مصر' : 'We received your message — MisrGate';

    const adminBody = `
      <p><strong>${data.name}</strong> &lt;${data.email}&gt;</p>
      <p>${data.message.replace(/\n/g, '<br/>')}</p>
    `;
    const confirmBody = locale === 'ar'
      ? `<p>مرحباً ${data.name}،</p><p>استلمنا رسالتك بخصوص «${data.subject}». سنرد في أقرب وقت.</p>`
      : `<p>Hello ${data.name},</p><p>We received your message about “${data.subject}”. A specialist will reply as soon as possible.</p>`;

    const adminResult = await sendMail({
      to: CONTACT_TO,
      subject: `[MisrGate] ${data.subject}`,
      html: brandedEmailHtml({ title: adminTitle, body: adminBody, locale }),
      text: `${data.name} <${data.email}>\n\n${data.message}`,
      replyTo: data.email,
    });

    await sendMail({
      to: data.email,
      subject: confirmTitle,
      html: brandedEmailHtml({ title: confirmTitle, body: confirmBody, locale }),
      text: locale === 'ar'
        ? `مرحباً ${data.name}، استلمنا رسالتك بخصوص ${data.subject}.`
        : `Hello ${data.name}, we received your message about ${data.subject}.`,
    });

    if (adminResult.skipped) {
      return res.status(503).json({
        error: locale === 'ar'
          ? 'البريد غير مُعد بعد. أضف SMTP_PASS (كلمة مرور تطبيق Gmail) ثم أعد المحاولة.'
          : 'Email is not configured yet. Add SMTP_PASS (a Gmail App Password) and try again.',
      });
    }

    return res.json({
      message: locale === 'ar' ? 'تم إرسال الرسالة بنجاح.' : 'Message sent successfully.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
};
