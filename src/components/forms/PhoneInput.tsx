'use client';

import React, { useState, forwardRef, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const ZAMBIA_CODES = [
  { code: '+260', flag: '🇿🇲', country: 'Zambia', format: '9X XXX XXXX' },
];

const OTHER_CODES = [
  { code: '+1', flag: '🇺🇸', country: 'USA/Canada', format: '(XXX) XXX-XXXX' },
  { code: '+44', flag: '🇬🇧', country: 'UK', format: 'XXXX XXX XXX' },
  { code: '+27', flag: '🇿🇦', country: 'South Africa', format: 'XX XXX XXXX' },
  { code: '+254', flag: '🇰🇪', country: 'Kenya', format: 'XXX XXX XXX' },
  { code: '+255', flag: '🇹🇿', country: 'Tanzania', format: 'XXX XXX XXX' },
];

const ALL_CODES = [...ZAMBIA_CODES, ...OTHER_CODES];

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      required = false,
      disabled = false,
      placeholder = '97 123 4567',
      className = '',
    },
    ref
  ) => {
    const [countryCode, setCountryCode] = useState('+260');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    // Parse initial value
    useEffect(() => {
      if (value) {
        const matchedCode = ALL_CODES.find((c) => value.startsWith(c.code));
        if (matchedCode) {
          setCountryCode(matchedCode.code);
          setPhoneNumber(value.slice(matchedCode.code.length).trim());
        } else {
          setPhoneNumber(value);
        }
      }
    }, [value]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/[^\d\s]/g, '');
      setPhoneNumber(input);
      onChange(`${countryCode}${input.replace(/\s/g, '')}`);
    };

    const handleCountryChange = (code: string) => {
      setCountryCode(code);
      setShowCountryPicker(false);
      onChange(`${code}${phoneNumber.replace(/\s/g, '')}`);
    };

    const formatPhoneNumber = (num: string) => {
      const cleaned = num.replace(/\s/g, '');
      const currentCountry = ALL_CODES.find((c) => c.code === countryCode);

      if (!currentCountry) return num;

      // Format based on country
      if (countryCode === '+260') {
        // Zambia: 9X XXX XXXX
        if (cleaned.length <= 2) return cleaned;
        if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
      }

      return num;
    };

    const selectedCountry = ALL_CODES.find((c) => c.code === countryCode);

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <div className="flex">
            {/* Country Code Selector */}
            <button
              type="button"
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              disabled={disabled}
              className="flex items-center gap-2 px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-xl">{selectedCountry?.flag}</span>
              <span className="text-sm font-medium text-gray-700">{countryCode}</span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  showCountryPicker ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Phone Number Input */}
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={ref}
                type="tel"
                value={formatPhoneNumber(phoneNumber)}
                onChange={handlePhoneChange}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Country Picker Dropdown */}
          {showCountryPicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowCountryPicker(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-full max-w-xs bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {/* Zambia First */}
                <div className="p-2 border-b border-gray-100">
                  <div className="text-xs font-medium text-gray-500 px-2 py-1">
                    Primary
                  </div>
                  {ZAMBIA_CODES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryChange(country.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 transition-colors ${
                        countryCode === country.code ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {country.country}
                        </div>
                        <div className="text-xs text-gray-500">{country.format}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {country.code}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Other Countries */}
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-2 py-1">
                    Other Countries
                  </div>
                  {OTHER_CODES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryChange(country.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 transition-colors ${
                        countryCode === country.code ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {country.country}
                        </div>
                        <div className="text-xs text-gray-500">{country.format}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {country.code}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
