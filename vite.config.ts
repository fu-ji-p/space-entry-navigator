import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages などサブパス配信時は VITE_BASE=/repo-name/ を指定する
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
        },
      },
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
