import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@pages': path.resolve(__dirname, './src/pages')
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        sourcemap: false,
        preserveModules: true,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@components/ui', 'lucide-react', 'react-loading-skeleton', 'framer-motion'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          form: ['react-hook-form'],
          database: ['idb']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});