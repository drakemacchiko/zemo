'use client';

import { Star, MessageCircle, Shield } from 'lucide-react';
import Image from 'next/image';

interface Host {
  id: string;
  profile?: {
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
}

interface HostInfoProps {
  host: Host;
  joinedYear?: number;
  totalVehicles?: number;
  totalTrips?: number;
  rating?: number;
  reviewCount?: number;
  responseTime?: string;
  responseRate?: number;
  isSuperhost?: boolean;
  languages?: string[];
  onMessageHost?: () => void;
}

export function HostInfo({
  host,
  joinedYear = 2024,
  totalVehicles = 1,
  totalTrips = 0,
  rating = 0,
  reviewCount = 0,
  responseTime = 'Within a few hours',
  responseRate = 0,
  isSuperhost = false,
  languages = ['English'],
  onMessageHost,
}: HostInfoProps) {
  const hostName = host.profile ? `${host.profile.firstName} ${host.profile.lastName}` : 'Host';

  const firstInitial = host.profile?.firstName?.[0] || 'H';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Hosted by {host.profile?.firstName || 'Host'}</h2>

      {/* Host Profile */}
      <div className="flex items-start gap-4 mb-6">
        {/* Avatar */}
        <div className="relative w-16 h-16 flex-shrink-0">
          {host.profile?.profilePictureUrl ? (
            <Image
              src={host.profile.profilePictureUrl}
              alt={hostName}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-zemo-yellow rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{firstInitial}</span>
            </div>
          )}
          {isSuperhost && (
            <div className="absolute -bottom-1 -right-1 bg-pink-500 rounded-full p-1">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Host Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold">{hostName}</h3>
            {isSuperhost && (
              <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded">
                Superhost
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">Joined in {joinedYear}</p>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-gray-600">({reviewCount} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Host Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalVehicles}</div>
          <div className="text-xs text-gray-600">Vehicle{totalVehicles !== 1 ? 's' : ''}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalTrips}</div>
          <div className="text-xs text-gray-600">Trip{totalTrips !== 1 ? 's' : ''}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{responseRate}%</div>
          <div className="text-xs text-gray-600">Response Rate</div>
        </div>
      </div>

      {/* Response Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Response time</div>
            <div className="text-sm text-gray-600">{responseTime}</div>
          </div>
        </div>

        {languages && languages.length > 0 && (
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            <div>
              <div className="font-medium text-sm">Languages</div>
              <div className="text-sm text-gray-600">{languages.join(', ')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Message Host Button */}
      {onMessageHost && (
        <button
          onClick={onMessageHost}
          className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Message Host
        </button>
      )}

      {/* View Profile Link */}
      <button className="w-full mt-3 text-gray-600 hover:text-gray-900 text-sm font-medium">
        View host profile
      </button>
    </div>
  );
}
