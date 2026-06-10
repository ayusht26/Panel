// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
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
