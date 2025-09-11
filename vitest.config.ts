/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Ambiente de teste
    environment: 'jsdom',
    
    // Arquivos de configuração
    setupFiles: ['./src/setupTests.ts'],
    
    // Padrões de arquivos de teste
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Excluir arquivos
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'coverage'
    ],
    
    // Globals para não precisar importar describe, it, expect
    globals: true,
    
    // Cobertura de código
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/coverage/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/*.stories.{js,jsx,ts,tsx}'
      ],
      // Limites de cobertura
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        },
        'src/services/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        'src/utils/': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        }
      }
    },
    
    // Timeout para testes
    testTimeout: 10000,
    
    // Timeout para hooks
    hookTimeout: 10000,
    
    // Executar testes em paralelo
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // Watch mode
    watch: false,
    
    // Reporter
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html'
    },
    
    // Configurações de mock
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    
    // Configurações de ambiente
    env: {
      NODE_ENV: 'test',
      VITE_APP_ENV: 'test'
    },
    
    // Configurações de retry
    retry: 2,
    
    // Configurações de bail
    bail: 0,
    
    // Configurações de cache
    cache: {
      dir: 'node_modules/.vitest'
    },
    
    // Configurações de deps
    deps: {
      inline: [
        '@testing-library/jest-dom',
        '@testing-library/react',
        '@testing-library/user-event'
      ]
    }
  },
  
  // Resolver aliases (mesmo do vite.config.ts principal)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store')
    }
  },
  
  // Configurações de define (variáveis globais)
  define: {
    __TEST__: true,
    'process.env.NODE_ENV': '"test"'
  }
})