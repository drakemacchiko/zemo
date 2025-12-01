'use client';

import { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  popularTimes?: string[];
  sameAsPickup?: boolean;
  onSameAsPickupChange?: (checked: boolean) => void;
  className?: string;
}

const POPULAR_TIMES = ['10:00', '12:00', '14:00', '16:00', '18:00'];

export function TimePicker({
  value,
  onChange,
  label = 'Select time',
  popularTimes = POPULAR_TIMES,
  sameAsPickup = false,
  onSameAsPickupChange,
  className = '',
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate time options (30-min intervals)
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const min = m.toString().padStart(2, '0');
        times.push(`${hour}:${min}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Filter times based on search
  const filteredTimes = timeOptions.filter(time => {
    if (!searchQuery) return true;
    const formatted = formatTime(time);
    return formatted.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Format time for display (12-hour format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours || '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Label */}
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      {/* Selected time display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={sameAsPickup}
        className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between transition-colors ${
          sameAsPickup
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : 'bg-white text-gray-900 border-gray-300 hover:border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
        }`}
      >
        <span className={value ? 'font-medium' : 'text-gray-400'}>
          {value ? formatTime(value) : 'Select time'}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* "Same as pickup" option (for return time) */}
      {onSameAsPickupChange !== undefined && (
        <div className="mt-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAsPickup}
              onChange={e => onSameAsPickupChange(e.target.checked)}
              className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-700">Same as pickup time</span>
          </label>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !sameAsPickup && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search time..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Popular times */}
          {!searchQuery && popularTimes.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-500 mb-2">POPULAR TIMES</div>
              <div className="grid grid-cols-3 gap-2">
                {popularTimes.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      value === time
                        ? 'bg-yellow-400 text-white'
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All times */}
          <div className="max-h-64 overflow-y-auto">
            {filteredTimes.length > 0 ? (
              <div className="p-2">
                {/* AM times */}
                <div className="mb-4">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 sticky top-0 bg-white">
                    MORNING (AM)
                  </div>
                  <div className="space-y-1">
                    {filteredTimes
                      .filter(time => parseInt(time.split(':')[0] || '0') < 12)
                      .map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleTimeSelect(time)}
                          className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                            value === time
                              ? 'bg-yellow-400 text-white font-medium'
                              : 'hover:bg-gray-100 text-gray-900'
                          }`}
                        >
                          {formatTime(time)}
                        </button>
                      ))}
                  </div>
                </div>

                {/* PM times */}
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 sticky top-0 bg-white">
                    AFTERNOON/EVENING (PM)
                  </div>
                  <div className="space-y-1">
                    {filteredTimes
                      .filter(time => parseInt(time.split(':')[0] || '0') >= 12)
                      .map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleTimeSelect(time)}
                          className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                            value === time
                              ? 'bg-yellow-400 text-white font-medium'
                              : 'hover:bg-gray-100 text-gray-900'
                          }`}
                        >
                          {formatTime(time)}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No matching times</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
