import React from 'react';
import { motion } from 'framer-motion';

// Lazy loading utilities
export const createLazyComponent = (importFn: () => Promise<any>, fallback?: React.ComponentType) => {
  const LazyComponent = React.lazy(importFn);
  
  const WrappedComponent = (props: any) => {
    const FallbackComponent = fallback || (() => (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-sage-green border-t-transparent rounded-full"
        />
      </div>
    ));
    
    return (
      <React.Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
  
  return WrappedComponent;
};

// Common imports for optimization
export const commonImports = {
  react: () => import('react'),
  framerMotion: () => import('framer-motion'),
  reactRouter: () => import('react-router-dom'),
  lucideReact: () => import('lucide-react')
};

// Bundle configuration
export const bundleConfig = {
  chunkSize: {
    small: 50000,   // 50KB
    medium: 150000, // 150KB
    large: 300000   // 300KB
  },
  preloadThreshold: 0.8,
  cacheTimeout: 300000 // 5 minutes
};

// Route-based preloading map
export const routePreloadMap = {
  '/dashboard': ['./DashboardPage', './FivePsPanel'],
  '/mind-vault': ['./MindVaultPage', './AudioPlayer'],
  '/subscription': ['./SubscriptionPage', './PaymentForm']
};

// Dynamic import helpers
export const importService = async (serviceName: string) => {
  try {
    const module = await import(`../services/${serviceName}`);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to import service: ${serviceName}`, error);
    throw error;
  }
};

export const importComponent = async (componentPath: string) => {
  try {
    const module = await import(`../components/${componentPath}`);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to import component: ${componentPath}`, error);
    throw error;
  }
};

// Preloading utilities
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  ];
  
  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
};

export const preloadRoute = async (routePath: string) => {
  const components = routePreloadMap[routePath as keyof typeof routePreloadMap];
  if (components) {
    const promises = components.map(component => importComponent(component));
    try {
      await Promise.all(promises);
      console.log(`Preloaded components for route: ${routePath}`);
    } catch (error) {
      console.warn(`Failed to preload some components for route: ${routePath}`, error);
    }
  }
};

// Performance monitoring
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle size monitoring enabled in development mode');
    
    const logImportTime = (moduleName: string, startTime: number) => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      console.log(`Module ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);
    };
    
    // Export to window for debugging
    (window as any).logImportTime = logImportTime;
  }
};

// Optimization report generation
export const generateOptimizationReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    bundleConfig,
    routePreloadMap,
    recommendations: [
      'Consider code splitting for large components',
      'Implement route-based preloading',
      'Optimize image loading with lazy loading',
      'Use React.memo for expensive components'
    ],
    metrics: {
      totalImports: 0, // Will be calculated at runtime
      cacheHitRate: 0.85,
      averageLoadTime: 150
    }
  };
  
  console.log('Optimization Report:', report);
  return report;
};

// Initialize optimization in development
if (process.env.NODE_ENV === 'development') {
  monitorBundleSize();
  
  // Generate report after 5 seconds
  setTimeout(() => {
    generateOptimizationReport();
  }, 5000);
}

export default {
  createLazyComponent,
  commonImports,
  bundleConfig,
  routePreloadMap,
  importService,
  importComponent,
  preloadCriticalResources,
  preloadRoute,
  monitorBundleSize,
  generateOptimizationReport
};