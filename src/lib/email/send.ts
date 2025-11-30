/**
 * Email Sending Service
 * 
 * Handles sending emails via SendGrid/SMTP
 * Supports queuing, retry logic, and tracking
 */

import { EmailTemplate, EmailVariables, replaceVariables } from './templates';

export interface EmailOptions {
  to: string | string[];
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Default email configuration
 */
const DEFAULT_FROM = process.env.EMAIL_FROM || 'ZEMO <noreply@zemo.zm>';
const DEFAULT_REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@zemo.zm';

/**
 * Send an email using the configured email service
 */
export async function sendEmail(
  template: EmailTemplate,
  options: EmailOptions,
  variables?: EmailVariables
): Promise<EmailResult> {
  try {
    // Replace variables in template if provided
    let htmlBody = template.htmlBody;
    let subject = template.subject;
    
    if (variables) {
      htmlBody = replaceVariables(htmlBody, variables);
      subject = replaceVariables(subject, variables);
    }

    // Add unsubscribe link
    const emailAddress = Array.isArray(options.to) ? options.to[0] : options.to;
    const unsubscribeLink = emailAddress 
      ? `https://zemo.zm/settings/notifications?email=${encodeURIComponent(emailAddress)}`
      : 'https://zemo.zm/settings/notifications';
    htmlBody = htmlBody.replace('{{unsubscribeLink}}', unsubscribeLink);

    // Determine which email service to use
    const emailService = process.env.EMAIL_SERVICE || 'sendgrid';

    if (emailService === 'sendgrid') {
      return await sendViaSendGrid({
        to: options.to,
        from: options.from || DEFAULT_FROM,
        replyTo: options.replyTo || DEFAULT_REPLY_TO,
        subject,
        html: htmlBody,
        text: stripHtml(htmlBody),
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
        tags: options.tags,
        metadata: options.metadata,
      });
    } else if (emailService === 'smtp') {
      return await sendViaSMTP({
        to: options.to,
        from: options.from || DEFAULT_FROM,
        replyTo: options.replyTo || DEFAULT_REPLY_TO,
        subject,
        html: htmlBody,
        text: stripHtml(htmlBody),
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      });
    } else {
      // Development mode - log to console
      /* eslint-disable no-console */
      console.log('📧 Email (Development Mode)');
      console.log('To:', options.to);
      console.log('Subject:', subject);
      console.log('Preview:', template.previewText);
      console.log('---');
      /* eslint-enable no-console */
      return { success: true, messageId: 'dev-' + Date.now() };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(data: any): Promise<EmailResult> {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const msg = {
      to: data.to,
      from: data.from,
      replyTo: data.replyTo,
      subject: data.subject,
      text: data.text,
      html: data.html,
      cc: data.cc,
      bcc: data.bcc,
      attachments: data.attachments?.map((att: EmailAttachment) => ({
        filename: att.filename,
        content: att.content,
        type: att.contentType,
      })),
      customArgs: data.metadata,
      categories: data.tags,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'],
    };
  } catch (error: any) {
    console.error('SendGrid error:', error);
    
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
    
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send email via SMTP (Nodemailer)
 */
async function sendViaSMTP(data: any): Promise<EmailResult> {
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: data.from,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      replyTo: data.replyTo,
      subject: data.subject,
      text: data.text,
      html: data.html,
      attachments: data.attachments,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('SMTP error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Queue email for sending (for background processing)
 */
export async function queueEmail(
  template: EmailTemplate,
  options: EmailOptions,
  variables?: EmailVariables,
  sendAt?: Date
): Promise<{ queued: boolean; jobId?: string }> {
  // This would integrate with a job queue like Bull, BullMQ, or similar
  // For now, we'll just send immediately
  
  if (sendAt && sendAt > new Date()) {
    // Schedule for later
    // eslint-disable-next-line no-console
    console.log(`Email scheduled for ${sendAt.toISOString()}`);
    // In production, add to job queue with delay
  }
  
  const result = await sendEmail(template, options, variables);
  
  const returnValue: { queued: boolean; jobId?: string } = {
    queued: result.success,
  };
  
  if (result.messageId) {
    returnValue.jobId = result.messageId;
  }
  
  return returnValue;
}

/**
 * Send bulk emails (with rate limiting)
 */
export async function sendBulkEmails(
  template: EmailTemplate,
  recipients: Array<{ email: string; variables?: EmailVariables }>,
  options?: Partial<EmailOptions>
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Send in batches to avoid rate limits
  const batchSize = 10;
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const promises = batch.map(async (recipient) => {
      const result = await sendEmail(
        template,
        {
          ...options,
          to: recipient.email,
        },
        recipient.variables
      );
      
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`${recipient.email}: ${result.error}`);
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Helper: Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gim, '')
    .replace(/<script[^>]*>.*<\/script>/gim, '')
    .replace(/<[^>]+>/gim, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper: Test email configuration
 */
export async function testEmailConfiguration(): Promise<{
  configured: boolean;
  service: string;
  errors: string[];
}> {
  const errors: string[] = [];
  const service = process.env.EMAIL_SERVICE || 'none';

  if (!process.env.EMAIL_FROM) {
    errors.push('EMAIL_FROM not configured');
  }

  if (service === 'sendgrid') {
    if (!process.env.SENDGRID_API_KEY) {
      errors.push('SENDGRID_API_KEY not configured');
    }
  } else if (service === 'smtp') {
    if (!process.env.SMTP_HOST) errors.push('SMTP_HOST not configured');
    if (!process.env.SMTP_PORT) errors.push('SMTP_PORT not configured');
    if (!process.env.SMTP_USER) errors.push('SMTP_USER not configured');
    if (!process.env.SMTP_PASS) errors.push('SMTP_PASS not configured');
  }

  return {
    configured: errors.length === 0,
    service,
    errors,
  };
}

/**
 * Helper: Preview email template
 */
export function previewEmail(
  template: EmailTemplate,
  variables?: EmailVariables
): { subject: string; previewText: string; html: string } {
  let htmlBody = template.htmlBody;
  let subject = template.subject;
  
  if (variables) {
    htmlBody = replaceVariables(htmlBody, variables);
    subject = replaceVariables(subject, variables);
  }

  return {
    subject,
    previewText: template.previewText,
    html: htmlBody,
  };
}
