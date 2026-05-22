import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080'
const allowedHosts = (process.env.VITE_ALLOWED_HOSTS || 'localhost,127.0.0.1')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

const apiProxy = {
  target: apiProxyTarget,
  changeOrigin: true,
  ws: true,
}

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  plugins: [react(), svgr()],
  server: {
    proxy: {
      '/api': apiProxy,
      '/ws': apiProxy,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts,
    proxy: {
      '/api': apiProxy,
      '/ws': apiProxy,
    },
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/assets/'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
