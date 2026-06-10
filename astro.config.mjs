// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({ mode: 'directory' }),
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
