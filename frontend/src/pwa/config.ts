import type { VitePWAOptions } from 'vite-plugin-pwa';

// Shared PWA configuration used by vite-plugin-pwa.
// Kept as a separate module so both the plugin config and any manual references
// stay in sync. This file only exports the options shape — it does NOT import
// the plugin itself (that happens in vite.config.ts).

export const pwaManifest: VitePWAOptions['manifest'] = {
  name: 'DineConnect',
  short_name: 'DineConnect',
  description:
    'Discover restaurants, book tables, and manage your dining experience. A modern restaurant platform with real-time reservations, menu browsing, and order management.',
  start_url: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  theme_color: '#6366F1',
  background_color: '#0F172A',
  scope: '/',
  lang: 'en',
  dir: 'ltr',
  prefer_related_applications: false,
  categories: ['food', 'restaurant', 'lifestyle', 'productivity'],
  icons: [
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};

export const pwaPreset = 'workbox' as const;
