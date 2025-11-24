import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/webappanalyze/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Оптимизация бандла
    rollupOptions: {
      output: {
        // Разделение на чанки для лучшего кэширования
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'charts-vendor': ['recharts'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
        },
      },
    },
    // Увеличиваем лимит предупреждений о размере чанков
    chunkSizeWarningLimit: 1000,
    // Минификация
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Оставляем console для отладки
        drop_debugger: true,
      },
    },
  },
  server: {
    historyApiFallback: true,
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
  },
})

