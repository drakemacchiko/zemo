'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface AvailabilityCalendarProps {
  bookedDates?: Date[];
  unavailableDates?: Date[];
  onDateSelect?: (startDate: Date, endDate: Date) => void;
}

export function AvailabilityCalendar({
  bookedDates = [],
  unavailableDates = [],
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const isDateBooked = (date: Date) => {
    return bookedDates.some(d => d.toDateString() === date.toDateString());
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(d => d.toDateString() === date.toDateString());
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date) || isDateBooked(date) || isDateUnavailable(date)) {
      return;
    }

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      // Complete selection
      if (date > selectedStart) {
        setSelectedEnd(date);
        onDateSelect?.(selectedStart, date);
      } else {
        setSelectedStart(date);
        setSelectedEnd(null);
      }
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isBooked = isDateBooked(date);
      const isUnavailable = isDateUnavailable(date);
      const isPast = isPastDate(date);
      const isDisabled = isBooked || isUnavailable || isPast;
      const isSelected =
        selectedStart?.toDateString() === date.toDateString() ||
        selectedEnd?.toDateString() === date.toDateString();
      const isInRange = selectedStart && selectedEnd && date > selectedStart && date < selectedEnd;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isDisabled}
          className={`
            aspect-square rounded-lg flex items-center justify-center text-sm font-medium
            transition-colors relative
            ${
              isDisabled
                ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
            }
            ${isSelected ? 'bg-zemo-yellow text-gray-900 font-bold' : ''}
            ${isInRange ? 'bg-yellow-100' : ''}
            ${isBooked ? 'line-through' : ''}
          `}
        >
          {day}
          {isBooked && <div className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full" />}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-6">
        <Calendar className="w-6 h-6 text-zemo-yellow flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Availability</h2>
          <p className="text-gray-600">Select your trip dates to check availability</p>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-zemo-yellow rounded" />
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-300 text-xs line-through">1</span>
          </div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 rounded" />
          <span className="text-gray-600">Unavailable</span>
        </div>
      </div>

      {/* Selected Range Display */}
      {selectedStart && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Selected:</strong> {selectedStart.toLocaleDateString()}
            {selectedEnd && ` - ${selectedEnd.toLocaleDateString()}`}
          </p>
        </div>
      )}
    </div>
  );
}
