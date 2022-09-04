import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/auth': 'http://localhost:3001/api',
    },
  },
  plugins: [react()],
});
