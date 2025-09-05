/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        'deep-forest': '#0f2027',
        'forest-green': '#1a3d3a',
        'sage-green': '#2d5a54',
        'mint-accent': '#4a7c59',
        
        // Deep Blues and Purples
        'deep-navy': '#1a1f3a',
        'midnight-blue': '#2c3e50',
        'royal-purple': '#6b46c1',
        'royal-blue': '#3b82f6',
        
        // Gold Accents
        'royal-gold': '#d4af37',
        'bright-gold': '#ffd700',
        'gold-shimmer': '#f4e4bc',
        
        // Neutrals
        'pure-white': '#ffffff',
        'pearl-white': '#fefefe',
        'light-gray': '#f8f9fa',
        'medium-gray': '#e9ecef',
        'dark-gray': '#495057',
        
        // Semantic Colors
        'success-green': '#28a745',
        'warning-amber': '#ffc107',
        'warning-yellow': '#f59e0b',
        'error-red': '#dc3545',
        'info-blue': '#17a2b8'
      },
      fontFamily: {
        'heading': ['Montserrat', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'accent': ['Playfair Display', 'serif']
      },
      fontSize: {
        'heading-xl': ['2.5rem', { lineHeight: '1.2', fontWeight: '800' }],
        'heading-lg': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }]
      },
      backdropBlur: {
        'glass': '10px'
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neuro': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff'
      }
    },
  },
  plugins: [],
}