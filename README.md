# Panel — Read Manga, Beautifully

> A clean, modern manga reader built with Astro + Tailwind CSS v4. Browse thousands of manga, manhwa, and manhua — no account needed.

![Panel](https://img.shields.io/badge/Astro-6.x-FF5D01?style=flat-square&logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-≥22.12-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## Features

- **Zero account required** — open any manga and start reading immediately
- **Continuous scroll & single-page modes** — switch mid-chapter, preference is saved
- **Zoom controls** — six zoom levels plus fit-to-height in single-page mode
- **Dark / light theme** — animated circle-ripple transition between modes
- **PDF export** — compile an entire chapter to a PDF with progress feedback
- **Instant search** — debounced search modal (⌘K / Ctrl+K) from any page
- **Cover lightbox** — FLIP-animated full-cover preview on series pages
- **Chapter filtering & sorting** — search within a series' chapter list, sort newest/oldest
- **Responsive** — works on mobile, tablet, and desktop
- **Server-side rendering** — all API routes run server-side via `@astrojs/node`

---

## Screenshots

| Home | Series | Reader |
|------|--------|--------|
| Hot updates, latest releases, trending series | Cover art, tags, chapter list with search/sort | Long-strip & single-page with zoom + PDF export |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 6](https://astro.build) (SSR, `@astrojs/node` adapter) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`) |
| Scraping | [Cheerio](https://cheerio.js.org) |
| Data source | [WeebCentral](https://weebcentral.com) |
| PDF export | [jsPDF](https://github.com/parallax/jsPDF) (loaded on demand) |
| Runtime | Node.js ≥ 22.12 |

---

## Project Structure

```
panel/
├── src/
│   ├── components/
│   │   ├── Nav.astro          # Sticky nav with theme toggle + search trigger
│   │   ├── SearchModal.astro  # ⌘K modal with keyboard navigation
│   │   ├── SeriesCard.astro   # Reusable manga card
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Layout.astro       # Base HTML, fonts, theme init script
│   ├── lib/
│   │   └── weebcentral.ts     # All scraping logic (search, series, chapters)
│   ├── pages/
│   │   ├── index.astro        # Homepage (hero, hot updates, latest, hot series)
│   │   ├── search.astro       # Browse / search page
│   │   ├── series/[id].astro  # Series detail + chapter list
│   │   ├── read/[id].astro    # Chapter reader
│   │   └── api/
│   │       ├── home.ts
│   │       ├── search.ts
│   │       ├── proxy-image.ts
│   │       ├── series/[id].ts
│   │       └── chapter/[id].ts
│   └── styles/
│       └── global.css         # Design tokens, animations, skeleton loaders
├── public/
│   ├── favicon.svg
│   └── favicon.ico
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js **≥ 22.12.0**
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/panel.git
cd panel

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |

---

## Deployment

Panel is an SSR application — it requires a **Node.js server** to run. It cannot be deployed as a static site.

### Option A — Render (Recommended for beginners)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your repository
4. Set the following:
   - **Runtime:** Node
   - **Build command:** `npm install && npm run build`
   - **Start command:** `node dist/server/entry.mjs`
   - **Node version:** 22 (set in environment variables: `NODE_VERSION = 22`)
5. Click **Deploy**

### Option B — Vercel (with adapter note)

Vercel does not support the `@astrojs/node` adapter out of the box. To deploy on Vercel you need to swap the adapter:

```bash
npm install @astrojs/vercel
```

Then update `astro.config.mjs`:

```js
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // ...
});
```

Then deploy via the Vercel CLI or GitHub integration normally.

> See the full step-by-step guide in [DEPLOY.md](./DEPLOY.md).

---

## Configuration

No `.env` file is required for basic usage — Panel scrapes WeebCentral directly without an API key.

If you want to configure a custom port for the Node server:

```bash
PORT=3000 node dist/server/entry.mjs
```

---

## How It Works

1. **Search** — Posts to WeebCentral's `/search/simple` endpoint and parses HTML results with Cheerio
2. **Series detail** — Fetches and parses the series page + full chapter list endpoint
3. **Chapter reader** — Parses the first page preload URL + max page count to reconstruct all image URLs
4. **Image proxy** — `/api/proxy-image` relays manga page images to bypass CORS restrictions (also used for PDF export)
5. **PDF export** — Loads jsPDF on demand, fetches all pages through the proxy, draws each onto a canvas, and compiles a multi-page PDF

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open search modal |
| `→` / `Space` | Next page (reader) |
| `←` | Previous page (reader) |
| `Esc` | Close modal / lightbox |

---

## Disclaimer

Panel is an unofficial, open-source project. It is not affiliated with, endorsed by, or connected to WeebCentral or any manga publisher. All manga content is the property of its respective creators and publishers. This project is intended for personal, educational use only.

---

## License

MIT — see [LICENSE](./LICENSE) for details.
