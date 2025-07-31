import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Include .jsx files
      include: '**/*.{jsx,tsx}',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/store': resolve(__dirname, 'src/store'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/utils': resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true, // Automatically open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize build
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            return 'vendor';
          }
          
          // Feature-based chunks
          if (id.includes('src/components/ui')) {
            return 'ui-components';
          }
          if (id.includes('src/pages')) {
            return 'pages';
          }
          if (id.includes('src/services')) {
            return 'services';
          }
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '')
            : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    testTimeout: 10000, // Increased timeout
    hookTimeout: 10000, // Hook timeout
    teardownTimeout: 10000, // Teardown timeout
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Retry failed tests
    retry: 1,
    // Bail on first failure in CI
    bail: process.env.CI ? 1 : 0,
  },
});
