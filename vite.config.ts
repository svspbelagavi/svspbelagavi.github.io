import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Vite's default warning threshold is 500KB; the SPA genuinely needs
    // more than that because of motion + lucide + react. We split into
    // manual chunks so no single chunk is huge, and lower the threshold
    // back to a reasonable number so we are warned when an *individual*
    // chunk exceeds 600KB.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — renders on every page.
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Animation — used widely across components.
          'motion-vendor': ['motion'],
          // Icon set — tree-shaken per-component, but still ~30KB+ in practice.
          'icons': ['lucide-react'],
        },
      },
    },
  },

  server: {
    host: true,
    port: 5173,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
