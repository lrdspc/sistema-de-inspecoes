import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        sourcemap: false,
        preserveModules: true,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'react-loading-skeleton', 'framer-motion'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          form: ['react-hook-form'],
          database: ['idb']
        }
      }
    }
  }
});