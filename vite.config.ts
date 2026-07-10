import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from https://<user>.github.io/<repo>/,
// so production assets need the repo name as the base path. Local dev stays at /.
const REPO = 'tekmetric-estimate-approval'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${REPO}/` : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}))
