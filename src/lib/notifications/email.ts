/**
 * Email Notification Utility
 * Sends notification emails using configured email service
 */

// Import nodemailer dynamically to avoid build errors if not installed
let nodemailer: any = null;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.warn('nodemailer not installed, email notifications disabled');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter (configure with your email service)
const createTransporter = () => {
  if (!nodemailer) {
    return null;
  }

  // For production, use a proper email service like SendGrid, AWS SES, or Mailgun
  // Example with Gmail (for development only):
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Example with SMTP:
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Fallback to console logging in development
  console.warn('No email service configured. Emails will be logged to console.');
  return null;
};

const transporter = createTransporter();

/**
 * Send a notification email
 */
export async function sendNotificationEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!transporter) {
      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('📧 EMAIL NOTIFICATION:', {
          to: options.to,
          subject: options.subject,
          content: options.text || options.html.substring(0, 100),
        });
      }
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@zemo.zm',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Generate email templates for different notification types
 */
export function generateEmailTemplate(type: string, data: any): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zemo.zm';

  switch (type) {
    case 'BOOKING_CONFIRMED':
      return {
        subject: `Booking Confirmed - ${data.confirmationNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #FCD34D; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background-color: #FCD34D; color: #000; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Booking Confirmed!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.userName},</p>
                  <p>Your booking has been confirmed!</p>
                  <p><strong>Confirmation Number:</strong> ${data.confirmationNumber}</p>
                  <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
                  <p><strong>Pickup:</strong> ${data.startDate}</p>
                  <p><strong>Return:</strong> ${data.endDate}</p>
                  <p><strong>Total:</strong> ZMW ${data.totalAmount}</p>
                  <p>
                    <a href="${baseUrl}/bookings/${data.bookingId}" class="button">View Booking Details</a>
                  </p>
                </div>
                <div class="footer">
                  <p>ZEMO - Zambia's Premier Car Sharing Platform</p>
                  <p>Need help? Contact us at support@zemo.zm</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

    case 'PAYMENT_SUCCESS':
      return {
        subject: `Payment Received - ${data.amount} ZMW`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #10B981; padding: 20px; text-align: center; color: white; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background-color: #FCD34D; color: #000; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✓ Payment Successful</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.userName},</p>
                  <p>We've received your payment of <strong>ZMW ${data.amount}</strong>.</p>
                  <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                  <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                  <p><strong>Date:</strong> ${data.date}</p>
                  <p>
                    <a href="${baseUrl}/bookings/${data.bookingId}" class="button">View Booking</a>
                  </p>
                </div>
                <div class="footer">
                  <p>ZEMO - Zambia's Premier Car Sharing Platform</p>
                  <p>Need help? Contact us at support@zemo.zm</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

    case 'MESSAGE_RECEIVED':
      return {
        subject: `New message from ${data.senderName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #3B82F6; padding: 20px; text-align: center; color: white; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .message { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #3B82F6; }
                .button { display: inline-block; padding: 12px 24px; background-color: #FCD34D; color: #000; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>💬 New Message</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.userName},</p>
                  <p>You have a new message from <strong>${data.senderName}</strong>:</p>
                  <div class="message">
                    ${data.messagePreview}
                  </div>
                  <p>
                    <a href="${baseUrl}/messages?conversation=${data.conversationId}" class="button">Reply Now</a>
                  </p>
                </div>
                <div class="footer">
                  <p>ZEMO - Zambia's Premier Car Sharing Platform</p>
                  <p>Need help? Contact us at support@zemo.zm</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

    case 'BOOKING_CANCELLED':
      return {
        subject: `Booking Cancelled - ${data.confirmationNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #EF4444; padding: 20px; text-align: center; color: white; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background-color: #FCD34D; color: #000; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Booking Cancelled</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.userName},</p>
                  <p>Your booking <strong>${data.confirmationNumber}</strong> has been cancelled.</p>
                  <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
                  <p><strong>Reason:</strong> ${data.reason}</p>
                  ${data.refundAmount ? `<p><strong>Refund Amount:</strong> ZMW ${data.refundAmount}</p>` : ''}
                  <p>
                    <a href="${baseUrl}/search" class="button">Find Another Vehicle</a>
                  </p>
                </div>
                <div class="footer">
                  <p>ZEMO - Zambia's Premier Car Sharing Platform</p>
                  <p>Need help? Contact us at support@zemo.zm</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

    default:
      return {
        subject: data.title || 'Notification from ZEMO',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #FCD34D; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${data.title}</h1>
                </div>
                <div class="content">
                  <p>${data.message}</p>
                </div>
                <div class="footer">
                  <p>ZEMO - Zambia's Premier Car Sharing Platform</p>
                  <p>Need help? Contact us at support@zemo.zm</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };
  }
}

/**
 * Send notification email based on notification type
 */
export async function sendNotificationByType(
  userEmail: string,
  notificationType: string,
  data: any
): Promise<boolean> {
  const template = generateEmailTemplate(notificationType, data);
  return sendNotificationEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
  });
}
