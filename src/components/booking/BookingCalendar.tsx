'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface BookingCalendarProps {
  vehicleId: string;
  dailyRate: number;
  onDateSelect?: (startDate: Date, endDate: Date) => void;
  selectedStartDate?: Date;
  selectedEndDate?: Date;
}

interface BookedDate {
  date: string;
  status: 'booked' | 'pending';
}

export function BookingCalendar({
  vehicleId,
  dailyRate,
  onDateSelect,
  selectedStartDate,
  selectedEndDate
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<Date | null>(selectedStartDate || null);
  const [localEndDate, setLocalEndDate] = useState<Date | null>(selectedEndDate || null);

  // Load booked dates for the current month
  const loadBookedDates = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would fetch from your API
      // For now, we'll use mock data
      const mockBookedDates: BookedDate[] = [
        { date: '2025-11-15', status: 'booked' },
        { date: '2025-11-16', status: 'booked' },
        { date: '2025-11-22', status: 'pending' },
        { date: '2025-11-23', status: 'pending' },
        { date: '2025-12-05', status: 'booked' },
        { date: '2025-12-25', status: 'booked' },
        { date: '2025-12-26', status: 'booked' },
      ];

      setBookedDates(mockBookedDates);
    } catch (error) {
      console.error('Failed to load booked dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookedDates();
  }, [currentMonth, vehicleId]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.some(bookedDate => bookedDate.date === dateStr);
  };

  const isDatePending = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.some(bookedDate => bookedDate.date === dateStr && bookedDate.status === 'pending');
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!localStartDate && !localEndDate) return false;
    
    if (localStartDate && !localEndDate) {
      return date.getTime() === localStartDate.getTime();
    }
    
    if (localStartDate && localEndDate) {
      return date >= localStartDate && date <= localEndDate;
    }
    
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateInPast(date) || isDateBooked(date)) {
      return;
    }

    if (!localStartDate || (localStartDate && localEndDate)) {
      // Start new selection
      setLocalStartDate(date);
      setLocalEndDate(null);
    } else if (localStartDate && !localEndDate) {
      // Complete selection
      if (date < localStartDate) {
        setLocalStartDate(date);
        setLocalEndDate(localStartDate);
      } else {
        setLocalEndDate(date);
      }
      
      // Notify parent component
      if (onDateSelect) {
        const start = date < localStartDate ? date : localStartDate;
        const end = date < localStartDate ? localStartDate : date;
        onDateSelect(start, end);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const clearSelection = () => {
    setLocalStartDate(null);
    setLocalEndDate(null);
  };

  const calculateTotalPrice = () => {
    if (!localStartDate || !localEndDate) return 0;
    
    const days = Math.ceil((localEndDate.getTime() - localStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days * dailyRate;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Select Dates</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-medium text-gray-900 min-w-[140px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {dayNames.map(dayName => (
          <div key={dayName} className="text-center text-sm font-medium text-gray-500 py-2">
            {dayName}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square" />;
          }
          
          const isBooked = isDateBooked(day);
          const isPending = isDatePending(day);
          const isInPast = isDateInPast(day);
          const isSelected = isDateSelected(day);
          const isClickable = !isInPast && !isBooked;
          
          return (
            <button
              key={day.getTime()}
              onClick={() => handleDateClick(day)}
              disabled={!isClickable || isLoading}
              className={`
                aspect-square text-sm font-medium rounded-lg transition-all duration-200
                ${isSelected 
                  ? 'bg-zemo-yellow text-zemo-black ring-2 ring-zemo-yellow ring-offset-2' 
                  : 'hover:bg-gray-100'
                }
                ${isBooked && !isPending 
                  ? 'bg-red-100 text-red-500 cursor-not-allowed' 
                  : ''
                }
                ${isPending 
                  ? 'bg-orange-100 text-orange-600 cursor-not-allowed' 
                  : ''
                }
                ${isInPast && !isBooked 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : ''
                }
                ${isClickable && !isSelected 
                  ? 'text-gray-900 hover:bg-gray-100' 
                  : ''
                }
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 rounded mr-2" />
          <span>Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-100 rounded mr-2" />
          <span>Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-zemo-yellow rounded mr-2" />
          <span>Selected</span>
        </div>
      </div>

      {/* Selection Summary */}
      {localStartDate && localEndDate && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Selected dates:</span>
            <button
              onClick={clearSelection}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          </div>
          <div className="text-sm font-medium text-gray-900 mb-2">
            {localStartDate.toLocaleDateString()} - {localEndDate.toLocaleDateString()}
          </div>
          <div className="text-lg font-semibold text-zemo-black">
            Total: {formatCurrency(calculateTotalPrice())}
          </div>
          <div className="text-sm text-gray-600">
            {Math.ceil((localEndDate.getTime() - localStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
            × {formatCurrency(dailyRate)}/day
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
    </div>
  );
}