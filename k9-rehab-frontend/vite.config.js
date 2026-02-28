import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,       // No source maps in production (smaller deploy)
    cssMinify: 'lightningcss', // Faster CSS minification
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core runtime
          if (id.includes('node_modules/react-dom')) return 'vendor-react-dom';
          if (id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) return 'vendor-react';
          // Icons library (used across many pages — tree-shake per chunk)
          if (id.includes('node_modules/react-icons')) return 'vendor-icons';
          // HTTP client
          if (id.includes('node_modules/axios')) return 'vendor-axios';
          // Radix/shadcn UI primitives
          if (id.includes('node_modules/@radix-ui')) return 'vendor-radix';
          // Other node_modules
          if (id.includes('node_modules/class-variance-authority') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) return 'vendor-ui-utils';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
