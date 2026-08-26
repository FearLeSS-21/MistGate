import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || 'Zeyad.wael.ali.2003@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || `MisrGate <${SMTP_USER}>`;
const CONTACT_TO = process.env.CONTACT_TO || SMTP_USER;

function brandedHtml(title: string, body: string, locale: 'en' | 'ar') {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const align = locale === 'ar' ? 'right' : 'left';
  return `<!DOCTYPE html><html lang="${locale}" dir="${dir}"><body style="margin:0;background:#e8eef4;font-family:Sora,Segoe UI,sans-serif;color:#0e1c2f;">
  <table width="100%" cellpadding="0" style="padding:24px 12px;"><tr><td align="center">
  <table width="560" style="max-width:560px;background:#f7f9fc;border-radius:14px;overflow:hidden;border:1px solid #cfd8e3;">
  <tr><td style="background:#0e1c2f;color:#f7f9fc;padding:18px 24px;text-align:${align};"><div style="font-size:18px;font-weight:800;">MisrGate · بوابة مصر</div></td></tr>
  <tr><td style="height:3px;background:#c8102e;"></td></tr>
  <tr><td style="padding:28px 24px;text-align:${align};"><h1 style="color:#c8102e;font-size:20px;">${title}</h1><div style="line-height:1.65;color:#3d5166;">${body}</div></td></tr>
  </table></td></tr></table></body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message, locale, website } = req.body || {};
  if (website) return res.status(200).json({ message: 'Message received.' });
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
  }
  if (!SMTP_PASS) {
    return res.status(503).json({
      error: locale === 'ar'
        ? 'البريد غير مُعد بعد. أضف SMTP_PASS (كلمة مرور تطبيق Gmail).'
        : 'Email is not configured yet. Add SMTP_PASS (a Gmail App Password).',
    });
  }

  const loc: 'en' | 'ar' = locale === 'ar' ? 'ar' : 'en';
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: CONTACT_TO,
      replyTo: String(email),
      subject: `[MisrGate] ${subject}`,
      html: brandedHtml(
        loc === 'ar' ? `رسالة اتصال: ${subject}` : `Contact: ${subject}`,
        `<p><strong>${name}</strong> &lt;${email}&gt;</p><p>${String(message).replace(/\n/g, '<br/>')}</p>`,
        loc,
      ),
    });
    await transporter.sendMail({
      from: SMTP_FROM,
      to: String(email),
      subject: loc === 'ar' ? 'تم استلام رسالتك — بوابة مصر' : 'We received your message — MisrGate',
      html: brandedHtml(
        loc === 'ar' ? 'تم استلام رسالتك' : 'We received your message',
        loc === 'ar'
          ? `<p>مرحباً ${name}، استلمنا رسالتك بخصوص «${subject}».</p>`
          : `<p>Hello ${name}, we received your message about “${subject}”.</p>`,
        loc,
      ),
    });
    return res.status(200).json({
      message: loc === 'ar' ? 'تم إرسال الرسالة بنجاح.' : 'Message sent successfully.',
    });
  } catch (err) {
    console.error('Vercel contact mail error:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
}
