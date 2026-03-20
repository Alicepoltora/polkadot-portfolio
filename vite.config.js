import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // polkadot/util-crypto needs these polyfills in browser
      'crypto': 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: [
      '@polkadot/api',
      '@polkadot/util-crypto',
      '@polkadot/util',
      'axios',
      'ethers',
    ],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@polkadot')) return 'polkadot';
          if (id.includes('ethers')) return 'ethers';
          if (id.includes('axios')) return 'axios';
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})
