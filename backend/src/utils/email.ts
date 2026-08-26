import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || 'Zeyad.wael.ali.2003@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || `MisrGate <${SMTP_USER}>`;

export const CONTACT_TO = process.env.CONTACT_TO || SMTP_USER;

export function isSmtpConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export function brandedEmailHtml(opts: {
  title: string;
  body: string;
  locale?: 'en' | 'ar';
}): string {
  const dir = opts.locale === 'ar' ? 'rtl' : 'ltr';
  const align = opts.locale === 'ar' ? 'right' : 'left';
  return `<!DOCTYPE html>
<html lang="${opts.locale === 'ar' ? 'ar' : 'en'}" dir="${dir}">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#e8eef4;font-family:Sora,'Segoe UI',Tahoma,sans-serif;color:#0e1c2f;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#e8eef4;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#f7f9fc;border-radius:14px;overflow:hidden;border:1px solid #cfd8e3;">
        <tr>
          <td style="background:#0e1c2f;color:#f7f9fc;padding:18px 24px;text-align:${align};">
            <div style="font-size:18px;font-weight:800;letter-spacing:-0.03em;">MisrGate · بوابة مصر</div>
            <div style="font-size:12px;opacity:0.78;margin-top:4px;">Egyptian Digital Services</div>
          </td>
        </tr>
        <tr><td style="height:3px;background:linear-gradient(to ${opts.locale === 'ar' ? 'left' : 'right'}, #111 0 33%, #f4f4f4 33% 66%, #c8102e 66% 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:28px 24px;text-align:${align};">
            <h1 style="margin:0 0 12px;font-size:20px;color:#c8102e;">${opts.title}</h1>
            <div style="font-size:15px;line-height:1.65;color:#3d5166;">${opts.body}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#eef3f8;font-size:12px;color:#6b7c8f;text-align:${align};">
            Hotline 15999 · ${CONTACT_TO}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ skipped: boolean }> {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(`[Email] SMTP_PASS is not set; skipped "${opts.subject}" to ${opts.to}`);
    return { skipped: true };
  }
  await mailer.sendMail({
    from: SMTP_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  });
  return { skipped: false };
}
