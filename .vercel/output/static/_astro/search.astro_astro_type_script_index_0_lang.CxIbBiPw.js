const r=document.getElementById("search-grid"),a=document.getElementById("search-page-input"),o=document.getElementById("search-title"),i=document.getElementById("search-desc"),v=document.querySelector("form");let u;const h=`
    <div class="col-span-full flex flex-col items-center gap-4 py-24 text-center animate-fade-up">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-canvas shadow-vercel-sm">
        <svg class="h-7 w-7 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      <div>
        <p class="text-base font-medium text-ink">Search for any manga</p>
        <p class="mt-1 text-sm text-mute">Thousands of series from WeebCentral's library</p>
      </div>
      <div class="flex gap-3 text-[11px] font-mono text-mute animate-fade-in">
        <span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 cursor-pointer hover:bg-canvas-soft-2 hover:text-ink transition-colors search-pill">Try "One Piece"</span>
        <span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 cursor-pointer hover:bg-canvas-soft-2 hover:text-ink transition-colors search-pill">Try "Jujutsu"</span>
        <span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 cursor-pointer hover:bg-canvas-soft-2 hover:text-ink transition-colors search-pill">Try "Solo Leveling"</span>
      </div>
    </div>
  `;function l(){document.querySelectorAll(".search-pill").forEach(e=>{e.addEventListener("click",()=>{const t=e.textContent.replace(/^Try\s+["']|["']$/g,"").trim();a&&(a.value=t,c(t),a.focus())})})}v?.addEventListener("submit",e=>{e.preventDefault()});async function c(e){const t=new URL(window.location.href);if(e?t.searchParams.set("q",e):t.searchParams.delete("q"),window.history.replaceState({},"",t.pathname+t.search),o&&i&&(e?(o.textContent=`Results for "${e}"`,i.textContent="Search results from WeebCentral",document.title=`Search: ${e}`):(o.textContent="Browse manga",i.textContent="Discover series from the WeebCentral library",document.title="Browse Manga")),e.trim().length<2){r&&(r.innerHTML=h,l());return}r&&(r.innerHTML=`
        <div class="col-span-full flex items-center justify-center py-32">
          <div class="flex flex-col items-center gap-4">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-hairline-strong border-t-ink"></div>
            <p class="text-sm text-mute animate-fade-in">Searching...</p>
          </div>
        </div>
      `);try{const d=await fetch(`/api/search?q=${encodeURIComponent(e)}`);if(!d.ok)throw new Error("Search failed");const f=await d.json();r&&(f.results?.length>0?r.innerHTML=f.results.map((s,m)=>`<a href="/series/${s.id}" class="group animate-fade-up-d${m%7} overflow-hidden rounded-xl border border-hairline bg-canvas shadow-vercel-sm card-hover hover:shadow-vercel-md max-w-[190px] w-full mx-auto">
              <div class="relative aspect-[3/4] overflow-hidden bg-canvas-soft-2">
                <img src="${s.image}" alt="${s.title}" class="h-full w-full object-contain transition-all duration-500 group-hover:scale-105" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'flex h-full items-center justify-center text-mute text-xs\\'>No cover</div>'" />
                ${s.status?`<span class="absolute left-2 top-2 rounded-full border border-white/20 bg-ink/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">${s.status}</span>`:""}
              </div>
              <div class="flex flex-col gap-1 p-3.5">
                <h3 class="text-sm font-semibold leading-tight text-ink line-clamp-2">${s.title}</h3>
                ${s.year?`<span class="text-[11px] font-mono text-mute">${s.year}</span>`:""}
              </div>
            </a>`).join(""):(r.innerHTML=`
            <div class="col-span-full flex flex-col items-center gap-4 py-24 text-center animate-fade-up">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-canvas shadow-vercel-sm">
                <svg class="h-7 w-7 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p class="text-base font-medium text-ink">No results found</p>
                <p class="mt-1 text-sm text-mute">Nothing for "${e}" — try a different search term</p>
              </div>
              <div class="flex gap-3 text-[11px] font-mono text-mute animate-fade-in">
                <span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 cursor-pointer hover:bg-canvas-soft-2 hover:text-ink transition-colors search-pill">Try "One Piece"</span>
                <span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 cursor-pointer hover:bg-canvas-soft-2 hover:text-ink transition-colors search-pill">Try "Berserk"</span>
              </div>
            </div>`,l()))}catch{r&&(r.innerHTML=`
          <div class="col-span-full flex flex-col items-center gap-4 py-24 text-center animate-fade-up">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-canvas shadow-vercel-sm">
              <svg class="h-7 w-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p class="text-base font-medium text-ink">Search failed</p>
            <p class="text-sm text-mute">Something went wrong. Please try again.</p>
          </div>`)}}a?.addEventListener("input",e=>{clearTimeout(u);const t=e.target.value;u=setTimeout(()=>{c(t.trim())},250)});let n;function x(){n&&n.disconnect(),n=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&(t.target.classList.add("revealed"),n.unobserve(t.target))})},{threshold:.1}),document.querySelectorAll(".reveal:not(.revealed)").forEach(e=>n.observe(e))}const p=new URLSearchParams(window.location.search).get("q")||"";p.trim().length>=2?c(p.trim()):l();x();
