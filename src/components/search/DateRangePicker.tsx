'use client';

import { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, addDays, addWeeks, isBefore, startOfDay } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  unavailableDates?: Date[];
  className?: string;
  isMobile?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  minDate = new Date(),
  maxDate = addDays(new Date(), 365),
  unavailableDates = [],
  className = '',
  isMobile = false,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    from: startDate || undefined,
    to: endDate || undefined,
  });

  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());

  // Update internal state when props change
  useEffect(() => {
    setSelectedRange({
      from: startDate || undefined,
      to: endDate || undefined,
    });
  }, [startDate, endDate]);

  // Handle date selection
  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      setSelectedRange(undefined);
      onDateChange(null, null);
      return;
    }

    // Auto-swap if end is before start
    if (range.from && range.to && isBefore(range.to, range.from)) {
      setSelectedRange({ from: range.to, to: range.from });
      onDateChange(range.to, range.from);
    } else {
      setSelectedRange(range);
      onDateChange(range.from || null, range.to || null);
    }
  };

  // Quick date selection handlers
  const handleQuickSelect = (option: 'today' | 'tomorrow' | 'weekend' | 'week') => {
    const today = startOfDay(new Date());
    let from: Date;
    let to: Date;

    switch (option) {
      case 'today':
        from = today;
        to = addDays(today, 1);
        break;
      case 'tomorrow':
        from = addDays(today, 1);
        to = addDays(today, 2);
        break;
      case 'weekend':
        // Find next Saturday
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
        from = addDays(today, daysUntilSaturday);
        to = addDays(from, 2); // Saturday to Monday
        break;
      case 'week':
        from = today;
        to = addWeeks(today, 1);
        break;
      default:
        return;
    }

    setSelectedRange({ from, to });
    onDateChange(from, to);
  };

  // Disable dates that are unavailable, in the past, or beyond max date
  const disabledDays = [
    { before: minDate },
    { after: maxDate },
    ...unavailableDates.map(date => ({ from: date, to: date })),
  ];

  // Calculate number of days selected
  const dayCount = selectedRange?.from && selectedRange?.to
    ? Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick select buttons */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Quick select</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickSelect('today')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('tomorrow')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('weekend')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            This Weekend
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('week')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Next Week
          </button>
        </div>
      </div>

      {/* Selected date display */}
      {selectedRange?.from && (
        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Selected Dates</div>
            <div className="text-lg font-semibold text-gray-900">
              {format(selectedRange.from, 'MMM dd, yyyy')}
              {selectedRange.to && ` - ${format(selectedRange.to, 'MMM dd, yyyy')}`}
            </div>
            {dayCount > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                {dayCount} {dayCount === 1 ? 'day' : 'days'}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleSelect(undefined)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Calendar */}
      <div className={`date-range-picker ${isMobile ? 'mobile' : ''}`}>
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={handleSelect}
          disabled={disabledDays}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          numberOfMonths={isMobile ? 1 : 2}
          showOutsideDays
          className="border-0"
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-sm font-medium',
            nav: 'space-x-1 flex items-center',
            nav_button:
              'h-7 w-7 bg-transparent hover:bg-gray-100 p-0 rounded-md transition-colors',
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
            row: 'flex w-full mt-2',
            cell: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
            day: 'h-9 w-9 p-0 font-normal hover:bg-gray-100 rounded-md transition-colors',
            day_selected:
              'bg-yellow-400 text-white hover:bg-yellow-500 hover:text-white focus:bg-yellow-500 focus:text-white rounded-md',
            day_today: 'bg-gray-100 text-gray-900 font-semibold',
            day_outside: 'text-gray-400 opacity-50',
            day_disabled: 'text-gray-400 opacity-50 cursor-not-allowed',
            day_range_middle:
              'aria-selected:bg-yellow-100 aria-selected:text-gray-900 rounded-none',
            day_range_start: 'rounded-r-none',
            day_range_end: 'rounded-l-none',
            day_hidden: 'invisible',
          }}
        />
      </div>

      {/* Instructions for mobile */}
      {isMobile && (
        <div className="text-sm text-gray-600 text-center">
          Tap start date, then tap end date
        </div>
      )}

      {/* Custom CSS for better styling */}
      <style jsx global>{`
        .date-range-picker .rdp-day_range_start,
        .date-range-picker .rdp-day_range_end {
          background-color: #facc15 !important;
          color: white !important;
        }
        
        .date-range-picker .rdp-day_range_middle {
          background-color: #fef9c3 !important;
          color: #1f2937 !important;
        }

        .date-range-picker.mobile .rdp-months {
          max-width: 100%;
        }

        .date-range-picker .rdp-day:hover:not(.rdp-day_disabled) {
          background-color: #f3f4f6;
        }

        .date-range-picker .rdp-day_selected:hover {
          background-color: #eab308 !important;
        }

        /* Touch-friendly on mobile */
        @media (max-width: 768px) {
          .date-range-picker .rdp-day {
            height: 44px;
            width: 44px;
          }
          
          .date-range-picker .rdp-head_cell {
            width: 44px;
          }
        }
      `}</style>
    </div>
  );
}
