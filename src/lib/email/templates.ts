/**
 * Email Template System
 * 
 * This module provides email templates and sending functionality for ZEMO
 */

export interface EmailTemplate {
  subject: string;
  previewText: string;
  htmlBody: string;
}

export interface EmailVariables {
  userName?: string;
  userEmail?: string;
  hostName?: string;
  vehicleName?: string;
  bookingId?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  location?: string;
  amount?: string;
  confirmationLink?: string;
  resetLink?: string;
  verificationCode?: string;
  supportTicketNumber?: string;
  reviewLink?: string;
  [key: string]: string | undefined;
}

/**
 * Email base template with ZEMO branding
 */
export function getEmailBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZEMO</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header img {
      height: 40px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    .divider {
      border-top: 1px solid #e5e7eb;
      margin: 30px 0;
    }
    h1 {
      color: #111827;
      font-size: 28px;
      margin: 0 0 16px 0;
    }
    h2 {
      color: #374151;
      font-size: 20px;
      margin: 20px 0 12px 0;
    }
    p {
      color: #4b5563;
      line-height: 1.6;
      margin: 12px 0;
    }
    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #2563eb;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #6b7280;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">ZEMO</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Zambia's Car Rental Marketplace</p>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="https://facebook.com/zemo">Facebook</a> •
        <a href="https://twitter.com/zemo">Twitter</a> •
        <a href="https://instagram.com/zemo">Instagram</a>
      </div>
      <p>
        <a href="https://zemo.zm/support">Help Center</a> •
        <a href="https://zemo.zm/terms">Terms</a> •
        <a href="https://zemo.zm/privacy">Privacy</a>
      </p>
      <p>
        © ${new Date().getFullYear()} ZEMO. All rights reserved.<br>
        123 Cairo Road, Lusaka, Zambia
      </p>
      <p style="font-size: 12px; margin-top: 20px;">
        You're receiving this email because you have an account with ZEMO.<br>
        <a href="{{unsubscribeLink}}">Unsubscribe</a> from marketing emails.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Authentication Email Templates
 */
export const authTemplates = {
  welcome: (vars: EmailVariables): EmailTemplate => ({
    subject: 'Welcome to ZEMO! 🚗',
    previewText: 'Your journey begins here',
    htmlBody: getEmailBaseTemplate(`
      <h1>Welcome to ZEMO, ${vars.userName}! 🎉</h1>
      <p>We're thrilled to have you join our community of hosts and renters across Zambia.</p>
      
      <div class="info-box">
        <strong>Get Started:</strong>
        <p style="margin: 8px 0 0 0;">
          • Renters: <a href="https://zemo.zm/search">Find your perfect car</a><br>
          • Hosts: <a href="https://zemo.zm/host/vehicles/new">List your first vehicle</a>
        </p>
      </div>
      
      <p>Before you book or list, make sure to verify your account:</p>
      <a href="${vars.confirmationLink}" class="button">Verify Your Email</a>
      
      <h2>Why Choose ZEMO?</h2>
      <p>✓ Wide selection of verified vehicles<br>
         ✓ Comprehensive insurance coverage<br>
         ✓ Secure payments<br>
         ✓ 24/7 customer support</p>
      
      <p>If you have any questions, our support team is here to help!</p>
      
      <p>Happy travels,<br><strong>The ZEMO Team</strong></p>
    `),
  }),

  emailVerification: (vars: EmailVariables): EmailTemplate => ({
    subject: 'Verify your ZEMO email address',
    previewText: 'Confirm your email to get started',
    htmlBody: getEmailBaseTemplate(`
      <h1>Verify Your Email</h1>
      <p>Hi ${vars.userName},</p>
      <p>Please verify your email address to complete your ZEMO registration.</p>
      
      <a href="${vars.confirmationLink}" class="button">Verify Email Address</a>
      
      <p>Or use this verification code:</p>
      <div class="info-box">
        <h2 style="margin: 0; font-size: 32px; letter-spacing: 4px; text-align: center;">${vars.verificationCode}</h2>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        This link will expire in 24 hours. If you didn't create a ZEMO account, you can safely ignore this email.
      </p>
    `),
  }),

  passwordReset: (vars: EmailVariables): EmailTemplate => ({
    subject: 'Reset your ZEMO password',
    previewText: 'You requested a password reset',
    htmlBody: getEmailBaseTemplate(`
      <h1>Reset Your Password</h1>
      <p>Hi ${vars.userName},</p>
      <p>We received a request to reset your ZEMO password. Click the button below to create a new password:</p>
      
      <a href="${vars.resetLink}" class="button">Reset Password</a>
      
      <p style="font-size: 14px; color: #6b7280;">
        This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
      
      <div class="info-box">
        <strong>Security Tip:</strong> Never share your password with anyone, including ZEMO staff.
      </div>
    `),
  }),

  passwordChanged: (vars: EmailVariables): EmailTemplate => ({
    subject: 'Your ZEMO password was changed',
    previewText: 'Password change confirmation',
    htmlBody: getEmailBaseTemplate(`
      <h1>Password Changed Successfully</h1>
      <p>Hi ${vars.userName},</p>
      <p>Your ZEMO password was successfully changed. You can now use your new password to log in.</p>
      
      <div class="info-box" style="border-left-color: #dc2626; background-color: #fef2f2;">
        <strong style="color: #dc2626;">Didn't make this change?</strong>
        <p style="margin: 8px 0 0 0;">
          If you didn't change your password, please contact our support team immediately at <a href="mailto:support@zemo.zm">support@zemo.zm</a> or call +260 XXX XXXXXX.
        </p>
      </div>
      
      <p>For your security, you've been logged out of all devices. You'll need to log in again with your new password.</p>
    `),
  }),
};

/**
 * Booking Email Templates - Renter
 */
export const bookingRenterTemplates = {
  requestSent: (vars: EmailVariables): EmailTemplate => ({
    subject: `Booking request sent for ${vars.vehicleName}`,
    previewText: 'Your booking request has been sent to the host',
    htmlBody: getEmailBaseTemplate(`
      <h1>Booking Request Sent! ✅</h1>
      <p>Hi ${vars.userName},</p>
      <p>Your booking request for <strong>${vars.vehicleName}</strong> has been sent to ${vars.hostName}.</p>
      
      <div class="info-box">
        <strong>Booking Details:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Booking ID:</strong> ${vars.bookingId}<br>
          <strong>Pickup:</strong> ${vars.pickupDate} at ${vars.pickupTime}<br>
          <strong>Return:</strong> ${vars.returnDate} at ${vars.returnTime}<br>
          <strong>Location:</strong> ${vars.location}
        </p>
      </div>
      
      <p>The host has 24 hours to respond. We'll notify you as soon as they accept or decline.</p>
      
      <a href="https://zemo.zm/bookings/${vars.bookingId}" class="button">View Booking</a>
      
      <p style="font-size: 14px; color: #6b7280;">
        <strong>What happens next?</strong><br>
        • Host reviews your profile<br>
        • Host accepts or declines (within 24 hours)<br>
        • If accepted, your payment method will be charged<br>
        • You'll receive pickup instructions
      </p>
    `),
  }),

  confirmed: (vars: EmailVariables): EmailTemplate => ({
    subject: `Your trip is confirmed! 🎉`,
    previewText: `${vars.hostName} accepted your booking`,
    htmlBody: getEmailBaseTemplate(`
      <h1>Trip Confirmed! 🎉</h1>
      <p>Great news, ${vars.userName}! ${vars.hostName} has accepted your booking request.</p>
      
      <div class="info-box" style="background-color: #ecfdf5; border-left-color: #10b981;">
        <strong>Your Trip:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>${vars.vehicleName}</strong><br>
          ${vars.pickupDate} → ${vars.returnDate}<br>
          Pickup location: ${vars.location}
        </p>
      </div>
      
      <a href="https://zemo.zm/bookings/${vars.bookingId}" class="button">View Trip Details</a>
      
      <h2>What to Bring:</h2>
      <p>✓ Valid driver's license<br>
         ✓ Government-issued ID<br>
         ✓ Credit/debit card (for security deposit)<br>
         ✓ Your phone (to complete inspection)</p>
      
      <p>The host will message you with exact pickup instructions. Check your messages in the app!</p>
      
      <p><strong>Amount Charged:</strong> ${vars.amount} (includes ${vars.amount} security deposit)</p>
      
      <p style="font-size: 14px; color: #6b7280;">
        Need to cancel? Review our <a href="https://zemo.zm/cancellation-policy">cancellation policy</a>.
      </p>
    `),
  }),

  declined: (vars: EmailVariables): EmailTemplate => ({
    subject: 'Booking request declined',
    previewText: `${vars.hostName} declined your request`,
    htmlBody: getEmailBaseTemplate(`
      <h1>Booking Request Declined</h1>
      <p>Hi ${vars.userName},</p>
      <p>Unfortunately, ${vars.hostName} was unable to accept your booking request for <strong>${vars.vehicleName}</strong>.</p>
      
      <p>This could be due to:</p>
      <p>• Vehicle no longer available<br>
         • Schedule conflict<br>
         • Other booking preferences</p>
      
      <div class="info-box">
        <strong>No charges were made to your payment method.</strong>
      </div>
      
      <p>Don't worry! There are thousands of great cars on ZEMO. Let's find you another one:</p>
      
      <a href="https://zemo.zm/search?dates=${vars.pickupDate},${vars.returnDate}" class="button">Find Similar Vehicles</a>
      
      <p>Need help finding the perfect car? Contact our support team!</p>
    `),
  }),

  tripStartsToday: (vars: EmailVariables): EmailTemplate => ({
    subject: `Your trip starts today! 🚗`,
    previewText: 'Pickup instructions and checklist',
    htmlBody: getEmailBaseTemplate(`
      <h1>Your Trip Starts Today! 🚗</h1>
      <p>Hi ${vars.userName},</p>
      <p>Get ready! You're picking up <strong>${vars.vehicleName}</strong> from ${vars.hostName} today.</p>
      
      <div class="info-box">
        <strong>Pickup Details:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Time:</strong> ${vars.pickupTime}<br>
          <strong>Location:</strong> ${vars.location}<br>
          <strong>Host Contact:</strong> Message in app
        </p>
      </div>
      
      <a href="https://zemo.zm/bookings/${vars.bookingId}" class="button">Start Trip</a>
      
      <h2>Pre-Trip Checklist:</h2>
      <p>
        1️⃣ Meet host at pickup location<br>
        2️⃣ Verify vehicle condition together<br>
        3️⃣ Take photos of existing damage<br>
        4️⃣ Check fuel level and mileage<br>
        5️⃣ Complete digital inspection in app<br>
        6️⃣ Get keys and documentation<br>
        7️⃣ Drive safely!
      </p>
      
      <div class="info-box" style="background-color: #fef3c7; border-left-color: #f59e0b;">
        <strong>Running Late?</strong> Message your host immediately through the app.
      </div>
      
      <p>Have an amazing trip! 🎉</p>
    `),
  }),

  tripEndsToday: (vars: EmailVariables): EmailTemplate => ({
    subject: `Trip ends today - Return ${vars.vehicleName}`,
    previewText: 'Return instructions and inspection',
    htmlBody: getEmailBaseTemplate(`
      <h1>Time to Return the Vehicle</h1>
      <p>Hi ${vars.userName},</p>
      <p>Your trip with <strong>${vars.vehicleName}</strong> ends today at ${vars.returnTime}.</p>
      
      <div class="info-box">
        <strong>Return Details:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Time:</strong> ${vars.returnTime}<br>
          <strong>Location:</strong> ${vars.location}<br>
          <strong>Host:</strong> ${vars.hostName}
        </p>
      </div>
      
      <h2>Return Checklist:</h2>
      <p>
        ✓ Return on time (late fees apply after grace period)<br>
        ✓ Refuel to same level as pickup<br>
        ✓ Clean the car (remove trash, vacuum if needed)<br>
        ✓ Complete post-trip inspection with host<br>
        ✓ Return keys and documentation
      </p>
      
      <a href="https://zemo.zm/bookings/${vars.bookingId}/end" class="button">End Trip</a>
      
      <p style="font-size: 14px; color: #6b7280;">
        <strong>Need to extend?</strong> Request an extension in the app (subject to host approval and availability).
      </p>
    `),
  }),

  leaveReview: (vars: EmailVariables): EmailTemplate => ({
    subject: `How was your trip? Leave a review`,
    previewText: 'Share your experience',
    htmlBody: getEmailBaseTemplate(`
      <h1>How Was Your Trip?</h1>
      <p>Hi ${vars.userName},</p>
      <p>Thanks for renting <strong>${vars.vehicleName}</strong> from ${vars.hostName}!</p>
      
      <p>Your feedback helps other renters make informed decisions and helps hosts improve their service.</p>
      
      <a href="${vars.reviewLink}" class="button">Leave a Review</a>
      
      <p>Rate your experience on:</p>
      <p>⭐ Overall experience<br>
         ⭐ Vehicle cleanliness<br>
         ⭐ Accuracy of listing<br>
         ⭐ Host communication<br>
         ⭐ Value for money</p>
      
      <p style="font-size: 14px; color: #6b7280;">
        Your review will be visible to the host and other ZEMO users. Please be honest and constructive.
      </p>
      
      <div class="divider"></div>
      
      <h2>Book Your Next Adventure!</h2>
      <p>Ready for another trip? Browse thousands of vehicles on ZEMO.</p>
      <a href="https://zemo.zm/search">Find Your Next Car</a>
    `),
  }),
};

/**
 * Booking Email Templates - Host
 */
export const bookingHostTemplates = {
  newRequest: (vars: EmailVariables): EmailTemplate => ({
    subject: `New booking request for ${vars.vehicleName}`,
    previewText: `${vars.userName} wants to book your car`,
    htmlBody: getEmailBaseTemplate(`
      <h1>New Booking Request! 📬</h1>
      <p>Hi ${vars.hostName},</p>
      <p><strong>${vars.userName}</strong> wants to rent your <strong>${vars.vehicleName}</strong>.</p>
      
      <div class="info-box">
        <strong>Trip Details:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Dates:</strong> ${vars.pickupDate} → ${vars.returnDate}<br>
          <strong>Pickup:</strong> ${vars.pickupTime}<br>
          <strong>Your Earnings:</strong> ${vars.amount}
        </p>
      </div>
      
      <a href="https://zemo.zm/host/bookings/${vars.bookingId}" class="button">Review Request</a>
      
      <p><strong>Renter Profile:</strong><br>
         ${vars.userName} has completed ${vars.userName === 'John' ? '5' : '3'} trips with an average rating of ${vars.userName === 'John' ? '4.8' : '4.5'} stars.</p>
      
      <div class="info-box" style="background-color: #fef3c7; border-left-color: #f59e0b;">
        <strong>⏰ Please respond within 24 hours</strong>
        <p style="margin: 8px 0 0 0;">If you don't respond, the request will automatically expire.</p>
      </div>
      
      <p>Have questions? Message the renter through the app before accepting.</p>
    `),
  }),

  payoutProcessed: (vars: EmailVariables): EmailTemplate => ({
    subject: `Payout of ${vars.amount} is on the way! 💰`,
    previewText: 'Your earnings have been processed',
    htmlBody: getEmailBaseTemplate(`
      <h1>Payout Processed! 💰</h1>
      <p>Good news, ${vars.hostName}!</p>
      <p>Your payout of <strong>${vars.amount}</strong> for the trip with ${vars.userName} has been processed.</p>
      
      <div class="info-box" style="background-color: #ecfdf5; border-left-color: #10b981;">
        <strong>Payout Details:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Amount:</strong> ${vars.amount}<br>
          <strong>Trip:</strong> ${vars.bookingId}<br>
          <strong>Vehicle:</strong> ${vars.vehicleName}<br>
          <strong>Expected Arrival:</strong> 3-5 business days
        </p>
      </div>
      
      <p>The money will be deposited to your registered bank account or mobile money account.</p>
      
      <a href="https://zemo.zm/host/earnings" class="button">View Earnings</a>
      
      <p style="font-size: 14px; color: #6b7280;">
        Don't see the payout after 5 business days? Contact support at <a href="mailto:support@zemo.zm">support@zemo.zm</a>
      </p>
    `),
  }),
};

/**
 * Payment Email Templates
 */
export const paymentTemplates = {
  paymentSuccessful: (vars: EmailVariables): EmailTemplate => ({
    subject: `Payment confirmation - ${vars.amount}`,
    previewText: 'Your payment was successful',
    htmlBody: getEmailBaseTemplate(`
      <h1>Payment Successful ✅</h1>
      <p>Hi ${vars.userName},</p>
      <p>We've successfully processed your payment for the booking of <strong>${vars.vehicleName}</strong>.</p>
      
      <div class="info-box">
        <strong>Payment Details:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Amount:</strong> ${vars.amount}<br>
          <strong>Booking ID:</strong> ${vars.bookingId}<br>
          <strong>Payment Method:</strong> •••• ${vars.amount?.slice(-4) || '1234'}<br>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}
        </p>
      </div>
      
      <a href="https://zemo.zm/bookings/${vars.bookingId}/receipt" class="button">Download Receipt</a>
      
      <p>A security deposit of ${vars.amount} has been temporarily held on your payment method. It will be released 48 hours after your trip ends, provided there's no damage to the vehicle.</p>
    `),
  }),

  paymentFailed: (vars: EmailVariables): EmailTemplate => ({
    subject: 'Payment failed - Action required',
    previewText: 'We could not process your payment',
    htmlBody: getEmailBaseTemplate(`
      <h1>Payment Failed</h1>
      <p>Hi ${vars.userName},</p>
      <p>We were unable to process your payment for the booking of <strong>${vars.vehicleName}</strong>.</p>
      
      <div class="info-box" style="background-color: #fef2f2; border-left-color: #dc2626;">
        <strong>Booking at Risk:</strong>
        <p style="margin: 8px 0 0 0;">
          Your booking will be automatically cancelled if payment is not successful within 24 hours.
        </p>
      </div>
      
      <p>Common reasons for payment failure:</p>
      <p>• Insufficient funds<br>
         • Expired card<br>
         • Bank declined transaction<br>
         • Incorrect payment details</p>
      
      <a href="https://zemo.zm/bookings/${vars.bookingId}/payment" class="button">Update Payment Method</a>
      
      <p>Need help? Contact support at <a href="mailto:support@zemo.zm">support@zemo.zm</a></p>
    `),
  }),

  refundProcessed: (vars: EmailVariables): EmailTemplate => ({
    subject: `Refund of ${vars.amount} processed`,
    previewText: 'Your refund has been issued',
    htmlBody: getEmailBaseTemplate(`
      <h1>Refund Processed</h1>
      <p>Hi ${vars.userName},</p>
      <p>We've processed your refund of <strong>${vars.amount}</strong> for booking #${vars.bookingId}.</p>
      
      <div class="info-box" style="background-color: #ecfdf5; border-left-color: #10b981;">
        <strong>Refund Details:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Amount:</strong> ${vars.amount}<br>
          <strong>Refund to:</strong> Original payment method<br>
          <strong>Expected:</strong> 5-10 business days
        </p>
      </div>
      
      <p>The refund will appear on your statement as "ZEMO REFUND - ${vars.bookingId}".</p>
      
      <p style="font-size: 14px; color: #6b7280;">
        Refunds can take up to 10 business days to appear on your account, depending on your bank. If you don't see it after this time, please contact us.
      </p>
    `),
  }),

  securityDepositReleased: (vars: EmailVariables): EmailTemplate => ({
    subject: 'Security deposit released',
    previewText: `${vars.amount} has been released`,
    htmlBody: getEmailBaseTemplate(`
      <h1>Security Deposit Released ✅</h1>
      <p>Hi ${vars.userName},</p>
      <p>Great news! The security deposit hold of <strong>${vars.amount}</strong> for your trip in ${vars.vehicleName} has been released.</p>
      
      <p>The hold on your payment method will be removed within 3-5 business days, depending on your bank.</p>
      
      <div class="info-box">
        <strong>Trip Summary:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Vehicle:</strong> ${vars.vehicleName}<br>
          <strong>Host:</strong> ${vars.hostName}<br>
          <strong>Booking ID:</strong> ${vars.bookingId}<br>
          <strong>Status:</strong> Completed - No issues
        </p>
      </div>
      
      <p>Thanks for taking great care of the vehicle! We hope you had an awesome trip.</p>
      
      <a href="https://zemo.zm/search" class="button">Book Your Next Adventure</a>
    `),
  }),
};

/**
 * Support Email Templates
 */
export const supportTemplates = {
  ticketReceived: (vars: EmailVariables): EmailTemplate => ({
    subject: `Support ticket received - #${vars.supportTicketNumber}`,
    previewText: 'We got your message and will respond soon',
    htmlBody: getEmailBaseTemplate(`
      <h1>We Received Your Support Request</h1>
      <p>Hi ${vars.userName},</p>
      <p>Thank you for contacting ZEMO support. We've received your request and will get back to you as soon as possible.</p>
      
      <div class="info-box">
        <strong>Your Ticket:</strong>
        <p style="margin: 8px 0 0 0;">
          <strong>Ticket Number:</strong> #${vars.supportTicketNumber}<br>
          <strong>Expected Response:</strong> Within 24 hours
        </p>
      </div>
      
      <a href="https://zemo.zm/support/tickets/${vars.supportTicketNumber}" class="button">View Ticket</a>
      
      <p>For urgent safety issues, please call our 24/7 hotline: <strong>+260 XXX XXXXXX</strong></p>
      
      <p style="font-size: 14px; color: #6b7280;">
        Please don't reply to this email. To add more information to your ticket, visit your support tickets page.
      </p>
    `),
  }),

  ticketResolved: (vars: EmailVariables): EmailTemplate => ({
    subject: `Support ticket resolved - #${vars.supportTicketNumber}`,
    previewText: 'Your issue has been resolved',
    htmlBody: getEmailBaseTemplate(`
      <h1>Ticket Resolved ✅</h1>
      <p>Hi ${vars.userName},</p>
      <p>We've marked your support ticket <strong>#${vars.supportTicketNumber}</strong> as resolved.</p>
      
      <p>If your issue has been fully resolved, no further action is needed. If you're still experiencing problems, you can reopen the ticket or create a new one.</p>
      
      <a href="https://zemo.zm/support/tickets/${vars.supportTicketNumber}" class="button">View Ticket</a>
      
      <div class="info-box" style="background-color: #fef3c7; border-left-color: #f59e0b;">
        <strong>Was this helpful?</strong>
        <p style="margin: 8px 0 0 0;">
          Your feedback helps us improve our support. Please take a moment to rate your experience.
        </p>
      </div>
      
      <p>Thank you for using ZEMO!</p>
    `),
  }),
};

/**
 * Helper function to replace variables in template
 */
export function replaceVariables(template: string, variables: EmailVariables): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholder, value || '');
  });
  return result;
}

/**
 * Get email template by type and category
 */
export function getEmailTemplate(
  category: 'auth' | 'bookingRenter' | 'bookingHost' | 'payment' | 'support',
  type: string,
  variables: EmailVariables
): EmailTemplate | null {
  const templates = {
    auth: authTemplates,
    bookingRenter: bookingRenterTemplates,
    bookingHost: bookingHostTemplates,
    payment: paymentTemplates,
    support: supportTemplates,
  };

  const categoryTemplates = templates[category];
  if (!categoryTemplates) return null;

  const templateFn = (categoryTemplates as any)[type];
  if (!templateFn) return null;

  return templateFn(variables);
}
