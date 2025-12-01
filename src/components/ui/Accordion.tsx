'use client';

import { useState, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionProps {
  title: string;
  badge?: string | number;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  alwaysOpen?: boolean; // For desktop - always expanded
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}

export function Accordion({
  title,
  badge,
  icon,
  children,
  defaultOpen = false,
  alwaysOpen = false,
  onToggle,
  className = '',
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    // On desktop (≥ 1024px), keep always open if specified
    if (alwaysOpen && window.innerWidth >= 1024) {
      setIsOpen(true);
    }
  }, [alwaysOpen]);

  const handleToggle = () => {
    if (alwaysOpen && window.innerWidth >= 1024) return; // Don't toggle on desktop if alwaysOpen
    
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Accordion Header */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-zemo-yellow focus:ring-inset"
        aria-expanded={isOpen}
        aria-label={`Toggle ${title} section`}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          {icon && <div className="text-gray-600 flex-shrink-0">{icon}</div>}
          
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          
          {/* Badge */}
          {badge && (
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              {badge}
            </span>
          )}
        </div>

        {/* Chevron Indicator */}
        <ChevronDown
          className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          } ${alwaysOpen && window.innerWidth >= 1024 ? 'hidden' : ''}`}
        />
      </button>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="p-6 pt-0 border-t border-gray-100">{children}</div>
      </div>
    </div>
  );
}

// Accordion Group Component for managing multiple accordions
export interface AccordionGroupProps {
  children: ReactNode;
  allowMultiple?: boolean;
  className?: string;
}

export function AccordionGroup({
  children,
  className = '',
}: AccordionGroupProps) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}
