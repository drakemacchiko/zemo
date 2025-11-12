// Lighthouse CI Configuration
// Phase 11: PWA & Accessibility

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'ready on',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/register',
        'http://localhost:3000/profile',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.75 }],

        // PWA
        'categories:pwa': ['warn', { minScore: 0.8 }],
        'service-worker': 'error',
        'installable-manifest': 'error',
        'apple-touch-icon': 'warn',
        'splash-screen': 'warn',
        'themed-omnibox': 'error',
        'viewport': 'error',
        'content-width': 'error',

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-required-children': 'error',
        'aria-required-parent': 'error',
        'aria-roles': 'error',
        'aria-valid-attr-value': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'bypass': 'error',
        'color-contrast': 'warn',
        'document-title': 'error',
        'duplicate-id-aria': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'image-alt': 'error',
        'input-image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'listitem': 'error',
        'meta-viewport': 'error',
        'tabindex': 'warn',

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'errors-in-console': 'warn',
        'is-on-https': 'warn',
        'uses-http2': 'warn',

        // SEO
        'categories:seo': ['warn', { minScore: 0.85 }],
        'meta-description': 'error',
        'http-status-code': 'error',
        'font-size': 'error',
        'crawlable-anchors': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
