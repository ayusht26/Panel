import { c as createComponent } from './astro-component_CQoova8B.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_C7Dp5GaY.mjs';
import { $ as $$Layout, r as renderScript } from './Layout_BdiPv0k8.mjs';
import { $ as $$Nav, a as $$Footer } from './Footer_Bc52Olrh.mjs';

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Loading..." }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, {})} ${maybeRenderHead()}<main class="page-enter mx-auto max-w-7xl px-6 pb-24 pt-4 sm:pt-8 flex-1 w-full"> <div id="series-detail" class="w-full"${addAttribute(id, "data-id")}> <!-- Detailed Pulsing Layout Skeleton --> <div class="grid gap-10 md:grid-cols-[300px_1fr] items-start animate-pulse"> <!-- Cover Skeleton --> <div class="flex flex-col gap-4"> <div class="mx-auto w-full max-w-[240px] md:max-w-none aspect-[3/4] rounded-xl border border-hairline bg-canvas-soft-2 skeleton"></div> <div class="h-4 w-28 bg-canvas-soft-2 rounded mx-auto skeleton"></div> <div class="h-3 w-16 bg-canvas-soft-2 rounded mx-auto skeleton"></div> </div> <!-- Info Skeleton --> <div class="space-y-4"> <div class="h-8 w-3/4 bg-canvas-soft-2 rounded skeleton"></div> <div class="h-4 w-1/3 bg-canvas-soft-2 rounded skeleton"></div> <div class="flex gap-2"> <div class="h-6 w-16 bg-canvas-soft-2 rounded-full skeleton"></div> <div class="h-6 w-20 bg-canvas-soft-2 rounded-full skeleton"></div> <div class="h-6 w-14 bg-canvas-soft-2 rounded-full skeleton"></div> </div> <div class="h-32 w-full bg-canvas-soft-2 rounded-xl mt-6 skeleton"></div> <div class="space-y-3 mt-10"> <div class="h-6 w-28 bg-canvas-soft-2 rounded skeleton"></div> <div class="h-10 w-full bg-canvas-soft-2 rounded-xl skeleton"></div> <div class="h-40 w-full bg-canvas-soft-2 rounded-xl skeleton"></div> </div> </div> </div> </div> </main>  <div id="lightbox-modal" class="fixed inset-0 z-[150] hidden items-center justify-center bg-black/45 dark:bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 select-none"> <div id="lightbox-card" class="relative max-h-[85vh] max-w-[90vw] md:max-w-[480px] w-full rounded-2xl border border-hairline bg-canvas shadow-vercel-modal flex flex-col overflow-hidden theme-transition transform origin-center"> <!-- Header --> <div class="flex items-center justify-between border-b border-hairline px-4 py-3 bg-canvas-soft"> <div class="flex flex-col"> <span class="text-[10px] font-mono uppercase tracking-wider text-mute">Cover Art</span> <span id="lightbox-title" class="text-sm font-semibold text-ink leading-tight truncate max-w-[240px]">Series Title</span> </div> <button id="lightbox-close" class="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-canvas text-ink hover:bg-canvas-soft-2 transition-all cursor-pointer shadow-vercel-sm" aria-label="Close lightbox"> <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path> </svg> </button> </div> <!-- Image Content Container --> <div class="relative flex-grow bg-canvas-soft-2 p-4 flex items-center justify-center overflow-hidden aspect-[3/4]"> <img id="lightbox-img" src="" alt="Full Cover" class="h-full w-full object-contain rounded-lg shadow-vercel-md select-none pointer-events-none"> </div> <!-- Footer --> <div class="flex items-center justify-between border-t border-hairline px-4 py-3 bg-canvas-soft"> <span id="lightbox-meta" class="text-[11px] font-mono text-mute">Dimensions: ~</span> <button id="lightbox-download" class="inline-flex h-8 items-center justify-center rounded-full bg-ink px-4 text-xs font-medium text-canvas hover:opacity-90 transition-all cursor-pointer shadow-vercel-sm">
Open Original
</button> </div> </div> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })} ${renderScript($$result, "D:/Coding/manga-color/src/pages/series/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Coding/manga-color/src/pages/series/[id].astro", void 0);

const $$file = "D:/Coding/manga-color/src/pages/series/[id].astro";
const $$url = "/series/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
