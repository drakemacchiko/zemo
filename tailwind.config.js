/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ZEMO Brand Colors
      colors: {
        zemo: {
          yellow: '#FFD400',
          black: '#0A0A0A',
          'yellow-light': '#FFF266',
          'yellow-dark': '#E6BF00',
          'black-light': '#1A1A1A',
          'gray-50': '#F9FAFB',
          'gray-100': '#F3F4F6',
          'gray-200': '#E5E7EB',
          'gray-300': '#D1D5DB',
          'gray-400': '#9CA3AF',
          'gray-500': '#6B7280',
          'gray-600': '#4B5563',
          'gray-700': '#374151',
          'gray-800': '#1F2937',
          'gray-900': '#111827',
        },
        // Status colors for bookings, payments, etc.
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      
      // ZEMO Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        heading: '900', // Very bold for headings
        'sub-heading': '700',
        body: '500',
        light: '400',
      },
      
      // ZEMO Spacing Scale
      spacing: {
        '4': '0.25rem',   // 4px
        '8': '0.5rem',    // 8px
        '16': '1rem',     // 16px
        '24': '1.5rem',   // 24px
        '32': '2rem',     // 32px
        '48': '3rem',     // 48px
        '64': '4rem',     // 64px
      },
      
      // ZEMO Border Radius
      borderRadius: {
        'zemo': '8px',
        'zemo-sm': '4px',
        'zemo-lg': '12px',
        'zemo-xl': '16px',
      },
      
      // Mobile-first breakpoints for Zambian market
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // Typography scale optimized for mobile
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      // Box shadows for depth
      boxShadow: {
        'zemo-sm': '0 1px 2px 0 rgba(10, 10, 10, 0.05)',
        'zemo': '0 4px 6px -1px rgba(10, 10, 10, 0.1), 0 2px 4px -1px rgba(10, 10, 10, 0.06)',
        'zemo-md': '0 10px 15px -3px rgba(10, 10, 10, 0.1), 0 4px 6px -2px rgba(10, 10, 10, 0.05)',
        'zemo-lg': '0 20px 25px -5px rgba(10, 10, 10, 0.1), 0 10px 10px -5px rgba(10, 10, 10, 0.04)',
        'zemo-xl': '0 25px 50px -12px rgba(10, 10, 10, 0.25)',
        'zemo-inner': 'inset 0 2px 4px 0 rgba(10, 10, 10, 0.06)',
      },
      
      // Animation for better UX
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    // Add plugins as needed
    function({ addUtilities }) {
      const newUtilities = {
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.safe-area-inset-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-area-inset-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.text-balance': {
          textWrap: 'balance',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};