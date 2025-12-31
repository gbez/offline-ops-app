import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '.ngrok-free.app',
      'offline-ops-app-3b962de53c4d.herokuapp.com'
    ],
  },
  preview: {
    allowedHosts: [
      '.ngrok-free.app',
      'offline-ops-app-3b962de53c4d.herokuapp.com'
    ],
  },
})
