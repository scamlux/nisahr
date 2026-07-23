import { Logger } from '@nestjs/common';

const logger = new Logger('Mail');

/** True when a real transactional-email provider is configured. */
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Public base URL of the web app, used to build links inside emails. */
export function appUrl(): string {
  return (process.env.APP_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a transactional email via Resend's HTTP API using native `fetch` — no
 * SDK dependency, matching the AI/search provider pattern in this codebase.
 *
 * When `RESEND_API_KEY` is absent the message is logged instead of sent, so the
 * zero-key / local flow stays fully testable. Returns true only when the email
 * was actually dispatched.
 */
export async function sendEmail(msg: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim() || 'CareerOS <onboarding@resend.dev>';

  if (!apiKey) {
    logger.log(`[dev, no RESEND_API_KEY] Email to ${msg.to} — "${msg.subject}"\n${msg.text ?? msg.html}`);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text }),
    });
    if (!res.ok) {
      logger.error(`Resend send failed (${res.status}): ${await res.text().catch(() => '')}`);
      return false;
    }
    return true;
  } catch (err) {
    logger.error(`Resend send error: ${(err as Error).message}`);
    return false;
  }
}
