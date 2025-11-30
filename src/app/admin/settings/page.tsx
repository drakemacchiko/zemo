'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';

interface PlatformSettingsData {
  // General
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  businessAddress: string;
  timezone: string;
  currency: string;
  language: string;

  // Booking
  minBookingDuration: number;
  maxBookingDuration: number;
  defaultAdvanceNotice: number;
  instantBookingEnabled: boolean;
  autoCancellationTimeout: number;

  // Payment
  serviceFeePercentage: number;
  hostCommissionPercentage: number;
  defaultSecurityDeposit: number;
  minimumPayoutAmount: number;
  payoutSchedule: string;

  // Insurance
  insuranceProvider: string;
  basicCoverageAmount: number;
  standardCoverageAmount: number;
  premiumCoverageAmount: number;
  basicDeductible: number;
  standardDeductible: number;
  premiumDeductible: number;

  // Fees
  lateReturnFeePerHour: number;
  renterCancellationFee: number;
  hostCancellationFee: number;
  additionalDriverFee: number;
  deliveryFeePerKm: number;
  cleaningFee: number;

  // Verification
  requirePhoneVerification: boolean;
  requireDriverLicense: boolean;
  requireIdVerification: boolean;
  autoVerifyDocuments: boolean;
  manualReviewForHighValue: boolean;
  manualReviewForNewUsers: boolean;

  // Communication
  emailServiceProvider: string;
  smsServiceProvider: string;
  pushNotificationService: string;

  // Trust & Safety
  minimumDriverAge: number;
  minimumDrivingExperience: number;
  backgroundCheckProvider: string;

  // Feature Flags
  enableInstantBooking: boolean;
  enableTripExtensions: boolean;
  enableDelivery: boolean;
  enableExtras: boolean;
  enableReviews: boolean;
  enableMessaging: boolean;
  enableLiveChat: boolean;
  maintenanceMode: boolean;
}

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [settings, setSettings] = useState<PlatformSettingsData>({
    // General
    platformName: 'ZEMO',
    supportEmail: 'support@zemo.zm',
    supportPhone: '+260 XXX XXXXXX',
    businessAddress: 'Lusaka, Zambia',
    timezone: 'Africa/Lusaka',
    currency: 'ZMW',
    language: 'en',

    // Booking
    minBookingDuration: 4,
    maxBookingDuration: 30,
    defaultAdvanceNotice: 2,
    instantBookingEnabled: true,
    autoCancellationTimeout: 24,

    // Payment
    serviceFeePercentage: 10,
    hostCommissionPercentage: 20,
    defaultSecurityDeposit: 500,
    minimumPayoutAmount: 100,
    payoutSchedule: 'weekly',

    // Insurance
    insuranceProvider: 'Partner Insurance Co.',
    basicCoverageAmount: 50000,
    standardCoverageAmount: 100000,
    premiumCoverageAmount: 200000,
    basicDeductible: 5000,
    standardDeductible: 3000,
    premiumDeductible: 1000,

    // Fees
    lateReturnFeePerHour: 50,
    renterCancellationFee: 100,
    hostCancellationFee: 200,
    additionalDriverFee: 50,
    deliveryFeePerKm: 10,
    cleaningFee: 100,

    // Verification
    requirePhoneVerification: true,
    requireDriverLicense: true,
    requireIdVerification: true,
    autoVerifyDocuments: false,
    manualReviewForHighValue: true,
    manualReviewForNewUsers: true,

    // Communication
    emailServiceProvider: 'SendGrid',
    smsServiceProvider: 'Twilio',
    pushNotificationService: 'Firebase',

    // Trust & Safety
    minimumDriverAge: 21,
    minimumDrivingExperience: 2,
    backgroundCheckProvider: 'CheckHG',

    // Feature Flags
    enableInstantBooking: true,
    enableTripExtensions: true,
    enableDelivery: true,
    enableExtras: true,
    enableReviews: true,
    enableMessaging: true,
    enableLiveChat: false,
    maintenanceMode: false,
  });

  useEffect(() => {
    // Load settings from API
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'booking', label: 'Booking' },
    { id: 'payment', label: 'Payment' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'fees', label: 'Fees & Pricing' },
    { id: 'verification', label: 'Verification' },
    { id: 'communication', label: 'Communication' },
    { id: 'safety', label: 'Trust & Safety' },
    { id: 'features', label: 'Feature Flags' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-8 h-8 text-blue-600" />
              Platform Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure platform-wide settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            {message.text}
          </div>
        )}

        <div className="flex gap-6">
          {/* Tabs Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-lg shadow p-8">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) =>
                        setSettings({ ...settings, platformName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, supportEmail: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="text"
                      value={settings.supportPhone}
                      onChange={(e) =>
                        setSettings({ ...settings, supportPhone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <input
                      type="text"
                      value={settings.businessAddress}
                      onChange={(e) =>
                        setSettings({ ...settings, businessAddress: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) =>
                        setSettings({ ...settings, timezone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Africa/Lusaka">Africa/Lusaka (WAT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={(e) =>
                        setSettings({ ...settings, currency: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        setSettings({ ...settings, language: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Settings */}
            {activeTab === 'booking' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Booking Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Booking Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.minBookingDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minBookingDuration: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Booking Duration (days)
                    </label>
                    <input
                      type="number"
                      value={settings.maxBookingDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxBookingDuration: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Advance Notice (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultAdvanceNotice}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultAdvanceNotice: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Cancellation Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.autoCancellationTimeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          autoCancellationTimeout: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cancel booking if host doesn't respond
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.instantBookingEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            instantBookingEnabled: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Instant Booking (Global)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Fee (% for Renters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.serviceFeePercentage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          serviceFeePercentage: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Host Commission (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.hostCommissionPercentage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hostCommissionPercentage: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Security Deposit (ZMW)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultSecurityDeposit}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultSecurityDeposit: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Payout Amount (ZMW)
                    </label>
                    <input
                      type="number"
                      value={settings.minimumPayoutAmount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimumPayoutAmount: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payout Schedule
                    </label>
                    <select
                      value={settings.payoutSchedule}
                      onChange={(e) =>
                        setSettings({ ...settings, payoutSchedule: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Settings */}
            {activeTab === 'insurance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Insurance Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Provider
                    </label>
                    <input
                      type="text"
                      value={settings.insuranceProvider}
                      onChange={(e) =>
                        setSettings({ ...settings, insuranceProvider: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Basic Plan</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Coverage Amount (ZMW)
                          </label>
                          <input
                            type="number"
                            value={settings.basicCoverageAmount}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                basicCoverageAmount: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Deductible (ZMW)
                          </label>
                          <input
                            type="number"
                            value={settings.basicDeductible}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                basicDeductible: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Standard Plan</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Coverage Amount (ZMW)
                          </label>
                          <input
                            type="number"
                            value={settings.standardCoverageAmount}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                standardCoverageAmount: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Deductible (ZMW)
                          </label>
                          <input
                            type="number"
                            value={settings.standardDeductible}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                standardDeductible: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Premium Plan</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Coverage Amount (ZMW)
                          </label>
                          <input
                            type="number"
                            value={settings.premiumCoverageAmount}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                premiumCoverageAmount: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Deductible (ZMW)
                          </label>
                          <input
                            type="number"
                            value={settings.premiumDeductible}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                premiumDeductible: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fees & Pricing */}
            {activeTab === 'fees' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Fees & Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Late Return Fee (per hour, ZMW)
                    </label>
                    <input
                      type="number"
                      value={settings.lateReturnFeePerHour}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          lateReturnFeePerHour: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Renter Cancellation Fee (ZMW)
                    </label>
                    <input
                      type="number"
                      value={settings.renterCancellationFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          renterCancellationFee: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Host Cancellation Penalty (ZMW)
                    </label>
                    <input
                      type="number"
                      value={settings.hostCancellationFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hostCancellationFee: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Driver Fee (ZMW)
                    </label>
                    <input
                      type="number"
                      value={settings.additionalDriverFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          additionalDriverFee: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Fee (per km, ZMW)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryFeePerKm}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          deliveryFeePerKm: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cleaning Fee (ZMW)
                    </label>
                    <input
                      type="number"
                      value={settings.cleaningFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cleaningFee: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Verification Settings */}
            {activeTab === 'verification' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Verification Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.requirePhoneVerification}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requirePhoneVerification: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Require Phone Verification
                      </span>
                      <p className="text-xs text-gray-500">
                        Users must verify phone number to use platform
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.requireDriverLicense}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireDriverLicense: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Require Driver's License
                      </span>
                      <p className="text-xs text-gray-500">
                        Renters must upload valid driver's license
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.requireIdVerification}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireIdVerification: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Require ID Verification
                      </span>
                      <p className="text-xs text-gray-500">
                        Users must verify identity with government ID
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.autoVerifyDocuments}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          autoVerifyDocuments: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Auto-Verify Documents (AI)
                      </span>
                      <p className="text-xs text-gray-500">
                        Use AI to automatically verify documents
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.manualReviewForHighValue}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          manualReviewForHighValue: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Manual Review for High-Value Vehicles
                      </span>
                      <p className="text-xs text-gray-500">
                        Admin must approve high-value vehicle bookings
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.manualReviewForNewUsers}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          manualReviewForNewUsers: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Manual Review for New Users
                      </span>
                      <p className="text-xs text-gray-500">
                        First booking requires admin approval
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Communication Settings */}
            {activeTab === 'communication' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Communication Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Service Provider
                    </label>
                    <select
                      value={settings.emailServiceProvider}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailServiceProvider: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SendGrid">SendGrid</option>
                      <option value="Mailgun">Mailgun</option>
                      <option value="AWS SES">AWS SES</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMS Service Provider
                    </label>
                    <select
                      value={settings.smsServiceProvider}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smsServiceProvider: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Twilio">Twilio</option>
                      <option value="Africa's Talking">Africa's Talking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Push Notification Service
                    </label>
                    <select
                      value={settings.pushNotificationService}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pushNotificationService: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Firebase">Firebase Cloud Messaging</option>
                      <option value="OneSignal">OneSignal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Trust & Safety */}
            {activeTab === 'safety' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Trust & Safety</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Driver Age
                    </label>
                    <input
                      type="number"
                      value={settings.minimumDriverAge}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimumDriverAge: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Driving Experience (years)
                    </label>
                    <input
                      type="number"
                      value={settings.minimumDrivingExperience}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimumDrivingExperience: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Check Provider
                    </label>
                    <input
                      type="text"
                      value={settings.backgroundCheckProvider}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          backgroundCheckProvider: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Feature Flags */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Feature Flags</h2>
                <p className="text-gray-600">
                  Enable or disable platform features globally
                </p>
                <div className="space-y-4">
                  {[
                    {
                      key: 'enableInstantBooking',
                      label: 'Instant Booking',
                      desc: 'Allow hosts to enable instant booking',
                    },
                    {
                      key: 'enableTripExtensions',
                      label: 'Trip Extensions',
                      desc: 'Allow renters to extend active trips',
                    },
                    {
                      key: 'enableDelivery',
                      label: 'Delivery Service',
                      desc: 'Allow hosts to offer vehicle delivery',
                    },
                    {
                      key: 'enableExtras',
                      label: 'Extras & Add-ons',
                      desc: 'Enable additional services (GPS, child seat, etc.)',
                    },
                    {
                      key: 'enableReviews',
                      label: 'Reviews System',
                      desc: 'Allow users to leave reviews and ratings',
                    },
                    {
                      key: 'enableMessaging',
                      label: 'In-App Messaging',
                      desc: 'Enable direct messaging between users',
                    },
                    {
                      key: 'enableLiveChat',
                      label: 'Live Chat Support',
                      desc: 'Enable live chat widget for support',
                    },
                    {
                      key: 'maintenanceMode',
                      label: 'Maintenance Mode',
                      desc: 'Disable bookings and show maintenance page',
                      danger: true,
                    },
                  ].map((feature) => (
                    <label
                      key={feature.key}
                      className={`flex items-center gap-3 p-4 border rounded-lg ${
                        feature.danger
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings[feature.key as keyof PlatformSettingsData] as boolean}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [feature.key]: e.target.checked,
                          })
                        }
                        className={`h-5 w-5 focus:ring-2 border-gray-300 rounded ${
                          feature.danger
                            ? 'text-red-600 focus:ring-red-500'
                            : 'text-blue-600 focus:ring-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <span
                          className={`text-sm font-medium ${
                            feature.danger ? 'text-red-900' : 'text-gray-900'
                          }`}
                        >
                          {feature.label}
                        </span>
                        <p
                          className={`text-xs ${
                            feature.danger ? 'text-red-600' : 'text-gray-500'
                          }`}
                        >
                          {feature.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
