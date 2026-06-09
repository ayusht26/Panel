// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    plugins: [tailwind()],
    server: {
      watch: {
        ignored: [
          '**/db.sqlite',
          '**/db_fallback.json',
          '**/db.sqlite-journal',
          '**/.system_generated/**',
          '**/dist/**'
        ]
      }
    }
  }
});
