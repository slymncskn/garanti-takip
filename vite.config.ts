import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * GitHub Pages proje sitesi kök dizinde değil, `/{repo}/` altında servis
 * edilir. Depo adını değiştirirsen burayı da değiştir — yoksa varlıklar 404
 * döner. Ortam değişkeniyle geçersiz kılınabilir (özel alan adı alırsan "/").
 */
const BASE = process.env.VITE_BASE_PATH ?? '/garanti-takip/'

/**
 * GitHub Pages'te SPA geri düşüşü yok: bilinmeyen bir yol istendiğinde
 * 404.html servis edilir. index.html'in kopyasını 404.html olarak bırakınca
 * derin bağlantılar (ör. /urun/123) uygulamaya ulaşır ve router devralır.
 */
function spaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      copyFileSync('dist/index.html', 'dist/404.html')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', '.nojekyll'],
      manifest: {
        name: 'Garanti Takip',
        short_name: 'Garanti',
        description: 'Fişlerini sakla, garanti süresi dolmadan haberin olsun.',
        lang: 'tr',
        dir: 'ltr',
        // iOS ana ekran kısayolu bu iki alanın servis edilen yolla
        // eşleşmesine bağlı; alt dizinde "/" kullanılamaz.
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f7f7f5',
        theme_color: '#1c1c1a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${BASE}index.html`,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
    spaFallback(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
