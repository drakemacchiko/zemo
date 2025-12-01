'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  showClearButton?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
  success?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      helpText,
      showClearButton = false,
      showCharacterCount = false,
      maxLength,
      className = '',
      disabled,
      icon,
      success,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || '');

    const handleClear = () => {
      setValue('');
      if (props.onChange) {
        const syntheticEvent = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(syntheticEvent);
      }
    };

    const charCount = String(value).length;
    const showCounter = showCharacterCount && maxLength;

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium mb-2 transition-colors ${
              error
                ? 'text-red-600'
                : isFocused
                  ? 'text-yellow-600'
                  : 'text-gray-700'
            }`}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            {...props}
            value={value}
            maxLength={maxLength}
            disabled={disabled}
            onChange={(e) => {
              setValue(e.target.value);
              if (props.onChange) {
                props.onChange(e);
              }
            }}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) {
                props.onFocus(e);
              }
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (props.onBlur) {
                props.onBlur(e);
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg transition-all ${
              icon ? 'pl-10' : ''
            } ${
              showClearButton && value ? 'pr-10' : ''
            } ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : success
                  ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                  : 'border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
            } ${
              disabled
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-900'
            } outline-none`}
          />

          {/* Clear button */}
          {showClearButton && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Success checkmark */}
          {success && !error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <Check className="w-5 h-5" />
            </div>
          )}

          {/* Error icon */}
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Character count */}
        {showCounter && (
          <div className="text-right mt-1">
            <span
              className={`text-xs ${
                charCount > maxLength! * 0.9 ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-start">
            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
            {error}
          </p>
        )}

        {/* Help text */}
        {helpText && !error && (
          <p className="mt-2 text-sm text-gray-600">{helpText}</p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
