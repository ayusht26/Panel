import { c as createComponent } from './astro-component_CQoova8B.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_C7Dp5GaY.mjs';
import { $ as $$Layout, r as renderScript } from './Layout_BdiPv0k8.mjs';
import { $ as $$Nav, a as $$Footer } from './Footer_Bc52Olrh.mjs';

const $$Search = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Search;
  const query = Astro2.url.searchParams.get("q") || "";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": query ? `Search: ${query}` : "Browse Manga" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, {})} ${maybeRenderHead()}<main class="page-enter mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 flex-1 w-full"> <div class="mb-8 reveal"> <h1 id="search-title" class="text-3xl font-semibold tracking-[-0.03em]"> ${query ? `Results for "${query}"` : "Browse manga"} </h1> <p id="search-desc" class="mt-1.5 text-sm text-body"> ${query ? "Search results from WeebCentral" : "Discover series from the WeebCentral library"} </p> </div> <div class="mb-10 reveal"> <form action="/search" method="GET" class="relative mx-auto max-w-xl"> <svg class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path> </svg> <input name="q" id="search-page-input" type="text" placeholder="Search manga..."${addAttribute(query, "value")} autocomplete="off" class="h-12 w-full rounded-xl border border-hairline bg-canvas pl-11 pr-4 text-sm text-ink placeholder:text-mute shadow-vercel-sm transition-colors focus:border-hairline-strong focus:outline-none focus:shadow-vercel-md"> </form> </div> <div id="search-grid" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"> ${query && renderTemplate`<div class="col-span-full flex items-center justify-center py-32"> <div class="flex flex-col items-center gap-4"> <div class="h-8 w-8 animate-spin rounded-full border-2 border-hairline-strong border-t-ink"></div> <p class="text-sm text-mute animate-fade-in">Searching...</p> </div> </div>`} ${!query && renderTemplate`<div class="col-span-full reveal flex flex-col items-center gap-4 py-24 text-center"> <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-canvas shadow-vercel-sm"> <svg class="h-7 w-7 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"> <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path> </svg> </div> <div> <p class="text-base font-medium text-ink">Search for any manga</p> <p class="mt-1 text-sm text-mute">Thousands of series from WeebCentral's library</p> </div> <div class="flex gap-3 text-[11px] font-mono text-mute"> <span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 cursor-pointer hover:bg-canvas-soft-2 hover:text-ink transition-colors search-pill">Try "One Piece"</span> <span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 cursor-pointer hover:bg-canvas-soft-2 hover:text-ink transition-colors search-pill">Try "Jujutsu"</span> <span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 cursor-pointer hover:bg-canvas-soft-2 hover:text-ink transition-colors search-pill">Try "Solo Leveling"</span> </div> </div>`} </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })} ${renderScript($$result, "D:/Coding/manga-color/src/pages/search.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Coding/manga-color/src/pages/search.astro", void 0);

const $$file = "D:/Coding/manga-color/src/pages/search.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Search,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
