import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk for React ecosystem
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          // UI libraries
          if (id.includes('node_modules/framer-motion') || 
              id.includes('node_modules/motion') ||
              id.includes('node_modules/react-hot-toast') || 
              id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }
          // Date/chart libraries
          if (id.includes('node_modules/date-fns') || 
              id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
})
