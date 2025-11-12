// Accessibility Utilities & Helpers
// Phase 11: PWA & Accessibility

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable && lastFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable && firstFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Focus restoration
export function saveFocus(): () => void {
  const activeElement = document.activeElement as HTMLElement;

  return () => {
    if (activeElement && activeElement.focus) {
      activeElement.focus();
    }
  };
}

// Keyboard navigation helper
export function handleArrowNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void
) {
  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = (currentIndex - 1 + items.length) % items.length;
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = items.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  onIndexChange(newIndex);
  items[newIndex]?.focus();
}

// Check for reduced motion preference
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Check for high contrast preference
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Generate unique ID for accessibility
let idCounter = 0;
export function generateA11yId(prefix = 'a11y'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

// ARIA label helpers
export function getAriaLabel(element: HTMLElement): string | null {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent ||
    null
  );
}

// Color contrast checker (simplified WCAG AA)
export function meetsContrastRatio(
  foreground: string,
  background: string,
  largeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = largeText ? 3 : 4.5; // WCAG AA standards
  return ratio >= minRatio;
}

function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r = 0, g = 0, b = 0] = rgb.map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1]!, 16),
        parseInt(result[2]!, 16),
        parseInt(result[3]!, 16),
      ]
    : null;
}

// Skip link helper
export function scrollToMain() {
  const main = document.getElementById('main-content');
  if (main) {
    main.focus();
    main.scrollIntoView({ behavior: 'smooth' });
  }
}

// Form validation announcements
export function announceFormError(fieldName: string, error: string) {
  announceToScreenReader(`${fieldName}: ${error}`, 'assertive');
}

export function announceFormSuccess(message: string) {
  announceToScreenReader(message, 'polite');
}

// Modal accessibility helper
export function makeModalAccessible(
  modal: HTMLElement,
  onClose: () => void
): () => void {
  const restoreFocus = saveFocus();
  const removeTrapFocus = trapFocus(modal);

  // Handle Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  document.addEventListener('keydown', handleEscape);

  // Set initial focus
  const firstFocusable = modal.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();

  // Cleanup
  return () => {
    removeTrapFocus();
    document.removeEventListener('keydown', handleEscape);
    restoreFocus();
  };
}

// Live region updates
export function updateLiveRegion(id: string, message: string) {
  const region = document.getElementById(id);
  if (region) {
    region.textContent = message;
  }
}

// Visibility helper for screen readers
export function hideFromScreenReaders(element: HTMLElement) {
  element.setAttribute('aria-hidden', 'true');
}

export function showToScreenReaders(element: HTMLElement) {
  element.removeAttribute('aria-hidden');
}

// Debounced screen reader announcement (prevent flooding)
let announcementTimeout: NodeJS.Timeout;
export function debouncedAnnounce(
  message: string,
  delay = 500,
  priority: 'polite' | 'assertive' = 'polite'
) {
  clearTimeout(announcementTimeout);
  announcementTimeout = setTimeout(() => {
    announceToScreenReader(message, priority);
  }, delay);
}
