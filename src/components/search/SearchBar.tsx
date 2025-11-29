'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LocationAutocomplete from './LocationAutocomplete';

interface Location {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface SearchBarProps {
  initialLocation?: string;
  initialLat?: number;
  initialLng?: number;
  initialStartDate?: string;
  initialEndDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  compact?: boolean;
}

export function SearchBar({
  initialLocation = '',
  initialLat,
  initialLng,
  initialStartDate = '',
  initialEndDate = '',
  initialStartTime = '10:00',
  initialEndTime = '10:00',
  compact = false
}: SearchBarProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'location' | 'dates' | 'time' | null>(null);
  
  // Form state - use Location object for coordinates
  const [location, setLocation] = useState<Location | null>(() => {
    if (initialLocation && initialLat !== undefined && initialLng !== undefined) {
      return {
        address: initialLocation,
        lat: initialLat,
        lng: initialLng
      };
    }
    return null;
  });
  
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  
  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);
  
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate time options (30-min intervals)
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const min = m.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${min}`);
    }
  }

  // Quick date options
  const getQuickDate = (option: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (option) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'tomorrow':
        return tomorrow.toISOString().split('T')[0];
      case 'this-weekend':
        const thisSaturday = new Date(today);
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
        thisSaturday.setDate(today.getDate() + daysUntilSaturday);
        return thisSaturday.toISOString().split('T')[0];
      case 'next-week':
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
      default:
        return '';
    }
  };

  const handleQuickDate = (option: string) => {
    const date = getQuickDate(option);
    if (date) {
      if (!startDate) {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!location) {
      newErrors.push('Please enter a location');
    }

    if (!startDate) {
      newErrors.push('Please select a pickup date');
    }

    if (!endDate) {
      newErrors.push('Please select a return date');
    }

    if (startDate && endDate) {
      const start = new Date(startDate + 'T' + startTime);
      const end = new Date(endDate + 'T' + endTime);
      
      if (end <= start) {
        newErrors.push('Return must be after pickup');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle search
  const handleSearch = () => {
    if (validate() && location) {
      const params = new URLSearchParams({
        location: location.address,
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        startDate,
        endDate,
        startTime,
        endTime
      });
      
      if (location.placeId) {
        params.append('placeId', location.placeId);
      }
      
      router.push(`/search?${params.toString()}`);
    }
  };

  // Format display text
  const getLocationDisplay = () => location?.address || 'Where';
  const getDatesDisplay = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'When';
  };
  const getTimeDisplay = () => {
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }
    return 'Time';
  };

  return (
    <div ref={searchBarRef} className={`${compact ? 'w-full' : 'w-full max-w-4xl mx-auto'}`}>
      {/* Search Pill */}
      <div className="bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center divide-x divide-gray-200">
          {/* Section 1: Location */}
          <button
            onClick={() => setActiveSection(activeSection === 'location' ? null : 'location')}
            className="flex-1 px-6 py-4 text-left hover:bg-gray-50 rounded-l-full transition-colors"
          >
            <div className="text-xs font-semibold text-gray-700 mb-1">Location</div>
            <div className={`text-sm ${location ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {getLocationDisplay()}
            </div>
          </button>

          {/* Section 2: Dates */}
          <button
            onClick={() => setActiveSection(activeSection === 'dates' ? null : 'dates')}
            className="flex-1 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="text-xs font-semibold text-gray-700 mb-1">Dates</div>
            <div className={`text-sm ${startDate && endDate ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {getDatesDisplay()}
            </div>
          </button>

          {/* Section 3: Time */}
          <button
            onClick={() => setActiveSection(activeSection === 'time' ? null : 'time')}
            className="flex-1 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="text-xs font-semibold text-gray-700 mb-1">Time</div>
            <div className={`text-sm ${startTime && endTime ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {getTimeDisplay()}
            </div>
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-8 py-4 bg-zemo-yellow hover:bg-yellow-400 rounded-r-full transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="ml-2 font-bold hidden md:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Dropdown Content */}
      {activeSection && (
        <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter location
                </label>
                <LocationAutocomplete
                  value={location?.address || ''}
                  onChange={(newLocation) => {
                    setLocation(newLocation);
                    setActiveSection(null);
                  }}
                  placeholder="Lusaka, Zambia"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Dates Section */}
          {activeSection === 'dates' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Quick options</div>
                <div className="flex flex-wrap gap-2">
                  {['today', 'tomorrow', 'this-weekend', 'next-week'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleQuickDate(option)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 capitalize"
                    >
                      {option.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Time Section */}
          {activeSection === 'time' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Time
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
