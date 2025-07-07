import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ghPages } from 'vite-plugin-gh-pages';


const api = process.env.VITE_API_URL;

export default defineConfig({
  base: '/hotel-intel-mvp/', 
  plugins: [react(), ghPages()],
  server: {
    proxy: {
      '/api': api ?? "localhost:3000" 
    }
  },
});
