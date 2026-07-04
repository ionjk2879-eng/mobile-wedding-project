import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // /api 요청을 로컬 wrangler dev(npm run dev:api, --env dev)로 전달한다.
    // 브라우저는 항상 이 Vite 서버(같은 origin)만 보므로 CORS와 무관하게 동작한다.
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
        },
      },
    },
    cssCodeSplit: true,
  },
})
