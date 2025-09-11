import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLISHABLE_KEY),
    'process.env.VITE_STRIPE_WEBHOOK_SECRET': JSON.stringify(process.env.VITE_STRIPE_WEBHOOK_SECRET),
    'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    'process.env.VITE_YOUTUBE_API_KEY': JSON.stringify(process.env.VITE_YOUTUBE_API_KEY),
    'process.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify(process.env.VITE_SPOTIFY_CLIENT_ID),
    'process.env.VITE_SPOTIFY_CLIENT_SECRET': JSON.stringify(process.env.VITE_SPOTIFY_CLIENT_SECRET),
    'process.env.VITE_JWT_SECRET': JSON.stringify(process.env.VITE_JWT_SECRET),
    'process.env.VITE_SESSION_TIMEOUT': JSON.stringify(process.env.VITE_SESSION_TIMEOUT),
    'process.env.VITE_PASSWORD_MIN_LENGTH': JSON.stringify(process.env.VITE_PASSWORD_MIN_LENGTH),
    'process.env.VITE_TWO_FACTOR_ENABLED': JSON.stringify(process.env.VITE_TWO_FACTOR_ENABLED),
    'process.env.VITE_RATE_LIMIT_PER_MINUTE': JSON.stringify(process.env.VITE_RATE_LIMIT_PER_MINUTE),
    'process.env.VITE_API_TIMEOUT': JSON.stringify(process.env.VITE_API_TIMEOUT)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        maximumFileSizeToCacheInBytes: 5000000
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Essential Factor 5P Platform',
        short_name: 'Factor5P',
        description: 'Plataforma de transformação pessoal baseada no método 5Ps',
        theme_color: '#1a3d3a',
        background_color: '#0f2027',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          vendor: ['react', 'react-dom'],
          
          // Router
          router: ['react-router-dom'],
          
          // UI Libraries
          ui: ['framer-motion', 'lucide-react'],
          
          // State Management
          store: ['zustand'],
          
          // HTTP & API
          api: ['axios', '@supabase/supabase-js'],
          
          // Stripe
          stripe: ['@stripe/stripe-js'],
          
          // Notifications
          notifications: ['react-hot-toast', 'react-toastify'],
          
          // Admin Pages (lazy loaded)
          admin: [
            './src/pages/admin/AdminPanelPage',
            './src/pages/admin/UserManagementPage',
            './src/pages/admin/SystemSettingsPage',
            './src/pages/admin/AnalyticsPage',
            './src/pages/admin/ContentManagementPage',
            './src/pages/admin/RealtimeMetricsPage',
            './src/pages/admin/PerformanceAnalysisPage',
            './src/pages/admin/WebhookTestPage'
          ],
          
          // Services
          services: [
            './src/services/therapistService',
            './src/services/geminiService',
            './src/services/rateLimitService',
            './src/services/monitoringService',
            './src/services/dataService'
          ],
          
          // PDF Generation
          pdf: ['jspdf', 'html2canvas']
        },
        
        // Otimização de nomes de arquivos
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 3000,
    host: true
  }
})