import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages 仓库子路径部署：base 设为 /仓库名/；本地开发仍为 /
  base: process.env.GITHUB_ACTIONS === 'true' ? '/overcooked-hy4flash-high/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
