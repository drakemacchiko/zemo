'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  phoneNumber: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  profile: {
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    kycStatus: string;
    kycDocuments?: any;
  };
  drivingLicense?: {
    licenseNumber: string;
    verificationStatus: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleFileUpload = async (file: File, documentType: string) => {
    setUploadLoading(documentType);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/auth/upload-docs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${documentType.replace('_', ' ')} uploaded successfully!`);
        fetchUserProfile(); // Refresh user data
      } else {
        setMessage(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploadLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.includes('successfully')
                ? 'bg-green-50 border border-green-200 text-green-600'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.profile.firstName} {user.profile.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="flex items-center space-x-2">
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  {user.emailVerified ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex items-center space-x-2">
                  <p className="mt-1 text-sm text-gray-900">{user.phoneNumber}</p>
                  {user.phoneVerified ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KYC Status */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">KYC Status</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    user.profile.kycStatus === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : user.profile.kycStatus === 'UNDER_REVIEW'
                        ? 'bg-blue-100 text-blue-800'
                        : user.profile.kycStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {user.profile.kycStatus}
                </span>
              </div>
              {user.profile.kycStatus === 'PENDING' && (
                <p className="mt-2 text-sm text-gray-600">
                  Please upload your documents to complete verification.
                </p>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white shadow rounded-lg lg:col-span-2">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Document Upload</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="mb-4">
                    {user.profile.profilePictureUrl ? (
                      <Image
                        src={user.profile.profilePictureUrl}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="mx-auto h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mx-auto h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xl font-medium text-gray-600">
                          {user.profile.firstName[0]}
                          {user.profile.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Profile Picture
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'PROFILE_PICTURE');
                      }}
                    />
                    <span className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                      {uploadLoading === 'PROFILE_PICTURE' ? 'Uploading...' : 'Upload'}
                    </span>
                  </label>
                </div>

                {/* National ID */}
                <div className="text-center">
                  <div className="mb-4 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {user.profile.kycDocuments?.NATIONAL_ID ? (
                      <span className="text-green-600">✓ Uploaded</span>
                    ) : (
                      <span className="text-gray-400">No document</span>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      National ID
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*,application/pdf"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'NATIONAL_ID');
                      }}
                    />
                    <span className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                      {uploadLoading === 'NATIONAL_ID' ? 'Uploading...' : 'Upload'}
                    </span>
                  </label>
                </div>

                {/* Driving License */}
                <div className="text-center">
                  <div className="mb-4 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {user.profile.kycDocuments?.DRIVING_LICENSE ? (
                      <span className="text-green-600">✓ Uploaded</span>
                    ) : (
                      <span className="text-gray-400">No document</span>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Driving License
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*,application/pdf"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'DRIVING_LICENSE');
                      }}
                    />
                    <span className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                      {uploadLoading === 'DRIVING_LICENSE' ? 'Uploading...' : 'Upload'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Driving License Info */}
          {user.drivingLicense && (
            <div className="bg-white shadow rounded-lg lg:col-span-2">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Driving License Information</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <p className="mt-1 text-sm text-gray-900">{user.drivingLicense.licenseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Status
                  </label>
                  <span
                    className={`inline-flex text-xs px-2 py-1 rounded-full ${
                      user.drivingLicense.verificationStatus === 'VERIFIED'
                        ? 'bg-green-100 text-green-800'
                        : user.drivingLicense.verificationStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.drivingLicense.verificationStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

