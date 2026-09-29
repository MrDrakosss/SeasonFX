import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'es2019',
    external: ['react'],
    // Next.js App Router: every export is a client component.
    banner: { js: '"use client";' },
  },
  {
    // Script-tag build for sites without React: window.SeasonUI
    entry: { 'season-ui.global': 'src/global.ts' },
    format: ['iife'],
    globalName: 'SeasonUI',
    minify: true,
    sourcemap: true,
    target: 'es2017',
    outExtension: () => ({ js: '.js' }),
  },
]);
