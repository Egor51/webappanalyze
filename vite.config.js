import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/webappanalyze/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Оптимизация бандла
    rollupOptions: {
      output: {
        // Разделение на чанки для лучшего кэширования и параллельной загрузки
        manualChunks: (id) => {
          // React и React DOM в отдельный чанк
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          // Recharts в отдельный чанк (тяжелая библиотека)
          if (id.includes('node_modules/recharts')) {
            return 'charts-vendor'
          }
          // PDF библиотеки в отдельный чанк (используются редко)
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'pdf-vendor'
          }
          // React Query в отдельный чанк
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query-vendor'
          }
          // Остальные node_modules в vendor чанк
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          // Разделение по доменам для лучшего кэширования
          if (id.includes('/domains/search/')) {
            return 'search-domain'
          }
          if (id.includes('/domains/investing/')) {
            return 'investing-domain'
          }
          if (id.includes('/domains/urgent-sale/')) {
            return 'urgent-sale-domain'
          }
        },
        // Оптимизация имен файлов для лучшего кэширования
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Увеличиваем лимит предупреждений о размере чанков
    chunkSizeWarningLimit: 1000,
    // Минификация и сжатие
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Удаляем console в production
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
      },
    },
    // Включить source maps только в dev режиме
    sourcemap: mode === 'development',
    // Оптимизация CSS
    cssCodeSplit: true,
    cssMinify: true,
  },
  server: {
    historyApiFallback: true,
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Исключаем recharts из предварительной оптимизации (загружается по требованию)
    exclude: ['recharts'],
  },
}))

