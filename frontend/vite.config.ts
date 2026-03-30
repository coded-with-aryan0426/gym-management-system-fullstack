import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (proxyReq.path.startsWith('/api')) {
              console.log('[Vite Proxy] Forwarding:', proxyReq.path, '-> http://localhost:8081' + proxyReq.path);
            }
          });
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy Error]', err.message);
          });
        },
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor-react'
          if (id.includes('node_modules/react-dom')) return 'vendor-react'
          if (id.includes('node_modules/react-router')) return 'vendor-react'
          if (id.includes('node_modules/framer-motion')) return 'vendor-ui'
          if (id.includes('node_modules/motion')) return 'vendor-ui'
          if (id.includes('node_modules/react-hot-toast')) return 'vendor-ui'
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
          if (id.includes('node_modules/@mui')) return 'vendor-mui'
          if (id.includes('node_modules/date-fns')) return 'vendor-date'
          if (id.includes('node_modules/recharts')) return 'vendor-charts'
          if (id.includes('node_modules/lodash')) return 'vendor-lodash'
          if (id.includes('node_modules/@tanstack')) return 'vendor-query'
          if (id.includes('node_modules/stompjs') || id.includes('node_modules/sockjs-client')) return 'vendor-websocket'
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 800,
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
})