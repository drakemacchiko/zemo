/**
 * Notification Helper Functions
 * Centralized functions for creating notifications across different channels
 */

import { prisma } from '@/lib/db';
import { sendNotificationByType } from './email';

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'MESSAGE_RECEIVED'
  | 'DOCUMENT_REQUIRED'
  | 'VEHICLE_APPROVED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'MARKETING';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  priority?: NotificationPriority;
  bookingId?: string;
  vehicleId?: string;
  emailData?: any; // Additional data for email template
}

/**
 * Create a notification and send it through appropriate channels
 */
export async function createNotification(options: CreateNotificationOptions) {
  try {
    const {
      userId,
      type,
      title,
      message,
      actionUrl,
      priority = 'MEDIUM',
      bookingId,
      vehicleId,
      emailData,
    } = options;

    // Get user with preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        notificationPreference: true,
      },
    });

    if (!user) {
      console.error('User not found:', userId);
      return null;
    }

    // Determine which channels to use based on preferences
    const preferences = user.notificationPreference as any;
    const typeKey = getPreferenceKey(type);
    const userPrefs = preferences?.[typeKey] || {
      inApp: true,
      email: true,
      push: false,
      sms: false,
    };

    const deliveryChannels = [];
    if (userPrefs.inApp) deliveryChannels.push('IN_APP');
    if (userPrefs.email) deliveryChannels.push('EMAIL');
    if (userPrefs.push) deliveryChannels.push('PUSH');
    if (userPrefs.sms) deliveryChannels.push('SMS');

    // Create in-app notification (always create if inApp is enabled)
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl: actionUrl || null,
        priority: priority as any,
        bookingId: bookingId || null,
        vehicleId: vehicleId || null,
        deliveryChannels: deliveryChannels.join(','),
        emailSent: false,
        pushSent: false,
        smsSent: false,
      },
    });

    // Send email if enabled
    if (userPrefs.email && user.email) {
      const userName = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User';
      const emailSuccess = await sendNotificationByType(user.email, type, {
        userName,
        title,
        message,
        ...emailData,
      });

      if (emailSuccess) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { emailSent: true },
        });
      }
    }

    // TODO: Send push notification if enabled
    if (userPrefs.push) {
      // Implement push notification logic here
      // Future: Use Web Push API or service like Firebase Cloud Messaging
    }

    // TODO: Send SMS if enabled
    if (userPrefs.sms) {
      // Implement SMS logic here
      // Future: Use service like Twilio or Africa's Talking
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Convert notification type to preference key
 */
function getPreferenceKey(type: NotificationType): string {
  const mapping: Record<NotificationType, string> = {
    BOOKING_CONFIRMED: 'bookingConfirmed',
    BOOKING_CANCELLED: 'bookingCancelled',
    PAYMENT_SUCCESS: 'paymentSuccess',
    PAYMENT_FAILED: 'paymentFailed',
    MESSAGE_RECEIVED: 'messageReceived',
    DOCUMENT_REQUIRED: 'documentRequired',
    VEHICLE_APPROVED: 'vehicleApproved',
    SYSTEM_ANNOUNCEMENT: 'systemAnnouncement',
    MARKETING: 'marketing',
  };
  return mapping[type] || 'systemAnnouncement';
}

/**
 * Helper functions for common notification scenarios
 */

export async function notifyBookingConfirmed(
  userId: string,
  bookingId: string,
  data: {
    confirmationNumber: string;
    vehicleName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
  }
) {
  return createNotification({
    userId,
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed!',
    message: `Your booking for ${data.vehicleName} has been confirmed. Confirmation: ${data.confirmationNumber}`,
    actionUrl: `/bookings/${bookingId}`,
    priority: 'HIGH',
    bookingId,
    emailData: {
      bookingId,
      ...data,
    },
  });
}

export async function notifyPaymentSuccess(
  userId: string,
  bookingId: string,
  data: {
    amount: number;
    transactionId: string;
    paymentMethod: string;
    date: string;
  }
) {
  return createNotification({
    userId,
    type: 'PAYMENT_SUCCESS',
    title: 'Payment Received',
    message: `We've received your payment of ZMW ${data.amount}. Transaction ID: ${data.transactionId}`,
    actionUrl: `/bookings/${bookingId}`,
    priority: 'MEDIUM',
    bookingId,
    emailData: {
      bookingId,
      ...data,
    },
  });
}

export async function notifyPaymentFailed(
  userId: string,
  bookingId: string,
  data: {
    amount: number;
    reason: string;
  }
) {
  return createNotification({
    userId,
    type: 'PAYMENT_FAILED',
    title: 'Payment Failed',
    message: `Your payment of ZMW ${data.amount} failed. ${data.reason}. Please try again.`,
    actionUrl: `/bookings/${bookingId}/payment`,
    priority: 'URGENT',
    bookingId,
    emailData: {
      bookingId,
      ...data,
    },
  });
}

export async function notifyNewMessage(
  userId: string,
  conversationId: string,
  data: {
    senderName: string;
    messagePreview: string;
  }
) {
  return createNotification({
    userId,
    type: 'MESSAGE_RECEIVED',
    title: 'New Message',
    message: `${data.senderName}: ${data.messagePreview}`,
    actionUrl: `/messages?conversation=${conversationId}`,
    priority: 'MEDIUM',
    emailData: {
      conversationId,
      ...data,
    },
  });
}

export async function notifyBookingCancelled(
  userId: string,
  bookingId: string,
  data: {
    confirmationNumber: string;
    vehicleName: string;
    reason: string;
    refundAmount?: number;
  }
) {
  return createNotification({
    userId,
    type: 'BOOKING_CANCELLED',
    title: 'Booking Cancelled',
    message: `Your booking ${data.confirmationNumber} has been cancelled. ${data.reason}`,
    actionUrl: `/bookings/${bookingId}`,
    priority: 'HIGH',
    bookingId,
    emailData: {
      bookingId,
      ...data,
    },
  });
}

export async function notifyVehicleApproved(userId: string, vehicleId: string, vehicleName: string) {
  return createNotification({
    userId,
    type: 'VEHICLE_APPROVED',
    title: 'Vehicle Approved!',
    message: `Your vehicle listing "${vehicleName}" has been approved and is now live!`,
    actionUrl: `/vehicles/${vehicleId}`,
    priority: 'HIGH',
    vehicleId,
    emailData: {
      vehicleId,
      vehicleName,
    },
  });
}

export async function notifyDocumentRequired(
  userId: string,
  bookingId: string,
  documentType: string
) {
  return createNotification({
    userId,
    type: 'DOCUMENT_REQUIRED',
    title: 'Documents Required',
    message: `Please upload your ${documentType} to complete your booking.`,
    actionUrl: `/bookings/${bookingId}/documents`,
    priority: 'HIGH',
    bookingId,
    emailData: {
      bookingId,
      documentType,
    },
  });
}
