import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          wagmi: ['wagmi', '@wagmi/core', '@wagmi/connectors'],
          react: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'wagmi', 'viem', '@tanstack/react-query'],
  },
})
