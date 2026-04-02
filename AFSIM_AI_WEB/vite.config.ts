import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        // 开发环境直接代理到后端
        bypass: (req, res, options) => {
          // 让请求继续代理到后端
          return undefined;
        }
      }
    }
  }
})
