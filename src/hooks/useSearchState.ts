'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SearchLocation {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface SearchState {
  location: SearchLocation | null;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  lastUpdated: number;
}

const STORAGE_KEY = 'zemo_search_state';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

const initialState: SearchState = {
  location: null,
  startDate: '',
  endDate: '',
  startTime: '10:00',
  endTime: '10:00',
  lastUpdated: Date.now(),
};

export function useSearchState() {
  const [searchState, setSearchState] = useState<SearchState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout>();

  // Load from sessionStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: SearchState = JSON.parse(stored);
          
          // Check if expired (24 hours)
          if (Date.now() - parsed.lastUpdated < EXPIRY_TIME) {
            setSearchState(parsed);
          } else {
            // Expired, clear storage
            sessionStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load search state:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadState();
  }, []);

  // Auto-save to sessionStorage (debounced)
  useEffect(() => {
    if (!isLoaded) return;

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Debounce save by 300ms
    saveTimerRef.current = setTimeout(() => {
      try {
        const stateToSave = {
          ...searchState,
          lastUpdated: Date.now(),
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Failed to save search state:', error);
      }
    }, 300);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [searchState, isLoaded]);

  // Sync across tabs using storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed: SearchState = JSON.parse(e.newValue);
          setSearchState(parsed);
        } catch (error) {
          console.error('Failed to sync search state:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update individual fields
  const updateLocation = useCallback((location: SearchLocation | null) => {
    setSearchState(prev => ({ ...prev, location }));
    setHasUnsavedChanges(true);
  }, []);

  const updateStartDate = useCallback((startDate: string) => {
    setSearchState(prev => ({ ...prev, startDate }));
    setHasUnsavedChanges(true);
  }, []);

  const updateEndDate = useCallback((endDate: string) => {
    setSearchState(prev => ({ ...prev, endDate }));
    setHasUnsavedChanges(true);
  }, []);

  const updateStartTime = useCallback((startTime: string) => {
    setSearchState(prev => ({ ...prev, startTime }));
    setHasUnsavedChanges(true);
  }, []);

  const updateEndTime = useCallback((endTime: string) => {
    setSearchState(prev => ({ ...prev, endTime }));
    setHasUnsavedChanges(true);
  }, []);

  // Update multiple fields at once
  const updateSearchState = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // Clear search state
  const clearSearchState = useCallback(() => {
    setSearchState(initialState);
    sessionStorage.removeItem(STORAGE_KEY);
    setHasUnsavedChanges(false);
  }, []);

  // Check if search is complete
  const isSearchComplete = useCallback(() => {
    return !!(
      searchState.location &&
      searchState.startDate &&
      searchState.endDate &&
      searchState.startTime &&
      searchState.endTime
    );
  }, [searchState]);

  // Check if search has any data
  const hasSearchData = useCallback(() => {
    return !!(
      searchState.location ||
      searchState.startDate ||
      searchState.endDate
    );
  }, [searchState]);

  // Validate search dates
  const validateDates = useCallback(() => {
    if (!searchState.startDate || !searchState.endDate) {
      return { valid: false, error: 'Please select both pickup and return dates' };
    }

    const start = new Date(searchState.startDate + 'T' + searchState.startTime);
    const end = new Date(searchState.endDate + 'T' + searchState.endTime);

    if (end <= start) {
      return { valid: false, error: 'Return date must be after pickup date' };
    }

    const now = new Date();
    if (start < now) {
      return { valid: false, error: 'Pickup date cannot be in the past' };
    }

    return { valid: true, error: null };
  }, [searchState]);

  // Get search duration in days
  const getSearchDuration = useCallback(() => {
    if (!searchState.startDate || !searchState.endDate) {
      return 0;
    }

    const start = new Date(searchState.startDate);
    const end = new Date(searchState.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [searchState]);

  return {
    // State
    searchState,
    isLoaded,
    hasUnsavedChanges,
    
    // Individual updates
    updateLocation,
    updateStartDate,
    updateEndDate,
    updateStartTime,
    updateEndTime,
    
    // Bulk update
    updateSearchState,
    
    // Actions
    clearSearchState,
    
    // Utilities
    isSearchComplete: isSearchComplete(),
    hasSearchData: hasSearchData(),
    validateDates,
    getSearchDuration: getSearchDuration(),
  };
}
