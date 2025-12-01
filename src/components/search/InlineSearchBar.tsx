'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchState, SearchLocation } from '@/hooks/useSearchState';
import LocationAutocomplete from './LocationAutocomplete';
import { DateRangePicker } from './DateRangePicker';
import { TimePicker } from './TimePicker';

interface InlineSearchBarProps {
  compact?: boolean;
  autoFocus?: boolean;
  showContinuePrompt?: boolean;
}

type ActiveSection = 'location' | 'dates' | 'time' | null;

export function InlineSearchBar({
  compact = false,
  autoFocus = false,
  showContinuePrompt = true,
}: InlineSearchBarProps) {
  const router = useRouter();
  const {
    searchState,
    updateLocation,
    updateStartDate,
    updateEndDate,
    updateStartTime,
    updateEndTime,
    clearSearchState,
    isSearchComplete,
    hasSearchData,
    validateDates,
  } = useSearchState();

  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [sameAsPickupTime, setSameAsPickupTime] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Show continue prompt if there's existing search data
  useEffect(() => {
    if (showContinuePrompt && hasSearchData && !isSearchComplete) {
      setShowPrompt(true);
    }
  }, [hasSearchData, isSearchComplete, showContinuePrompt]);

  // Auto-focus location on mount if enabled
  useEffect(() => {
    if (autoFocus && !searchState.location) {
      setActiveSection('location');
    }
  }, [autoFocus, searchState.location]);

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

  // Handle section toggle
  const toggleSection = (section: ActiveSection) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      setErrors([]);
    }
  };

  // Handle date changes from DateRangePicker
  const handleDateChange = (start: Date | null, end: Date | null) => {
    if (start) {
      const dateStr = start.toISOString().split('T')[0];
      if (dateStr) updateStartDate(dateStr);
    }
    if (end) {
      const dateStr = end.toISOString().split('T')[0];
      if (dateStr) updateEndDate(dateStr);
    }
    
    // Auto-advance to time section if both dates selected
    if (start && end) {
      setTimeout(() => setActiveSection('time'), 300);
    }
  };

  // Handle same as pickup time
  useEffect(() => {
    if (sameAsPickupTime) {
      updateEndTime(searchState.startTime);
    }
  }, [sameAsPickupTime, searchState.startTime, updateEndTime]);

  // Validation
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!searchState.location) {
      newErrors.push('Please select a location');
    }

    const dateValidation = validateDates();
    if (!dateValidation.valid && dateValidation.error) {
      newErrors.push(dateValidation.error);
    }

    if (!searchState.startTime || !searchState.endTime) {
      newErrors.push('Please select pickup and return times');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle search
  const handleSearch = () => {
    if (validate() && searchState.location) {
      const params = new URLSearchParams({
        location: searchState.location.address,
        lat: searchState.location.lat.toString(),
        lng: searchState.location.lng.toString(),
        startDate: searchState.startDate,
        endDate: searchState.endDate,
        startTime: searchState.startTime,
        endTime: searchState.endTime,
      });

      if (searchState.location.placeId) {
        params.append('placeId', searchState.location.placeId);
      }

      router.push(`/search?${params.toString()}`);
    }
  };

  // Format display text
  const getLocationDisplay = () => searchState.location?.address || 'Where';
  
  const getDatesDisplay = () => {
    if (searchState.startDate && searchState.endDate) {
      const start = new Date(searchState.startDate);
      const end = new Date(searchState.endDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'When';
  };

  const getTimeDisplay = () => {
    if (searchState.startTime && searchState.endTime) {
      return `${searchState.startTime} - ${searchState.endTime}`;
    }
    return 'Time';
  };

  // Mobile full-screen modal wrapper
  const MobileModal = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto md:hidden">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setActiveSection(null)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="w-10" /> {/* Spacer */}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  return (
    <div ref={searchBarRef} className={`${compact ? 'w-full' : 'w-full max-w-4xl mx-auto'}`}>
      {/* Continue prompt */}
      {showPrompt && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Continue your search?</p>
            <p className="text-xs text-blue-700 mt-1">You have an incomplete search</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearSearchState();
                setShowPrompt(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Search Pill */}
      <div className="bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center divide-x divide-gray-200">
          {/* Location Section */}
          <button
            onClick={() => toggleSection('location')}
            className="flex-1 px-6 py-4 text-left hover:bg-gray-50 rounded-l-full transition-colors min-w-0"
          >
            <div className="text-xs font-semibold text-gray-700 mb-1">Location</div>
            <div
              className={`text-sm truncate ${searchState.location ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
            >
              {getLocationDisplay()}
            </div>
          </button>

          {/* Dates Section */}
          <button
            onClick={() => toggleSection('dates')}
            className="flex-1 px-6 py-4 text-left hover:bg-gray-50 transition-colors min-w-0"
          >
            <div className="text-xs font-semibold text-gray-700 mb-1">Dates</div>
            <div
              className={`text-sm truncate ${searchState.startDate && searchState.endDate ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
            >
              {getDatesDisplay()}
            </div>
          </button>

          {/* Time Section */}
          <button
            onClick={() => toggleSection('time')}
            className="flex-1 px-6 py-4 text-left hover:bg-gray-50 transition-colors min-w-0"
          >
            <div className="text-xs font-semibold text-gray-700 mb-1">Time</div>
            <div
              className={`text-sm truncate ${searchState.startTime && searchState.endTime ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
            >
              {getTimeDisplay()}
            </div>
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 rounded-r-full transition-colors flex items-center justify-center"
            title="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="ml-2 font-bold hidden lg:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Desktop Dropdown Content */}
      {activeSection && !isMobile && (
        <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {activeSection === 'location' && (
            <div className="space-y-4">
              <LocationAutocomplete
                value={searchState.location?.address || ''}
                onChange={(location: SearchLocation) => {
                  updateLocation(location);
                  setActiveSection('dates');
                }}
                placeholder="Enter city or airport"
                className="text-base"
              />
            </div>
          )}

          {activeSection === 'dates' && (
            <DateRangePicker
              startDate={searchState.startDate ? new Date(searchState.startDate) : null}
              endDate={searchState.endDate ? new Date(searchState.endDate) : null}
              onDateChange={handleDateChange}
            />
          )}

          {activeSection === 'time' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TimePicker
                value={searchState.startTime}
                onChange={updateStartTime}
                label="Pickup Time"
              />
              <TimePicker
                value={searchState.endTime}
                onChange={updateEndTime}
                label="Return Time"
                sameAsPickup={sameAsPickupTime}
                onSameAsPickupChange={setSameAsPickupTime}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile Full-Screen Modals */}
      {isMobile && activeSection === 'location' && (
        <MobileModal title="Select Location">
          <LocationAutocomplete
            value={searchState.location?.address || ''}
            onChange={(location: SearchLocation) => {
              updateLocation(location);
              setActiveSection('dates');
            }}
            placeholder="Enter city or airport"
          />
        </MobileModal>
      )}

      {isMobile && activeSection === 'dates' && (
        <MobileModal title="Select Dates">
          <DateRangePicker
            startDate={searchState.startDate ? new Date(searchState.startDate) : null}
            endDate={searchState.endDate ? new Date(searchState.endDate) : null}
            onDateChange={handleDateChange}
            isMobile
          />
          <button
            onClick={() => setActiveSection('time')}
            disabled={!searchState.startDate || !searchState.endDate}
            className="w-full mt-4 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Select Time
          </button>
        </MobileModal>
      )}

      {isMobile && activeSection === 'time' && (
        <MobileModal title="Select Time">
          <div className="space-y-4">
            <TimePicker
              value={searchState.startTime}
              onChange={updateStartTime}
              label="Pickup Time"
            />
            <TimePicker
              value={searchState.endTime}
              onChange={updateEndTime}
              label="Return Time"
              sameAsPickup={sameAsPickupTime}
              onSameAsPickupChange={setSameAsPickupTime}
            />
          </div>
          <button
            onClick={() => {
              setActiveSection(null);
              handleSearch();
            }}
            className="w-full mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold"
          >
            Search Vehicles
          </button>
        </MobileModal>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">Please fix the following:</h4>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Clear search button */}
      {hasSearchData && (
        <div className="mt-3 text-center">
          <button
            onClick={clearSearchState}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
