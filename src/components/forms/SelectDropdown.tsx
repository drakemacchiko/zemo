'use client';

import { SelectHTMLAttributes, forwardRef, useState } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface SelectDropdownProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  loading?: boolean;
}

export const SelectDropdown = forwardRef<HTMLSelectElement, SelectDropdownProps>(
  (
    {
      label,
      error,
      helpText,
      options,
      searchable = false,
      clearable = false,
      placeholder = 'Select an option',
      className = '',
      disabled,
      loading,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValue, setSelectedValue] = useState(value || '');

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    const groupedOptions = filteredOptions.reduce(
      (acc, option) => {
        const group = option.group || 'default';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(option);
        return acc;
      },
      {} as Record<string, SelectOption[]>
    );

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
      setSearchQuery('');
    };

    const handleClear = () => {
      setSelectedValue('');
      if (onChange) {
        onChange('');
      }
      setSearchQuery('');
    };

    if (!searchable) {
      // Simple native select
      return (
        <div className={`w-full ${className}`}>
          {label && (
            <label
              htmlFor={props.id}
              className={`block text-sm font-medium mb-2 ${
                error ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          <div className="relative">
            <select
              ref={ref}
              {...props}
              value={selectedValue}
              disabled={disabled || loading}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                if (onChange) {
                  onChange(e.target.value);
                }
              }}
              className={`w-full px-4 py-3 pr-10 border rounded-lg appearance-none transition-all ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
              } ${
                disabled || loading
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-900'
              } outline-none`}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <optgroup key={group} label={group !== 'default' ? group : undefined}>
                  {groupOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {helpText && !error && <p className="mt-2 text-sm text-gray-600">{helpText}</p>}
        </div>
      );
    }

    // Custom searchable select
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium mb-2 ${
              error ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Selected value display */}
          <button
            type="button"
            onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
            disabled={disabled || loading}
            className={`w-full px-4 py-3 pr-10 border rounded-lg text-left flex items-center justify-between transition-all ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
            } ${
              disabled || loading
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-900'
            } outline-none`}
          >
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
              {loading ? 'Loading...' : selectedOption?.label || placeholder}
            </span>
            
            {clearable && selectedValue && !disabled && !loading && (
              <X
                className="w-5 h-5 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            
            {(!clearable || !selectedValue) && (
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden">
                {/* Search input */}
                <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    Object.entries(groupedOptions).map(([group, groupOptions]) => (
                      <div key={group}>
                        {group !== 'default' && (
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                            {group}
                          </div>
                        )}
                        {groupOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => !option.disabled && handleSelect(option.value)}
                            disabled={option.disabled}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors ${
                              option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              selectedValue === option.value ? 'bg-yellow-50 text-yellow-700' : 'text-gray-900'
                            }`}
                          >
                            <span>{option.label}</span>
                            {selectedValue === option.value && (
                              <Check className="w-5 h-5 text-yellow-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No options found
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {helpText && !error && <p className="mt-2 text-sm text-gray-600">{helpText}</p>}

        {/* Hidden native select for form submission */}
        <select
          ref={ref}
          {...props}
          value={selectedValue}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

SelectDropdown.displayName = 'SelectDropdown';
