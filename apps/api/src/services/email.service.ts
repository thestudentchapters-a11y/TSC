import { env } from '../config/env';

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Base email layout wrapping all transactional and broadcast emails with TSC brand styling.
 */
function wrapBrandTemplate(content: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>THE STUDENT CHAPTERS</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8F7F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111827; }
    table { border-collapse: separate; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header-bar { height: 6px; background: linear-gradient(90deg, #1457A2 0%, #F6A61D 50%, #1457A2 100%); }
    .header { padding: 28px 36px 20px; text-align: center; border-bottom: 1px solid #F3F4F6; }
    .logo-text { font-size: 20px; font-weight: 800; letter-spacing: 0.15em; color: #1457A2; text-decoration: none; text-transform: uppercase; }
    .logo-sub { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.25em; color: #9CA3AF; text-transform: uppercase; margin-top: 4px; }
    .body-content { padding: 32px 36px; font-size: 15px; line-height: 1.65; color: #374151; }
    .btn { display: inline-block; background-color: #1457A2; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase; margin: 20px 0; }
    .btn:hover { background-color: #0E3E75; }
    .code-box { background: #F3F4F6; border: 1px dashed #D1D5DB; border-radius: 8px; padding: 16px; text-align: center; font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 0.25em; color: #1457A2; margin: 20px 0; }
    .footer { padding: 24px 36px; background-color: #FAFAFA; border-top: 1px solid #F3F4F6; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5; }
    .footer a { color: #1457A2; text-decoration: underline; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <div style="padding: 24px 12px;">
    <div class="container">
      <div class="header-bar"></div>
      <div class="header">
        <a href="${env.clientUrl}" class="logo-text">THE STUDENT CHAPTERS</a>
        <span class="logo-sub">National Student Media &amp; Knowledge Network</span>
      </div>
      <div class="body-content">
        ${content}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} THE STUDENT CHAPTERS™. All rights reserved.</p>
        <p style="margin: 0 0 8px;">Independent student journalism, academic intelligence, and campus career awareness.</p>
        <p style="margin: 0;"><a href="${env.clientUrl}">Website</a> &bull; <a href="${env.clientUrl}/contact">Support &amp; Inquiries</a> &bull; <a href="${env.clientUrl}/legal-awareness">Privacy &amp; Terms</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Universal Resend Email Service
 */
export const emailService = {
  /**
   * Low-level send method connecting to Resend API
   */
  async send(payload: SendEmailPayload): Promise<{ ok: boolean; id?: string; error?: string }> {
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    const apiKey = env.resendApiKey || process.env.RESEND_API_KEY;
    const fromAddress = payload.from || env.emailFrom || 'THE STUDENT CHAPTERS <onboarding@resend.dev>';

    if (!apiKey) {
      console.log(`\n================== [DEV EMAIL SERVICE SIMULATION] ==================`);
      console.log(`[Resend API Key not set - Email logged to console]`);
      console.log(`From:    ${fromAddress}`);
      console.log(`To:      ${recipients.join(', ')}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Time:    ${new Date().toISOString()}`);
      console.log(`====================================================================\n`);
      return { ok: true, id: `dev_mock_${Date.now()}` };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: recipients,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          reply_to: payload.replyTo,
        }),
      });

      const data = (await response.json()) as { id?: string; message?: string; name?: string };

      if (!response.ok) {
        console.error('[Resend Error]:', data);
        return { ok: false, error: data.message || 'Failed to send email via Resend' };
      }

      return { ok: true, id: data.id };
    } catch (err: any) {
      console.error('[Email Service Exception]:', err);
      return { ok: false, error: err.message || 'Network error sending email' };
    }
  },

  /**
   * Send Account Verification Email (with token link & 6-digit code)
   */
  async sendAccountVerification(email: string, name: string, token: string, code?: string) {
    const verifyUrl = `${env.clientUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const htmlContent = `
      <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Verify your TSC account</h2>
      <p>Hello <strong>${name || 'Student'}</strong>,</p>
      <p>Thank you for creating an account on <strong>THE STUDENT CHAPTERS™</strong>. Please confirm your email address to unlock full member access, article submissions, and campus news sharing.</p>
      
      ${code ? `
        <p style="margin-bottom: 4px; font-weight: 600; color: #4B5563;">Your verification code:</p>
        <div class="code-box">${code}</div>
      ` : ''}

      <div style="text-align: center; margin: 28px 0;">
        <a href="${verifyUrl}" class="btn" style="color: #ffffff !important;">Verify Email Address &rarr;</a>
      </div>

      <p style="font-size: 13px; color: #6B7280; line-height: 1.5;">
        Or copy and paste this verification link into your browser:<br>
        <a href="${verifyUrl}" style="color: #1457A2; word-break: break-all;">${verifyUrl}</a>
      </p>

      <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
        If you did not create an account on TSC, you can safely ignore this email. This link will expire in 24 hours.
      </p>
    `;

    return this.send({
      to: email,
      subject: 'Verify your TSC Account — The Student Chapters',
      html: wrapBrandTemplate(htmlContent, 'Confirm your email to complete your registration on THE STUDENT CHAPTERS.'),
    });
  },

  /**
   * Send Newsletter Subscription Welcome / Confirmation
   */
  async sendNewsletterWelcome(email: string) {
    const htmlContent = `
      <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Welcome to THE STUDENT CHAPTERS™ Newsletter</h2>
      <p>Hello,</p>
      <p>You are now officially subscribed to the <strong>TSC Student Journalism &amp; Affairs Dispatch</strong>.</p>
      <p>Here is what you can expect in your inbox:</p>
      <ul style="padding-left: 20px; line-height: 1.7; color: #4B5563;">
        <li><strong>Monthly Current Affairs Dossiers</strong>: Comprehensive student-focused geopolitical, national, and socio-economic briefs.</li>
        <li><strong>Student &amp; Campus Stories</strong>: Ground-level journalism highlighting student innovators, researchers, and changemakers across India.</li>
        <li><strong>Career &amp; Opportunity Radar</strong>: Verified internships, competitive exams, fellowships, and scholarships.</li>
      </ul>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${env.clientUrl}/current-affairs" class="btn" style="color: #ffffff !important;">Explore Latest Current Affairs &rarr;</a>
      </div>
      <p style="font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 16px;">
        You received this email because ${email} subscribed on our website. No spam, ever.
      </p>
    `;

    return this.send({
      to: email,
      subject: 'Welcome to THE STUDENT CHAPTERS™ Dispatch',
      html: wrapBrandTemplate(htmlContent, 'You are now subscribed to the TSC Newsletter & Monthly Current Affairs.'),
    });
  },

  /**
   * Send Submission Receipt (for Story, Campus News, Hiring)
   */
  async sendSubmissionReceipt(email: string, name: string, submissionType: string, title: string) {
    const htmlContent = `
      <h2 style="margin-top: 0; color: #111827; font-size: 20px;">We received your ${submissionType}</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for your submission to <strong>THE STUDENT CHAPTERS™</strong>.</p>
      <div style="background: #F9FAFB; border-left: 4px solid #F6A61D; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">${title}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">Type: ${submissionType}</p>
      </div>
      <p>Our editorial and review team will examine your submission according to our editorial standards. You will receive updates as the review progresses.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${env.clientUrl}/dashboard" class="btn" style="color: #ffffff !important;">View in Dashboard &rarr;</a>
      </div>
    `;

    return this.send({
      to: email,
      subject: `Received: ${submissionType} — ${title}`,
      html: wrapBrandTemplate(htmlContent, `Your ${submissionType} has been received and is being reviewed.`),
    });
  },

  /**
   * Send Custom Broadcast Announcement to Subscribers or Members
   */
  async sendBroadcastNotification(
    recipients: string[],
    data: {
      subject: string;
      previewText?: string;
      heading?: string;
      body: string;
      buttonLabel?: string;
      buttonUrl?: string;
    }
  ): Promise<{ sentCount: number; failedCount: number; errors: string[] }> {
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Format body paragraphs with linebreaks
    const formattedBody = data.body
      .split('\n\n')
      .map((p) => `<p style="margin: 0 0 16px; line-height: 1.7; color: #374151;">${p.replace(/\n/g, '<br>')}</p>`)
      .join('');

    const htmlContent = `
      ${data.heading ? `<h2 style="margin-top: 0; color: #111827; font-size: 22px; font-weight: 800;">${data.heading}</h2>` : ''}
      <div style="font-size: 15px; color: #374151;">
        ${formattedBody}
      </div>
      ${
        data.buttonLabel && data.buttonUrl
          ? `<div style="text-align: center; margin: 28px 0;">
              <a href="${data.buttonUrl}" class="btn" style="color: #ffffff !important;">${data.buttonLabel} &rarr;</a>
             </div>`
          : ''
      }
    `;

    const html = wrapBrandTemplate(htmlContent, data.previewText || data.subject);

    // Batch send in chunks of 50 to respect rate limits and memory
    const chunkSize = 50;
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (email) => {
          const res = await this.send({
            to: email,
            subject: data.subject,
            html,
          });
          if (res.ok) {
            sentCount++;
          } else {
            failedCount++;
            if (res.error && !errors.includes(res.error)) errors.push(res.error);
          }
        })
      );
    }

    return { sentCount, failedCount, errors };
  },
};
