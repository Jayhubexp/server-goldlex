import nodemailer from 'nodemailer';
import { escapeHtml } from './applicationDetails.js';

function failure(provider, code, reason) {
 // Log only diagnostic codes, never credentials or message contents.
 console.error('Email delivery failed', { provider, code });
 return { sent: false, provider, code, reason };
}

export async function sendEmail(to, subject, text, html = null, options = {}) {
 const provider = (process.env.EMAIL_PROVIDER || 'gmail').trim().toLowerCase();
 const replyTo = options.replyTo || process.env.NOTIFY_EMAIL;
 if (provider === 'brevo') {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return failure(provider, 'EMAIL_CONFIG_MISSING', 'Set BREVO_API_KEY and EMAIL_FROM on the backend. EMAIL_FROM must be a verified Brevo sender.');
  try {
   const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, Accept: 'application/json', 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
     to: [{ email: to }],
     sender: { email: from, name: 'Goldlex Auto' },
     subject,
     textContent: text,
     htmlContent: html || `<div style="white-space:pre-wrap">${escapeHtml(text)}</div>`,
     ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
   });
   if (response.status === 201) {
    // Acceptance is confirmed by HTTP status even if the response body is unreadable.
    const data = await response.json().catch(() => ({}));
    return { sent: true, provider, response: 'Accepted', messageId: data?.messageId };
   }
   const reasons = {
    400: 'Brevo rejected the email request. Check the sender, recipient, and reply-to email addresses.',
    401: 'Brevo authentication failed. Check BREVO_API_KEY on the backend.',
    403: 'Brevo denied the send. Verify EMAIL_FROM, transactional email access, and account status.',
    429: 'Brevo rate or quota limit reached. Check the account limits before retrying.',
   };
   return failure(provider, `BREVO_${response.status}`, reasons[response.status] || 'Brevo is unavailable. Check provider status before retrying.');
  } catch (error) {
   return failure(provider, error.name === 'TimeoutError' ? 'EMAIL_TIMEOUT' : 'EMAIL_NETWORK_ERROR', 'The email provider could not be reached or its response was lost. Check Brevo activity before retrying to avoid a duplicate.');
  }
 }
 if (provider !== 'gmail') return failure(provider, 'EMAIL_PROVIDER_INVALID', 'Set EMAIL_PROVIDER to gmail or brevo on the backend.');
 const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
 if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return failure(provider, 'EMAIL_CONFIG_MISSING', 'Set GMAIL_USER and GMAIL_APP_PASSWORD on the backend, or configure EMAIL_PROVIDER=brevo for HTTPS delivery.');
 const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 587, secure: false,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
 });
 try {
  const info = await transporter.sendMail({
   from: { name: 'Goldlex Auto', address: GMAIL_USER }, to, subject, text,
   ...(html ? { html } : {}), ...(replyTo ? { replyTo } : {}),
  });
  if (!info.accepted?.length) return failure(provider, 'EMAIL_RECIPIENT_REJECTED', 'The mail server did not accept the recipient. Check the borrower email address.');
  return { sent: true, provider, response: info.response };
 } catch (error) {
  if (error.code === 'EAUTH') return failure(provider, 'EMAIL_AUTH_FAILED', 'Gmail rejected the login. Check GMAIL_USER and use a valid Google app password for GMAIL_APP_PASSWORD.');
  if (['ETIMEDOUT', 'ECONNECTION', 'ESOCKET', 'ECONNREFUSED', 'EDNS'].includes(error.code)) {
   return failure(provider, 'EMAIL_SMTP_CONNECTION_FAILED', 'Could not connect to Gmail SMTP. Render Free blocks SMTP port 587; use EMAIL_PROVIDER=brevo with HTTPS delivery or an SMTP-capable host. Check the sending inbox before retrying if delivery is uncertain.');
  }
  if (error.code === 'EENVELOPE') return failure(provider, 'EMAIL_RECIPIENT_REJECTED', 'The mail server rejected the sender or recipient. Check the email addresses.');
  return failure(provider, 'EMAIL_SEND_FAILED', 'The mail server rejected the message. Check the sender account and mail service status.');
 } finally {
  transporter.close?.();
 }
}
