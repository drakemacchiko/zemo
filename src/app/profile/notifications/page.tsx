'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NotificationPreferences {
  bookingConfirmed: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  bookingCancelled: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  paymentSuccess: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  paymentFailed: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  messageReceived: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  documentRequired: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  vehicleApproved: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  systemAnnouncement: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  marketing: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  bookingConfirmed: { inApp: true, email: true, push: true, sms: false },
  bookingCancelled: { inApp: true, email: true, push: true, sms: false },
  paymentSuccess: { inApp: true, email: true, push: false, sms: false },
  paymentFailed: { inApp: true, email: true, push: true, sms: false },
  messageReceived: { inApp: true, email: false, push: true, sms: false },
  documentRequired: { inApp: true, email: true, push: true, sms: false },
  vehicleApproved: { inApp: true, email: true, push: true, sms: false },
  systemAnnouncement: { inApp: true, email: false, push: false, sms: false },
  marketing: { inApp: false, email: false, push: false, sms: false },
};

const notificationTypeLabels = {
  bookingConfirmed: 'Booking Confirmed',
  bookingCancelled: 'Booking Cancelled',
  paymentSuccess: 'Payment Success',
  paymentFailed: 'Payment Failed',
  messageReceived: 'New Message',
  documentRequired: 'Documents Required',
  vehicleApproved: 'Vehicle Approved',
  systemAnnouncement: 'System Announcements',
  marketing: 'Marketing & Promotions',
};

const notificationTypeDescriptions = {
  bookingConfirmed: 'When your booking is confirmed',
  bookingCancelled: 'When a booking is cancelled',
  paymentSuccess: 'When a payment is successful',
  paymentFailed: 'When a payment fails',
  messageReceived: 'When you receive a new message',
  documentRequired: 'When additional documents are needed',
  vehicleApproved: 'When your vehicle listing is approved',
  systemAnnouncement: 'Important system updates and maintenance',
  marketing: 'Special offers and promotional content',
};

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/notification-preferences', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
        }
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      if (data.success && data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const toggleChannel = (
    notificationType: keyof NotificationPreferences,
    channel: 'inApp' | 'email' | 'push' | 'sms'
  ) => {
    setPreferences(prev => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        [channel]: !prev[notificationType][channel],
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600 mt-2">
            Choose how you want to receive notifications for different events
          </p>
        </div>

        {/* Success/Error message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Preferences table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-1">
                <span className="text-sm font-semibold text-gray-700">Notification Type</span>
              </div>
              <div className="col-span-4 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700">In-App</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700">Email</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700">Push</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700">SMS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences rows */}
          <div className="divide-y divide-gray-200">
            {(Object.keys(notificationTypeLabels) as Array<keyof NotificationPreferences>).map(
              type => (
                <div key={type} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {notificationTypeLabels[type]}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notificationTypeDescriptions[type]}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-4 grid grid-cols-4 gap-4">
                      {/* In-App */}
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={preferences[type].inApp}
                          onChange={() => toggleChannel(type, 'inApp')}
                          disabled={type !== 'marketing'} // In-app always enabled except for marketing
                          className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      {/* Email */}
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={preferences[type].email}
                          onChange={() => toggleChannel(type, 'email')}
                          className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                        />
                      </div>
                      {/* Push */}
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={preferences[type].push}
                          onChange={() => toggleChannel(type, 'push')}
                          className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                        />
                      </div>
                      {/* SMS */}
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={preferences[type].sms}
                          onChange={() => toggleChannel(type, 'sms')}
                          className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Info note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About notification channels:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>
                  <strong>In-App:</strong> Notifications appear in the app notification center
                  (always enabled for important notifications)
                </li>
                <li>
                  <strong>Email:</strong> Notifications sent to your registered email address
                </li>
                <li>
                  <strong>Push:</strong> Browser push notifications when the app is not open
                  (requires permission)
                </li>
                <li>
                  <strong>SMS:</strong> Text messages to your phone (standard SMS rates may apply)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

