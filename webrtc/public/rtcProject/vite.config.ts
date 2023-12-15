import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  //   base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite: (path) => {
        //   console.log('对应的请求路径', path)
        //   return path.replace(/^\/ws/, '')
        // },
        ws: true, // 启用 WebSocket 代理
      },
    },
  },
})
