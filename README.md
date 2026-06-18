# PANEL.
## A Brutally Clean Manga Reader Powered by WeebCentral.

![Astro](https://img.shields.io/badge/Astro-6.x-131313?style=flat-square&logo=astro&logoColor=3cffd0)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-131313?style=flat-square&logo=tailwindcss&logoColor=3cffd0)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-131313?style=flat-square&logo=cloudflare&logoColor=3cffd0)
![Node.js](https://img.shields.io/badge/Node.js-≥22.12-131313?style=flat-square&logo=nodedotjs&logoColor=3cffd0)
![License](https://img.shields.io/badge/License-MIT-131313?style=flat-square&logoColor=3cffd0)

---

`[EDITORIAL INTRO]`

Panel is an editorial-grade, zero-telemetry manga reader designed to feel less like a standard e-reader and more like a developer console meets tech tabloid. With a dark canvas (`#131313`), acid-mint (`#3cffd0`) and ultraviolet (`#5200ff`) hazard accents, and rounded pill-card styling, Panel delivers a high-speed, zero-ad layout designed around WeebCentral's public library.

---

`[SECTION 01 / STORYSTREAM]`
# THE TIMELINE FEED.

The interface is structured as a continuous timeline feed where every feature acts as an editorial block, framed by hairline borders and marked by monospaced rail guides.

┃
┣━ `[09:00 AM]` ━ **ZERO ACCOUNTS OR ADS**
┃  Read immediately without login walls, telemetry, or tracking. Zero distractions.
┃
┣━ `[10:15 AM]` ━ **DYNAMIC DUAL READING FLOW**
┃  Switch layout mid-chapter between continuous vertical scroll (long-strip) and page-by-page.
┃
┣━ `[11:30 AM]` ━ **ON-DEMAND PDF EXPORT**
┃  Compile chapters into high-fidelity PDFs. Images are fetched server-side via CORS proxy and compiled dynamically in the browser.
┃
┣━ `[01:00 PM]` ━ **THEME RIPPLES**
┃  Stark dark canvas (`#131313`) by default, with a smooth, circle-ripple transition into light mode.
┃
┣━ `[02:45 PM]` ━ **GLOBAL COMMAND DIALOG**
┃  Invoke a debounced global search modal from anywhere on the site with `⌘K` or `Ctrl+K`.
┃
┣━ `[04:00 PM]` ━ **FLIP LIGHTBOX IMAGERY**
┃  Smooth, FLIP-animated full-cover lightboxes on series detail pages.
┃
┣━ `[05:15 PM]` ━ **REAL-TIME FILTERING & SORTING**
┃  Filter and sort chapters instantly using debounced client-side matching.
┃
┣━ `[06:30 PM]` ━ **STAGGERED HERO CAROUSEL**
┃  Dynamic staggered recommendation stack on the homepage that cycles automatically.
┃

---

`[SECTION 02 / TECH STACK]`
# THE CORE STACK.

A high-performance technical layer built to execute at the edge.

| Component | Technical Selection | Role |
|---|---|---|
| **Framework** | [Astro 6](https://astro.build) | Serverless SSR via `@astrojs/cloudflare` |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) | Compile-time Vite integration |
| **Data Sourcing**| [Cheerio](https://cheerio.js.org) | High-speed server-side HTML scraping |
| **PDF Compiler** | [jsPDF](https://github.com/parallax/jsPDF) | On-demand dynamic client bundling |
| **Typography** | [Inter](https://fonts.google.com/specimen/Inter) | Core UI Sans |
| **Code Typography**| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Technical metadata & timelines |

---

`[SECTION 03 / DIRECTORY]`
# REPO SCHEMA MAP.

```
.
├── src/
│   ├── components/
│   │   ├── Footer.astro       # Minimal navigation footer
│   │   ├── Nav.astro          # Navigation header with search trigger & theme toggle
│   │   ├── SearchModal.astro  # Keyboard-accessible debounced client search
│   │   └── SeriesCard.astro   # Card component with FLIP-compatible imagery
│   ├── layouts/
│   │   └── Layout.astro       # Base layout, typography preloads, and inline theme script
│   ├── lib/
│   │   └── weebcentral.ts     # HTML parsing and scraping core utilities
│   ├── pages/
│   │   ├── api/
│   │   │   ├── chapter/
│   │   │   │   └── [id].ts    # SSR endpoint fetching chapter page images
│   │   │   ├── series/
│   │   │   │   └── [id].ts    # SSR endpoint fetching series information
│   │   │   ├── home.ts        # Homepage dynamic aggregation endpoint
│   │   │   ├── proxy-image.ts # CORS bypass proxy for images and PDF exports
│   │   │   └── search.ts      # Dedicated route for debounced client searches
│   │   ├── read/
│   │   │   └── [id].astro     # Infinite-scroll and single-page chapter reader
│   │   ├── series/
│   │   │   └── [id].astro     # Series details page and chapter list
│   │   ├── index.astro        # Homepage (staggered carousel, trending, latest updates)
│   │   ├── popular.astro      # Trending page with custom sort filters
│   │   └── search.astro       # Browsing and search interface
│   └── styles/
│       └── global.css         # Verge hazard tokens, ripple animations, and layout transitions
├── public/
│   ├── favicon.svg
│   └── favicon.ico
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

`[SECTION 04 / INSTALLATION]`
# INITIALIZATION sequence.

### Prerequisites.

*   Node.js **≥ 22.12.0**
*   npm

### Command flow.

```bash
# Clone the repository
$ git clone https://github.com/your-username/panel.git
$ cd panel

# Install package dependencies
$ npm install

# Boot development environment
$ npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Script registry.

*   `npm run dev` ━━━━━ Starts the local dev server.
*   `npm run build` ━━━ Compiles the serverless output.
*   `npm run preview` ━ Previews the production build locally using Wrangler.

---

`[SECTION 05 / DEPLOYMENT]`
# EDGE DEPLOYMENT.

Panel runs server-side rendered (SSR) on **Cloudflare Pages**. 

To compile and deploy to the serverless edge in a single pipeline command:
```bash
$ npm run build && npx wrangler deploy --config dist/server/wrangler.json
```

---

`[SECTION 06 / KEYBOARD SHORTCUTS]`
# CONSOLE HOTKEYS.

| Key combination | Command |
|---|---|
| `⌘K` / `Ctrl+K` | Toggle search modal |
| `→` / `Space` | Go to next page (single-page reader mode) |
| `←` | Go to previous page (single-page reader mode) |
| `Esc` | Terminate modal / image lightbox overlay |

---

`[SECTION 07 / PALETTE]`
# COLOR ROLES.

*   **CANVAS BLACK** ━━ `#131313` (Main editorial background)
*   **JELLY MINT** ━━━━ `#3CFFD0` (Safety-neon action accent)
*   **VERGE ULTRAVIOLET** `#5200FF` (Secondary cathode highlight)
*   **SURFACE SLATE** ━━ `#2D2D2D` (Secondary card background)
*   **HAZARD WHITE** ━━━ `#FFFFFF` (Spotlight headers and body text)

---

`[SECTION 08 / LEGALITY]`
# DISCLAIMER.

Panel is an unofficial, open-source project. It is not affiliated with, endorsed by, or connected to WeebCentral or any manga publisher. All manga content is the property of its respective creators and publishers. This project is intended for personal, educational, and non-commercial use only.

---

`[SECTION 09 / LICENSE]`
# LICENSE.

MIT — see [LICENSE](./LICENSE) for details.
