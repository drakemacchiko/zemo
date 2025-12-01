'use client';

import React, { forwardRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';

interface DateInputProps {
  label?: string;
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: string; // ISO date string
  max?: string; // ISO date string
  className?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      required = false,
      disabled = false,
      placeholder = 'DD/MM/YYYY',
      min,
      max,
      className = '',
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(() => {
      if (value) {
        const date = new Date(value);
        return isValid(date) ? format(date, 'dd/MM/yyyy') : '';
      }
      return '';
    });

    const [isFocused, setIsFocused] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setInputValue(input);

      // Try to parse the date
      const cleanInput = input.replace(/[^\d/]/g, '');
      
      // Auto-insert slashes
      let formatted = cleanInput;
      if (cleanInput.length >= 2 && !cleanInput.includes('/')) {
        formatted = cleanInput.slice(0, 2) + '/' + cleanInput.slice(2);
      }
      if (cleanInput.length >= 4 && cleanInput.split('/').length === 2) {
        const parts = formatted.split('/');
        if (parts[0] && parts[1]) {
          formatted = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2);
        }
      }
      
      if (formatted !== input) {
        setInputValue(formatted);
      }

      // Parse complete dates
      if (formatted.length === 10) {
        try {
          const parsed = parse(formatted, 'dd/MM/yyyy', new Date());
          if (isValid(parsed)) {
            const isoString = format(parsed, 'yyyy-MM-dd');
            
            // Validate min/max
            if (min) {
              const minDate = new Date(min);
              if (parsed < minDate) return;
            }
            if (max) {
              const maxDate = new Date(max);
              if (parsed > maxDate) return;
            }
            
            onChange(isoString);
          }
        } catch (error) {
          // Invalid date, ignore
        }
      }
    };

    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      if (e.target.value) {
        const date = new Date(e.target.value);
        setInputValue(format(date, 'dd/MM/yyyy'));
      }
    };

    // Show native date picker on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {isMobile ? (
            // Native date input for mobile
            <input
              type="date"
              value={value}
              onChange={handleNativeChange}
              disabled={disabled}
              required={required}
              min={min}
              max={max}
              className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          ) : (
            // Custom text input for desktop
            <input
              ref={ref}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              placeholder={placeholder}
              maxLength={10}
              className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )}
          
          <Calendar
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${
              isFocused ? 'text-blue-500' : 'text-gray-400'
            }`}
          />
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        
        {!error && !isMobile && (
          <p className="mt-1 text-xs text-gray-500">Format: DD/MM/YYYY</p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
