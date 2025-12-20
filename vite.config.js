import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production'
    ? '/'                          // for custom domain
    : '/new-era-interiors-react/'  // for local / repo usage
}))
