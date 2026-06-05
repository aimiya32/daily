import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/daily/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '일기',
        short_name: '일기',
        description: '나만의 개인 일기',
        theme_color: '#228be6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/daily/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/accounts\.google\.com/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/www\.googleapis\.com/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
