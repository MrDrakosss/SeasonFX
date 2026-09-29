import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const src = (file: string) => fileURLToPath(new URL(`../src/${file}`, import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^season-ui\/global$/, replacement: src('global.ts') },
      { find: /^season-ui$/, replacement: src('index.ts') },
    ],
  },
});
