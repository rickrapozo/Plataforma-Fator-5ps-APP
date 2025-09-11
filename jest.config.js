/** @type {import('jest').Config} */
module.exports = {
  // Ambiente de teste
  testEnvironment: 'jsdom',
  
  // Extensões de arquivo suportadas
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Padrões de arquivos de teste
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/?(*.)(spec|test).(js|jsx|ts|tsx)'
  ],
  
  // Transformações
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }],
    '^.+\\.css$': 'jest-transform-css',
    '^.+\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-file'
  },
  
  // Ignorar transformações para node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@supabase|@stripe)/)',
  ],
  
  // Mapeamento de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1'
  },
  
  // Arquivos de configuração
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Cobertura de código
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**'
  ],
  
  // Diretório de relatórios de cobertura
  coverageDirectory: 'coverage',
  
  // Formatos de relatório de cobertura
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Limites de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/services/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/utils/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Configurações globais
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Variáveis de ambiente para testes
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Limpar mocks automaticamente
  clearMocks: true,
  
  // Restaurar mocks automaticamente
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Detectar arquivos abertos
  detectOpenHandles: true,
  
  // Forçar saída após testes
  forceExit: true,
  
  // Máximo de workers
  maxWorkers: '50%',
  
  // Cache
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest'
};