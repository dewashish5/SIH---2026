import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '..',
  envPrefix: ['VITE_', 'GEMINI_', 'GROQ_', 'WMSA_'],
  server: {
    port: 5173,
    proxy: {
      '/gateway': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gateway/, '')
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  // @ts-expect-error vitest config
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
