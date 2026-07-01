import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev the frontend calls relative paths like '/api/pain-analysis'. Vite
// forwards anything starting with /api to the Node backend on port 4000, so
// there are NO CORS errors and NO mixed-content (http/https) problems.
// In production, either reverse-proxy /api to the Node server with Nginx, or
// set VITE_API_URL to the backend's full URL (see .env.example).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
