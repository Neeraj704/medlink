// FILE: client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.csv'], // Keep this for the diagnosis search
  server: {
    proxy: {
      '/api': {
        target: 'https://medlink2.onrender.com', // Your production backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});