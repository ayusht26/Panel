Panel — A clean, modern manga reader built with Astro + Tailwind CSS v4.

Powered by WeebCentral's library. DESIGN.md provides the Vercel-inspired design language.

## Conventions
- Use `cmd /c` for file operations with brackets `[id]` in filenames (Windows limitation)
- All API routes are server-side (SSR via `@astrojs/node`)
- Search uses debounced client-side fetch to `/api/search`
- Reader supports two modes: long-strip (default) and single-page
- Ctrl+K opens search modal from any page

## Run
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview build
