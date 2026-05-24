import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — относительные пути нужны, чтобы Electron мог загрузить
// собранный index.html через file:// в production-режиме.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
