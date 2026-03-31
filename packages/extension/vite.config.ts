import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

/** Simple plugin to copy static files into dist after build */
function copyContentCss(): Plugin {
  return {
    name: 'copy-content-css',
    writeBundle() {
      const src = resolve(__dirname, 'src/content/overlay.css');
      const destDir = resolve(__dirname, 'dist/content');
      mkdirSync(destDir, { recursive: true });
      copyFileSync(src, resolve(destDir, 'overlay.css'));
    },
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content/main': resolve(__dirname, 'src/content/main.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    // Don't minify for easier debugging during development
    minify: false,
  },
  plugins: [copyContentCss()],
  resolve: {
    alias: {
      '@hatchling/shared': resolve(__dirname, '../shared/src'),
    },
  },
});
