import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // gzip 預壓縮（CDN 邊緣節點回退支援）
    viteCompression({ algorithm: 'gzip', threshold: 1024 }),
    // brotli 預壓縮（現代瀏覽器優先使用，壓縮比更佳）
    viteCompression({ algorithm: 'brotliCompress', threshold: 1024 }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SABAY BBQ Order System',
        short_name: 'SABAY BBQ',
        description: 'SABAY Thai BBQ Order & POS System',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB limits for firebase SDK chunks
      }
    }),
  ],
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
    // 指定目標為現代瀏覽器，啟用最佳化 Tree-shaking
    target: 'es2020',
    // 減少 chunk 大小警告門檻
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Firebase SDK 核心（最大包）單獨隔離，啟用長期快取
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          // 圖表 / D3 視覺化（僅管理後台需要）
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'vendor-charts';
          }
          // Lucide 圖示庫（跨 chunk 共用）
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // 多語系翻譯字典（186KB，獨立 chunk 避免阻塞首屏）
          if (id.includes('src/utils/i18n')) {
            return 'i18n';
          }
        }
      }
    }
  }
});
