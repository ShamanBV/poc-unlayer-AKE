import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    // Proxy Shaman API calls through apryse-designer (Docker), which handles
    // Cognito auth + BearerEx token exchange + GraphQL composition.
    // apryse-designer's docker-compose.override.yml binds Next.js to port 3001
    // (network_mode: host, PORT=3001). To start it:
    //   cd ~/Development/dev_projects/apryse-designer && docker compose up -d
    // If that port is taken, kill the offender (`lsof -iTCP:3001` then `kill <pid>`)
    // and `docker compose restart apryse-designer`. Without it, the Visual
    // Library picker falls back to local mock data (src/policy/bds-mock.ts).
    proxy: {
      '/api/shaman': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
