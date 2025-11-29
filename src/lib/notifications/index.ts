// Notification service types and interfaces
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface SMSTemplate {
  message: string;
}

export interface NotificationContext {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  booking?: {
    confirmationNumber: string;
    vehicleName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
  };
  payment?: {
    amount: number;
    provider: string;
    status: string;
  };
  message?: {
    content: string;
    senderName: string;
  };
  ticket?: {
    ticketNumber: string;
    subject: string;
    status: string;
  };
}

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'MESSAGE_RECEIVED'
  | 'VEHICLE_APPROVED'
  | 'DOCUMENT_REQUIRED'
  | 'INSPECTION_DUE'
  | 'SUPPORT_RESPONSE'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'MARKETING';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';

// Email service interface for different providers
export interface EmailService {
  sendEmail(
    to: string,
    template: EmailTemplate
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

// SMS service interface for different providers
export interface SMSService {
  sendSMS(
    to: string,
    template: SMSTemplate
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

// Resend email service implementation (sandbox)
export class ResendEmailService implements EmailService {
  // API key stored for future production implementation
  // private _apiKey: string;

  constructor(_apiKey: string) {
    // this._apiKey = apiKey;
    // Stored for future production use
  }

  async sendEmail(
    to: string,
    template: EmailTemplate
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // TODO: Implement actual Resend API integration
      // For now, simulate sending with logging

      const isTestEnvironment =
        process.env.NODE_ENV === 'test' ||
        process.argv.some(arg => arg.includes('jest')) ||
        process.argv.some(arg => arg.includes('test'));

      if (process.env.NODE_ENV === 'development' && !isTestEnvironment) {
        // Development logging for email service (disabled during tests)
        process.stdout.write(`[RESEND EMAIL] TO: ${to}\n`);
        process.stdout.write(`[RESEND EMAIL] SUBJECT: ${template.subject}\n`);
        process.stdout.write(`[RESEND EMAIL] HTML: ${template.html.substring(0, 100)}...\n`);
        process.stdout.write(`[RESEND EMAIL] TEXT: ${template.text.substring(0, 100)}...\n`);
      }

      // Simulate success in development and test modes
      if (process.env.NODE_ENV === 'development' || isTestEnvironment) {
        return {
          success: true,
          messageId: `resend_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        };
      }

      // In production, this would use actual Resend API
      // const resend = new Resend(this.apiKey);
      // const result = await resend.emails.send({
      //   from: process.env.RESEND_FROM_EMAIL!,
      //   to,
      //   subject: template.subject,
      //   html: template.html,
      //   text: template.text,
      // });
      // return { success: true, messageId: result.id };

      return {
        success: false,
        error: 'Resend API not configured in production',
      };
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Twilio SMS service implementation (sandbox)
export class TwilioSMSService implements SMSService {
  // Credentials stored for future production implementation
  // private _accountSid: string;
  // private _authToken: string;
  private fromPhoneNumber: string;

  constructor(_accountSid: string, _authToken: string, fromPhoneNumber: string) {
    // this._accountSid = accountSid;
    // this._authToken = authToken;
    this.fromPhoneNumber = fromPhoneNumber;
  }

  async sendSMS(
    to: string,
    template: SMSTemplate
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // TODO: Implement actual Twilio API integration
      // For now, simulate sending with logging

      const isTestEnvironment =
        process.env.NODE_ENV === 'test' ||
        process.argv.some(arg => arg.includes('jest')) ||
        process.argv.some(arg => arg.includes('test'));

      if (process.env.NODE_ENV === 'development' && !isTestEnvironment) {
        // Development logging for SMS service (disabled during tests)
        process.stdout.write(`[TWILIO SMS] TO: ${to}\n`);
        process.stdout.write(`[TWILIO SMS] FROM: ${this.fromPhoneNumber}\n`);
        process.stdout.write(`[TWILIO SMS] MESSAGE: ${template.message}\n`);
      }

      // Simulate success in development and test modes
      if (process.env.NODE_ENV === 'development' || isTestEnvironment) {
        return {
          success: true,
          messageId: `twilio_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        };
      }

      // In production, this would use actual Twilio API
      // const client = twilio(this.accountSid, this.authToken);
      // const result = await client.messages.create({
      //   body: template.message,
      //   from: this.fromPhoneNumber,
      //   to,
      // });
      // return { success: true, messageId: result.sid };

      return {
        success: false,
        error: 'Twilio API not configured in production',
      };
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Template generators for different notification types
export function generateEmailTemplate(
  type: NotificationType,
  context: NotificationContext
): EmailTemplate {
  switch (type) {
    case 'BOOKING_CONFIRMED':
      return {
        subject: `Booking Confirmed - ${context.booking?.vehicleName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FFD400; background: #0A0A0A; padding: 20px; margin: 0;">ZEMO</h1>
            <div style="padding: 20px;">
              <h2>Booking Confirmed!</h2>
              <p>Hi ${context.user.firstName},</p>
              <p>Your booking has been confirmed. Here are the details:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>${context.booking?.vehicleName}</h3>
                <p><strong>Confirmation:</strong> ${context.booking?.confirmationNumber}</p>
                <p><strong>Dates:</strong> ${context.booking?.startDate} to ${context.booking?.endDate}</p>
                <p><strong>Total:</strong> ZMW ${context.booking?.totalAmount}</p>
              </div>
              <p>You can view your booking details in the ZEMO app.</p>
              <p>Best regards,<br>The ZEMO Team</p>
            </div>
          </div>
        `,
        text: `Hi ${context.user.firstName}, your booking for ${context.booking?.vehicleName} has been confirmed. Confirmation: ${context.booking?.confirmationNumber}. Dates: ${context.booking?.startDate} to ${context.booking?.endDate}. Total: ZMW ${context.booking?.totalAmount}.`,
      };

    case 'PAYMENT_SUCCESS':
      return {
        subject: 'Payment Successful - ZEMO',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FFD400; background: #0A0A0A; padding: 20px; margin: 0;">ZEMO</h1>
            <div style="padding: 20px;">
              <h2>Payment Successful</h2>
              <p>Hi ${context.user.firstName},</p>
              <p>Your payment has been processed successfully.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Amount:</strong> ZMW ${context.payment?.amount}</p>
                <p><strong>Provider:</strong> ${context.payment?.provider}</p>
                <p><strong>Status:</strong> ${context.payment?.status}</p>
              </div>
              <p>Thank you for using ZEMO!</p>
            </div>
          </div>
        `,
        text: `Hi ${context.user.firstName}, your payment of ZMW ${context.payment?.amount} via ${context.payment?.provider} has been processed successfully.`,
      };

    case 'MESSAGE_RECEIVED':
      return {
        subject: `New Message - ZEMO`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FFD400; background: #0A0A0A; padding: 20px; margin: 0;">ZEMO</h1>
            <div style="padding: 20px;">
              <h2>New Message</h2>
              <p>Hi ${context.user.firstName},</p>
              <p>You have a new message from ${context.message?.senderName}:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p>"${context.message?.content}"</p>
              </div>
              <p>Reply in the ZEMO app to continue the conversation.</p>
            </div>
          </div>
        `,
        text: `Hi ${context.user.firstName}, you have a new message from ${context.message?.senderName}: "${context.message?.content}". Reply in the ZEMO app.`,
      };

    case 'SUPPORT_RESPONSE':
      return {
        subject: `Support Update - ${context.ticket?.ticketNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FFD400; background: #0A0A0A; padding: 20px; margin: 0;">ZEMO</h1>
            <div style="padding: 20px;">
              <h2>Support Ticket Update</h2>
              <p>Hi ${context.user.firstName},</p>
              <p>Your support ticket has been updated:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Ticket:</strong> ${context.ticket?.ticketNumber}</p>
                <p><strong>Subject:</strong> ${context.ticket?.subject}</p>
                <p><strong>Status:</strong> ${context.ticket?.status}</p>
              </div>
              <p>View the full update in the ZEMO app.</p>
            </div>
          </div>
        `,
        text: `Hi ${context.user.firstName}, your support ticket ${context.ticket?.ticketNumber} has been updated. Status: ${context.ticket?.status}. View details in the ZEMO app.`,
      };

    default:
      return {
        subject: 'ZEMO Notification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FFD400; background: #0A0A0A; padding: 20px; margin: 0;">ZEMO</h1>
            <div style="padding: 20px;">
              <p>Hi ${context.user.firstName},</p>
              <p>You have a new notification from ZEMO.</p>
              <p>Check the app for more details.</p>
            </div>
          </div>
        `,
        text: `Hi ${context.user.firstName}, you have a new notification from ZEMO. Check the app for details.`,
      };
  }
}

export function generateSMSTemplate(
  type: NotificationType,
  context: NotificationContext
): SMSTemplate {
  switch (type) {
    case 'BOOKING_CONFIRMED':
      return {
        message: `ZEMO: Booking confirmed! ${context.booking?.vehicleName} for ${context.booking?.startDate} - ${context.booking?.endDate}. Confirmation: ${context.booking?.confirmationNumber}`,
      };

    case 'PAYMENT_SUCCESS':
      return {
        message: `ZEMO: Payment successful! ZMW ${context.payment?.amount} via ${context.payment?.provider}. Thank you!`,
      };

    case 'MESSAGE_RECEIVED':
      return {
        message: `ZEMO: New message from ${context.message?.senderName}: "${context.message?.content?.substring(0, 100)}${context.message?.content && context.message.content.length > 100 ? '...' : ''}"`,
      };

    case 'SUPPORT_RESPONSE':
      return {
        message: `ZEMO: Support ticket ${context.ticket?.ticketNumber} updated. Status: ${context.ticket?.status}. Check app for details.`,
      };

    default:
      return {
        message: `ZEMO: You have a new notification. Check the app for details.`,
      };
  }
}

// Main notification service
export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;

  constructor(emailService: EmailService, smsService: SMSService) {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  async sendNotification(
    type: NotificationType,
    context: NotificationContext,
    channels: NotificationChannel[] = ['IN_APP']
  ) {
    const results: Record<
      NotificationChannel,
      { success: boolean; messageId?: string; error?: string }
    > = {} as any;

    for (const channel of channels) {
      switch (channel) {
        case 'EMAIL':
          if (context.user.email) {
            const template = generateEmailTemplate(type, context);
            results[channel] = await this.emailService.sendEmail(context.user.email, template);
          } else {
            results[channel] = { success: false, error: 'No email address provided' };
          }
          break;

        case 'SMS':
          if (context.user.phoneNumber) {
            const template = generateSMSTemplate(type, context);
            results[channel] = await this.smsService.sendSMS(context.user.phoneNumber, template);
          } else {
            results[channel] = { success: false, error: 'No phone number provided' };
          }
          break;

        case 'IN_APP':
          // In-app notifications are handled by database records
          results[channel] = { success: true, messageId: 'in_app_notification' };
          break;

        case 'PUSH':
          // TODO: Implement push notification service
          results[channel] = { success: false, error: 'Push notifications not implemented' };
          break;
      }
    }

    return results;
  }
}

// Service factory
export function createNotificationService(): NotificationService {
  const emailService = new ResendEmailService(process.env.RESEND_API_KEY || 'sandbox_key');

  const smsService = new TwilioSMSService(
    process.env.TWILIO_ACCOUNT_SID || 'sandbox_sid',
    process.env.TWILIO_AUTH_TOKEN || 'sandbox_token',
    process.env.TWILIO_PHONE_NUMBER || '+1234567890'
  );

  return new NotificationService(emailService, smsService);
}
