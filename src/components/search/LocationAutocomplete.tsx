'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Location {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface Props {
  value: string;
  onChange: (location: Location) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Popular locations in Zambia
const POPULAR_LOCATIONS = [
  { address: 'Lusaka City Center, Zambia', lat: -15.4167, lng: 28.2833 },
  { address: 'Kenneth Kaunda International Airport, Lusaka', lat: -15.3308, lng: 28.4526 },
  { address: 'Kitwe, Zambia', lat: -12.8024, lng: 28.2134 },
  { address: 'Ndola, Zambia', lat: -12.9587, lng: 28.6366 },
  { address: 'Livingstone, Zambia', lat: -17.8419, lng: 25.8544 },
  { address: 'Kabwe, Zambia', lat: -14.4469, lng: 28.4464 },
];

export default function LocationAutocomplete({
  value,
  onChange,
  onInputChange,
  placeholder = 'Enter location',
  className = '',
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const geocoderService = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Initialize Google Maps services
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      geocoderService.current = new (window as any).google.maps.Geocoder();
    }
  }, []);

  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      onInputChange?.(newValue);

      if (!newValue.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        setShowPopular(true);
        return;
      }

      setShowPopular(false);

      // Debounce API calls
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(newValue);
      }, 300);
    },
    [onInputChange]
  );

  const fetchSuggestions = async (input: string) => {
    if (!autocompleteService.current) {
      // Fallback to popular locations if Google Maps not loaded
      const filtered = POPULAR_LOCATIONS.filter(loc =>
        loc.address.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered.map(loc => ({ description: loc.address, ...loc })));
      setShowSuggestions(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'zm' }, // Restrict to Zambia
          types: ['geocode'], // Cities, addresses, etc.
        },
        (predictions: any, status: any) => {
          setLoading(false);

          if (status === 'OK' && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else if (status === 'ZERO_RESULTS') {
            setSuggestions([]);
            setShowSuggestions(false);
          } else {
            setError('Failed to load suggestions');
          }
        }
      );
    } catch (err) {
      setLoading(false);
      setError('Failed to load suggestions');
    }
  };

  const selectSuggestion = async (suggestion: any) => {
    const address = suggestion.description;
    setInputValue(address);
    setShowSuggestions(false);
    setShowPopular(false);

    // If it's a popular location, we already have coordinates
    if (suggestion.lat && suggestion.lng) {
      onChange({
        address,
        lat: suggestion.lat,
        lng: suggestion.lng,
      });
      return;
    }

    // Otherwise, geocode the selected place
    if (!geocoderService.current) {
      // Fallback if geocoder not available
      onChange({
        address,
        lat: -15.4167, // Default to Lusaka
        lng: 28.2833,
      });
      return;
    }

    try {
      geocoderService.current.geocode(
        { placeId: suggestion.place_id },
        (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            onChange({
              address,
              lat: location.lat(),
              lng: location.lng(),
              placeId: suggestion.place_id,
            });
          }
        }
      );
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Reverse geocode to get address
        if (geocoderService.current) {
          try {
            geocoderService.current.geocode(
              { location: { lat, lng } },
              (results: any, status: any) => {
                setGettingLocation(false);

                if (status === 'OK' && results[0]) {
                  const address = results[0].formatted_address;
                  setInputValue(address);
                  onChange({ address, lat, lng });
                } else {
                  setInputValue('Current Location');
                  onChange({ address: 'Current Location', lat, lng });
                }
              }
            );
          } catch (err) {
            setGettingLocation(false);
            setInputValue('Current Location');
            onChange({ address: 'Current Location', lat, lng });
          }
        } else {
          setGettingLocation(false);
          setInputValue('Current Location');
          onChange({ address: 'Current Location', lat, lng });
        }
      },
      _err => {
        setGettingLocation(false);
        setError('Unable to retrieve your location');
      }
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => {
            if (!inputValue.trim()) {
              setShowPopular(true);
            } else {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${className}`}
        />

        {/* Location icon */}
        <svg
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      {/* Suggestions dropdown */}
      {(showSuggestions || showPopular) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Current Location button */}
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100"
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 ${
                gettingLocation ? 'text-yellow-500 animate-spin' : 'text-blue-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <div>
              <div className="font-medium text-blue-600">
                {gettingLocation ? 'Getting location...' : 'Use current location'}
              </div>
              <div className="text-xs text-gray-500">Allow location access</div>
            </div>
          </button>

          {/* Popular locations */}
          {showPopular && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                POPULAR LOCATIONS
              </div>
              {POPULAR_LOCATIONS.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(location)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{location.address}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Google Places suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                SUGGESTIONS
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.place_id || index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{suggestion.description}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Loading state */}
          {loading && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Loading suggestions...
            </div>
          )}

          {/* No results */}
          {showSuggestions && !loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">No locations found</div>
          )}

          {/* Error message */}
          {error && <div className="px-4 py-3 text-sm text-red-600">{error}</div>}
        </div>
      )}

      {/* Click outside to close */}
      {(showSuggestions || showPopular) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSuggestions(false);
            setShowPopular(false);
          }}
        />
      )}
    </div>
  );
}
