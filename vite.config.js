import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Forza nombres únicos de archivos para evitar cache
    rollupOptions: {
      output: {
        entryFileNames: `[name]-[hash].js`,
        chunkFileNames: `[name]-[hash].js`,
        assetFileNames: `[name]-[hash].[ext]`
      }
    }
  },
  // Configuración optimizada para SPA en Vercel
  server: {
    host: true
  },
  // Importante para el routing del SPA en producción
  preview: {
    host: true,
    port: 4173
  }
})