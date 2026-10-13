import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` -> dist/ (sito statico); `npm run build:single` -> dist-single/index.html (file unico, apribile offline)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist', chunkSizeWarningLimit: 2000 },
  test: { globals: true, environment: 'node', env: { TZ: 'Europe/Rome' }, // fuso dello studente: le date del piano attraversano l'ora legale
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'] },
}));
