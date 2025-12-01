'use client';

import { User, Star, Car, Calendar, Clock, MessageCircle, Shield, CheckCircle } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';
import Image from 'next/image';

interface HostAccordionProps {
  host: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string;
      bio?: string;
    };
  };
  joinedYear?: number;
  totalVehicles?: number;
  totalTrips?: number;
  rating?: number;
  reviewCount?: number;
  responseTime?: string;
  responseRate?: number;
  verificationBadges?: string[];
  onMessageHost?: () => void;
  defaultOpen?: boolean;
}

export function HostAccordion({
  host,
  joinedYear = new Date().getFullYear(),
  totalVehicles = 1,
  totalTrips = 0,
  rating = 0,
  reviewCount = 0,
  responseTime = 'Within a few hours',
  responseRate = 90,
  verificationBadges = [],
  onMessageHost,
  defaultOpen = false,
}: HostAccordionProps) {
  const hostName = `${host.profile.firstName} ${host.profile.lastName}`;
  const hostInitials = `${host.profile.firstName[0]}${host.profile.lastName[0]}`;

  const stats = [
    {
      icon: Calendar,
      label: 'Joined',
      value: joinedYear.toString(),
    },
    {
      icon: Car,
      label: 'Vehicles',
      value: totalVehicles.toString(),
    },
    {
      icon: Star,
      label: 'Trips',
      value: totalTrips.toString(),
    },
    ...(rating > 0
      ? [
          {
            icon: Star,
            label: 'Rating',
            value: `${rating.toFixed(1)} (${reviewCount})`,
          },
        ]
      : []),
  ];

  return (
    <Accordion
      title="About the Host"
      icon={<User className="w-5 h-5" />}
      defaultOpen={defaultOpen}
      alwaysOpen={false}
    >
      <div className="space-y-6">
        {/* Host Profile */}
        <div className="flex items-start gap-4">
          {/* Profile Picture */}
          <div className="relative w-20 h-20 flex-shrink-0">
            {host.profile.profilePictureUrl ? (
              <Image
                src={host.profile.profilePictureUrl}
                alt={hostName}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-zemo-yellow flex items-center justify-center text-gray-900 font-bold text-2xl">
                {hostInitials}
              </div>
            )}
            {verificationBadges.includes('verified') && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Host Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{hostName}</h3>
            
            {/* Verification Badges */}
            {verificationBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {verificationBadges.includes('verified') && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <Shield className="w-3 h-3" />
                    Verified Host
                  </div>
                )}
                {verificationBadges.includes('superhost') && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    <Star className="w-3 h-3" />
                    Superhost
                  </div>
                )}
              </div>
            )}

            {/* Host Bio */}
            {host.profile.bio && (
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">{host.profile.bio}</p>
            )}
          </div>
        </div>

        {/* Host Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <stat.icon className="w-4 h-4" />
                <span className="text-sm">{stat.label}</span>
              </div>
              <div className="font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Response Info */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-900">Response time</div>
              <div className="text-sm text-gray-700">{responseTime}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MessageCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-900">Response rate</div>
              <div className="text-sm text-gray-700">{responseRate}%</div>
            </div>
          </div>
        </div>

        {/* Message Host Button */}
        {onMessageHost && (
          <button
            onClick={onMessageHost}
            className="w-full px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Message Host
          </button>
        )}

        {/* Host Guidelines */}
        <div className="text-xs text-gray-600 pt-4 border-t border-gray-200">
          <p>
            To protect your payment, never transfer money or communicate outside of the ZEMO platform.
          </p>
        </div>
      </div>
    </Accordion>
  );
}
