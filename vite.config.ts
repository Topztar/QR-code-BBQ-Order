import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts', 'd3'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
} as any);
