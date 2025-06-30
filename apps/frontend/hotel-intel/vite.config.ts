import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ghPages } from 'vite-plugin-gh-pages';

export default defineConfig({
  base: '/hotel-intel-mvp/', // nom du repo GitHub
  plugins: [react(), ghPages()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // ou le port de ton backend
    }
  },
});
