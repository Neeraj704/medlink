import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // importing tailwind here

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // string shorthand: http://localhost:5173/foo -> http://localhost:3000/foo
      // '/foo': 'http://localhost:4567',
      // with options: http://localhost:5173/api/bar -> http://localhost:3000/bar
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
})