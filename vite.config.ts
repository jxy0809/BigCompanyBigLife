import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    // 所有产物平铺到 dist/ 根目录，不产生二级文件夹
    assetsDir: '',
    rollupOptions: {
      output: {
        // 所有 JS/CSS/资源平铺到 dist/ 根目录
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 400,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
  },
  server: {
    host: true,
    port: 3200,
  },
});
