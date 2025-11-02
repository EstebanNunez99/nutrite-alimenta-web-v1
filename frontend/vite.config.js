import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // AÑADIMOS ESTO:
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // La URL de tu backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})