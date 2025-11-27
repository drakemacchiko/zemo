/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ZEMO Brand Colors - Full Scale
      colors: {
        // Primary Yellow Scale
        yellow: {
          50: '#FFFBEB',
          100: '#FFF3C6',
          200: '#FFE99D',
          300: '#FFE074',
          400: '#FFD84B',
          500: '#FFD400', // Primary brand color
          600: '#E6BF00',
          700: '#BF9F00',
          800: '#998000',
          900: '#736000',
        },
        // Neutral Gray Scale
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#0A0A0A', // ZEMO Black
        },
        // Status colors
        success: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        info: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        // Legacy ZEMO shortcuts (for backward compatibility)
        'zemo-yellow': '#FFD400',
        'zemo-black': '#0A0A0A',
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
      
      // ZEMO Spacing Scale (4px base unit)
      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
        '32': '8rem',     // 128px
      },
      
      // ZEMO Border Radius
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
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