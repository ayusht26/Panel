const p=document.getElementById("series-detail"),B=p?.dataset.id||"",a=document.getElementById("lightbox-modal"),n=document.getElementById("lightbox-card"),c=document.getElementById("lightbox-img"),L=document.getElementById("lightbox-title"),v=document.getElementById("lightbox-meta"),T=document.getElementById("lightbox-download");let m=!1;function M(i,e){if(m||!a||!n||!c)return;m=!0,L&&(L.textContent=e),c.src=i,v&&(v.textContent="Format: JPEG"),c.onload=()=>{v&&(v.textContent=`${c.naturalWidth} × ${c.naturalHeight}`)};const o=document.getElementById("cover-container"),t=o?o.getBoundingClientRect():null;a.classList.remove("hidden"),a.classList.add("flex"),document.body.style.overflow="hidden";const r=n.getBoundingClientRect();if(t){const u=t.left+t.width/2-(r.left+r.width/2),s=t.top+t.height/2-(r.top+r.height/2),d=t.width/r.width,x=t.height/r.height;n.style.transition="none",n.style.transform=`translate(${u}px, ${s}px) scale(${d}, ${x})`,a.classList.add("opacity-0")}n.offsetHeight,requestAnimationFrame(()=>{a.classList.remove("opacity-0"),n.style.transition="transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)",n.style.transform="none",setTimeout(()=>{m=!1},450)})}function C(){if(m||!a||!n)return;m=!0;const i=document.getElementById("cover-container"),e=i?i.getBoundingClientRect():null,o=n.getBoundingClientRect();if(e){const t=e.left+e.width/2-(o.left+o.width/2),r=e.top+e.height/2-(o.top+o.height/2),u=e.width/o.width,s=e.height/o.height;a.classList.add("opacity-0"),n.style.transition="transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",n.style.transform=`translate(${t}px, ${r}px) scale(${u}, ${s})`}else a.classList.add("opacity-0");document.body.style.overflow="",setTimeout(()=>{a.classList.remove("flex"),a.classList.add("hidden"),n.style.transform="",n.style.transition="",m=!1},400)}a?.addEventListener("click",i=>{(i.target===a||i.target.closest("#lightbox-close"))&&C()});T?.addEventListener("click",i=>{i.stopPropagation(),c.src&&window.open(c.src,"_blank")});document.addEventListener("keydown",i=>{i.key==="Escape"&&C()});async function j(){try{let e=function(){if(!s||!t.chapters)return;let y=[...t.chapters.filter(l=>(l.title||"Chapter "+l.chapter).toLowerCase().includes(x))];d==="asc"&&y.reverse();const E=y.map(l=>{const h=t.chapters.findIndex(I=>I.id===l.id),b=t.chapters.length-h;return`
            <a href="/read/${l.id}" class="chapter-item flex items-center justify-between px-4 py-3 text-sm transition-all duration-300 hover:bg-canvas-soft opacity-0 translate-y-2" data-id="${l.id}">
              <div class="flex items-center gap-3">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas-soft-2 text-[11px] font-mono text-mute">${b}</span>
                <span class="font-medium text-ink">${l.title||"Chapter "+l.chapter}</span>
              </div>
              <div class="flex items-center gap-3">
                ${l.date?`<span class="text-xs text-mute">${new Date(l.date).toLocaleDateString()}</span>`:""}
                <svg class="h-4 w-4 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </a>
          `}).join("");if(y.length===0){s.innerHTML=`
            <div class="flex items-center justify-center py-12">
              <p class="text-sm text-mute">No chapters match your search</p>
            </div>
          `;return}s.style.opacity="0",s.style.transform="translateY(4px)",s.style.transition="opacity 0.15s ease, transform 0.15s ease",setTimeout(()=>{s.innerHTML=E,s.style.opacity="1",s.style.transform="translateY(0)",s.querySelectorAll(".chapter-item").forEach((h,b)=>{setTimeout(()=>{h.classList.remove("opacity-0","translate-y-2"),h.classList.add("opacity-100","translate-y-0")},Math.min(b*15,300))})},150)};var i=e;const o=await fetch(`/api/series/${B}`);if(!o.ok)throw new Error("Not found");const t=await o.json();document.title=t.title;const r=(t.tags||[]).slice(0,5);p&&(p.innerHTML=`
          <div class="grid gap-10 md:grid-cols-[300px_1fr] items-start">
            <!-- Cover -->
            <div class="flex flex-col gap-4">
              <div id="cover-container" class="mx-auto w-full max-w-[240px] md:max-w-none aspect-[3/4] overflow-hidden rounded-xl border border-hairline bg-canvas-soft-2 shadow-vercel-md cursor-pointer hover:opacity-90 transition-all duration-300">
                <img src="${t.image}" alt="${t.title}" class="h-full w-full object-contain" />
              </div>
              ${t.year?`<span class="text-xs font-mono text-mute text-center">${t.year} ${t.status?`· ${t.status}`:""}</span>`:""}
              ${t.type?`<span class="text-xs text-mute text-center">${t.type}</span>`:""}
            </div>

            <!-- Info -->
            <div>
              <h1 class="text-3xl font-semibold tracking-[-0.03em]">${t.title}</h1>

              ${t.altTitles&&t.altTitles.length>0?`
                <p class="mt-1 text-sm text-mute">${t.altTitles.slice(0,3).join(" · ")}</p>
              `:""}

              ${r.length>0?`
                <div class="mt-4 flex flex-wrap gap-2">
                  ${r.map(g=>`<span class="rounded-full border border-hairline bg-canvas-soft px-3 py-1 text-[11px] text-body">${g}</span>`).join("")}
                </div>
              `:""}

              ${t.authors&&t.authors.length>0?`
                <p class="mt-4 text-sm text-body">
                  <span class="font-medium text-ink">Author${t.authors.length>1?"s":""}:</span> ${t.authors.join(", ")}
                </p>
              `:""}

              ${t.description?`
                <div class="mt-5 rounded-xl border border-hairline bg-canvas-soft p-5">
                  <p class="text-sm leading-relaxed text-body">${t.description}</p>
                </div>
              `:""}

              <!-- Chapters -->
              <div class="mt-10">
                <h2 class="mb-4 text-lg font-semibold tracking-[-0.02em]">
                  Chapters ${t.chapters&&t.chapters.length>0?`(${t.chapters.length})`:""}
                </h2>

                ${t.chapters&&t.chapters.length>0?`
                  <div class="mb-4 flex gap-2">
                    <div class="relative flex-1">
                      <input
                        id="chapter-search"
                        type="text"
                        placeholder="Search chapters..."
                        class="w-full h-10 px-4 rounded-xl border border-hairline bg-canvas text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-1 focus:ring-ink"
                      />
                    </div>
                    <button id="chapter-sort" class="inline-flex h-10 items-center gap-2 px-4 rounded-xl border border-hairline bg-canvas text-xs font-semibold text-ink hover:bg-canvas-soft transition-all shadow-vercel-sm cursor-pointer" data-sort="desc" title="Toggle sorting order">
                      <svg id="sort-icon-desc" class="h-3.5 w-3.5 text-mute transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                      </svg>
                      <svg id="sort-icon-asc" class="h-3.5 w-3.5 text-mute transition-transform duration-300 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m9.75-1.5L17.25 21m0 0L13.5 17.25M17.25 21V9" />
                      </svg>
                      <span id="sort-text">Newest</span>
                    </button>
                  </div>
                  <div id="chapters-list" class="divide-y divide-hairline rounded-xl border border-hairline bg-canvas max-h-[600px] overflow-y-auto">
                    <!-- Chapters rendered dynamically -->
                  </div>
                `:`
                  <div class="flex items-center justify-center rounded-xl border border-hairline bg-canvas-soft py-12">
                    <p class="text-sm text-mute">Could not load chapters</p>
                  </div>
                `}
              </div>
            </div>
          </div>
        `),document.getElementById("cover-container")?.addEventListener("click",()=>{M(t.image,t.title)});const s=document.getElementById("chapters-list");let d="desc",x="";e(),document.getElementById("chapter-search")?.addEventListener("input",g=>{x=g.target.value.toLowerCase().trim(),e()});const k=document.getElementById("chapter-sort"),f=document.getElementById("sort-text"),w=document.getElementById("sort-icon-desc"),$=document.getElementById("sort-icon-asc");k?.addEventListener("click",()=>{d==="desc"?(d="asc",f&&(f.textContent="Oldest"),w?.classList.add("hidden"),$?.classList.remove("hidden")):(d="desc",f&&(f.textContent="Newest"),w?.classList.remove("hidden"),$?.classList.add("hidden")),e()})}catch{p&&(p.innerHTML=`
          <div class="flex flex-col items-center gap-4 py-20 text-center">
            <p class="text-lg font-medium">Series not found</p>
            <p class="text-sm text-mute">The series may not exist or WeebCentral is unavailable.</p>
            <a href="/" class="mt-2 inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-canvas">Go home</a>
          </div>
        `)}}j();
