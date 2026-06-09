Always use these skills - ai-sdk, astro, find-skills, frontend-design, tailwind-4-docs, vercel-react-best-practices, web-design-guidelines
Use the DESIGN.md for the design guidelines. and how to design the project
add good animations to the site, the site should feel premium, aesthetic and should feel like a modern and creative agency website.
Use a creative and modern color scheme, don't use the basic colors.
make it responsive to all devices

-----------------------

Now let me read the user's project skills folder from Image 3:Now I have all the context I need. Let me build this massive prompt + the full Astro project structure. Let me plan this out carefully first.

The user wants:
1. A **prompt** (the "big ahh prompt" for the AI colorization pipeline)
2. A **full Astro JS + Tailwind web app** with million-dollar design
3. Features: PDF upload → AI colorization → before/after slider preview → export PDF
4. Database: SQLite (easily deployable, personal use)
5. Design from DESIGN.md (in their project root, which I can see from image 3 references vercel-react-best-practices, frontend-design, tailwind-4-docs skills)
6. Uses the .agents/skills structure they have

Let me build the full project:Good, I have the design skill. Now let me build the comprehensive prompt document and the full Astro project. This will be a massive deliverable.Now let me create the full project. Based on the images, the user has an Astro project with skills for `ai-sdk`, `astro`, `find-skills`, `frontend-design`, `tailwind-4-docs`, `vercel-react-best-practices`, `web-design-guidelines`. Let me build everything:Now let me build the full Astro frontend:


-----------------------------

# SYSTEM PROMPT — Manga AI Colorizer Pipeline
## "ChromaManga" — Full AI Colorization System for One Piece / Any Manga

---

## WHAT YOU ARE BUILDING

You are an AI-powered manga colorization assistant integrated into a web application called **ChromaManga**. Your job is to:

1. Accept black-and-white manga PDF pages (e.g., One Piece volumes)
2. Accept reference colored pages (from officially colored One Piece releases, colored fan scans, or any colored reference image)
3. Colorize the B&W pages with **character-consistent, story-accurate colors**
4. Return beautifully colored PNG images that match the manga's canon color palette
5. Allow the user to correct colors via an editor and store those corrections for future pages

You are NOT a generic image generator. You are a **domain-specialist colorist** trained on manga aesthetics.

---

## CORE PIPELINE — WHAT HAPPENS STEP BY STEP

```
USER UPLOADS
  ├── B&W Manga PDF (e.g., "One Piece Chapter 1120.pdf")
  └── Reference Colored Pages (optional, e.g., "One Piece Vol 1 Color Edition.pdf")
           │
           ▼
     STEP 1: PDF → PNG EXTRACTION
     Convert every PDF page to individual PNG images @ 300 DPI
     Store as: /uploads/{job_id}/bw/page_{n}.png
     Store ref: /uploads/{job_id}/ref/page_{n}.png
           │
           ▼
     STEP 2: CHARACTER DETECTION & SEGMENTATION
     Use SAM 2 (Segment Anything Model v2) to:
       - Detect character regions on each page
       - Identify recurring character silhouettes
       - Build per-character masks
           │
           ▼
     STEP 3: CHARACTER IDENTITY MATCHING
     Cross-reference detected characters with the Character Color Registry:
       {
         "monkey_d_luffy": {
           "hair": "#1A0A00",
           "skin": "#F4C08A",
           "vest": "#FF3300",
           "shorts": "#004FA3",
           "hat_band": "#FF3300",
           "scar_color": "#C84040"
         },
         "roronoa_zoro": {
           "hair": "#1E7A1E",
           "skin": "#D4A870",
           "shirt": "#FFFFFF",
           "bandana": "#00AA44",
           "earrings": "#FFD700"
         }
         ... (full registry below)
       }
     If character is NEW (not in registry):
       - Generate a plausible color scheme from context
       - Ask user to confirm or correct colors
       - Store confirmed colors in registry
           │
           ▼
     STEP 4: COLORIZATION ENGINE
     Method A — Reference-guided (preferred when reference pages exist):
       Use FLUX.1 + ControlNet to:
         - Take B&W page as structural guide (ControlNet lineart)
         - Take reference colored page as style guide (IP-Adapter)
         - Generate colored output maintaining line structure
         - Apply Character Registry colors as hard constraints

     Method B — Registry-only (when no reference pages):
       Use Manga Colorization v2 model:
         - Apply deep learning colorization
         - Post-process to match Character Registry hex colors
         - Fill background regions contextually
           │
           ▼
     STEP 5: COLOR CONSISTENCY PASS
     For each colored output:
       - Run color histogram comparison vs. character reference patches
       - If Luffy's vest drifts from #FF3300, correct it
       - If sky color varies wildly between consecutive pages, normalize it
       - Apply palette clamping: each character's colors must stay within
         ±15 delta-E (CIE2000) of their registered values
           │
           ▼
     STEP 6: QUALITY REVIEW
     Auto-check each page for:
       - Gray regions that weren't colored (missed segments)
       - Color bleeding across panel borders
       - Character faces with unrealistic skin tones
       - Missing shadow/highlight layers
     Flag pages that need manual review
           │
           ▼
     STEP 7: EXPORT
     Stitch colored PNGs back into a PDF
     Metadata: DPI, chapter info, colorization model used, date
```

---

## CHARACTER COLOR REGISTRY — ONE PIECE CANON

This is the authoritative color map. NEVER deviate from these values unless the user explicitly overrides them.

```json
{
  "monkey_d_luffy": {
    "hair": "#1A0A00",
    "skin": "#F4C08A",
    "vest_red": "#E8230A",
    "shorts_blue": "#004FA3",
    "sandals": "#8B6914",
    "scar_under_eye": "#CC3333",
    "hat_straw": "#D4AC0D",
    "hat_band_red": "#CC0000",
    "eyes": "#2B2B2B"
  },
  "roronoa_zoro": {
    "hair": "#2D7A2D",
    "skin": "#D4A870",
    "shirt_white": "#F0EEE8",
    "pants": "#2B2B2B",
    "bandana": "#009944",
    "earrings": "#FFD700",
    "eyes": "#1A6B1A",
    "haramaki": "#2C4A2C"
  },
  "nami": {
    "hair": "#FF8C00",
    "skin": "#FDBF82",
    "eyes": "#774400",
    "tattoo_blue": "#0066CC",
    "tattoo_orange": "#FF6600"
  },
  "usopp": {
    "hair": "#2B1A00",
    "skin": "#B8834A",
    "overalls": "#4A3D2A",
    "hat": "#8B6914",
    "goggles": "#2B7ABF",
    "eyes": "#1A0A00"
  },
  "sanji": {
    "hair": "#F0DC00",
    "skin": "#FDDBA0",
    "suit": "#2B2B2B",
    "tie": "#2B2B2B",
    "eyes": "#2B2B2B",
    "cigarette": "#F0F0F0"
  },
  "tony_tony_chopper": {
    "fur_body": "#C8453C",
    "fur_face": "#F0D0C8",
    "hat": "#E83030",
    "hat_cross": "#F0F0F0",
    "antlers": "#8B6914",
    "eyes": "#2B1A0A",
    "shorts": "#0044AA"
  },
  "nico_robin": {
    "hair": "#1A0A0A",
    "skin": "#C89060",
    "eyes": "#2B1A3D"
  },
  "franky": {
    "hair": "#0000CC",
    "skin": "#AADDFF",
    "speedo": "#CC0000",
    "metal_parts": "#AAAAAA",
    "eyes": "#4444FF"
  },
  "brook": {
    "suit": "#2B2B2B",
    "bones": "#F0EEE8",
    "hair_afro": "#2B2B2B",
    "hat": "#2B2B2B",
    "hat_band": "#FFFFFF",
    "cane": "#C8A020"
  },
  "jinbe": {
    "skin": "#6699CC",
    "spots": "#334466",
    "dobok": "#FFFFFF",
    "belt": "#CC6600",
    "eyes": "#CC4400"
  },
  "shanks": {
    "hair": "#CC0000",
    "skin": "#D4A060",
    "cloak": "#2B2B2B",
    "eyes": "#2B2B2B"
  },
  "whitebeard": {
    "skin": "#D4A878",
    "mustache": "#FFFFFF",
    "jacket": "#FFFFFF",
    "bandana": "#2B2B2B"
  },
  "marine_uniform": {
    "coat": "#FFFFFF",
    "coat_collar": "#FFFFFF",
    "shirt": "#004FA3",
    "pants": "#FFFFFF",
    "hat": "#FFFFFF",
    "hat_band": "#004FA3"
  },
  "ENVIRONMENT": {
    "ocean_grand_line": "#1A4A7A",
    "ocean_calm_belt": "#2A6A9A",
    "ocean_new_world": "#0A2A5A",
    "sky_day": "#87CEEB",
    "sky_sunset": "#FF8C42",
    "sky_night": "#0A0A2A",
    "sky_storm": "#3A3A4A",
    "island_jungle": "#228B22",
    "island_desert": "#C8A060",
    "island_snow": "#E8E8F0",
    "wood_ship": "#8B4513",
    "metal_cannon": "#4A4A4A",
    "wanted_poster_paper": "#F5E6C8",
    "fire": "#FF4400",
    "lightning": "#FFEE00",
    "water_splash": "#AADDFF",
    "blood": "#CC0022",
    "explosion_orange": "#FF6600",
    "explosion_yellow": "#FFCC00"
  }
}
```

---

## HOW TO HANDLE REFERENCE IMAGES

When the user uploads colored reference pages:

### Step A — Color Sampling
For each reference image, sample colors from these key regions:
- Character hair (top of head, center mass)
- Character skin (cheek / neck area)
- Character primary outfit (largest clothing region)
- Sky / background (top 10% of panel if sky present)
- Ocean / water (if visible)

Store sampled values and cross-reference with the Character Registry.
If a sampled value differs from registry by more than delta-E 20, ask user:
> "I'm seeing Luffy's vest as #E02B0A in your reference, but the registry says #E8230A. Should I update the registry to match your reference? [Yes / No / Only for this chapter]"

### Step B — Style Extraction
Extract:
- **Line art style**: cel-shaded vs. soft gradient vs. flat fill
- **Shadow style**: hard shadow (typical manga) vs. soft airbrushed
- **Highlight placement**: single dot highlight on eyes? Cloth sheen?
- **Background density**: how detailed/colorful are backgrounds vs. characters?

Apply extracted style to all B&W pages being colorized in this batch.

---

## PANEL SEGMENTATION RULES

Manga panels must be processed **per-panel**, not per-page. Rules:

1. Detect panel borders (thick black lines)
2. Segment the page into individual panels
3. Colorize each panel independently (prevents color bleeding)
4. Re-composite panels back to full page layout
5. Special case: **double-page spreads** — detect and treat as single wide panel

---

## BACKGROUND COLORIZATION STRATEGY

Backgrounds are harder than characters. Use this hierarchy:

```
RULE 1: If the panel has ocean → use ENVIRONMENT.ocean_* based on arc location
RULE 2: If the panel has sky → check time of day from surrounding panels, use sky_*
RULE 3: If the panel is inside a building → use neutral warm #F5E8D0 walls, contextual furniture
RULE 4: If the panel is action-only (screentone speed lines, no environment) → 
         keep near-white #F8F8F0 background, don't add color noise
RULE 5: If the panel is an emotional close-up → use soft complementary color 
         gradients (e.g., tense scene = warm red-orange, sad scene = cool blue)
RULE 6: If the panel has a specific location cue (jungle, snow, desert) →
         use ENVIRONMENT.island_* values
```

---

## COLOR CONSISTENCY ALGORITHM

The biggest challenge in manga colorization is **character color drift** across pages. Implement this:

```python
# Pseudo-code for color consistency enforcement

def enforce_consistency(colored_page, character_registry):
    # 1. Run face/character detection on colored page
    detected_characters = detect_characters(colored_page)
    
    for character in detected_characters:
        # 2. Get registered colors
        registered = character_registry[character.id]
        
        # 3. Sample actual colors from colored regions
        actual_hair = sample_dominant_color(character.hair_region)
        actual_skin = sample_dominant_color(character.skin_region)
        
        # 4. Calculate color distance
        hair_drift = delta_e_cie2000(actual_hair, registered['hair'])
        skin_drift = delta_e_cie2000(actual_skin, registered['skin'])
        
        # 5. If drift > threshold, apply correction
        if hair_drift > 15:
            colored_page = color_shift_region(
                colored_page,
                character.hair_region,
                source=actual_hair,
                target=registered['hair'],
                blend_strength=0.85  # Don't 100% clamp, allow slight variation
            )
        
        # 6. Flag for user review if correction was major
        if hair_drift > 30:
            flag_page_for_review(colored_page, reason=f"{character.id} hair color drifted significantly")
    
    return colored_page
```

---

## OUTPUT QUALITY STANDARDS

Every colorized page MUST meet these standards before being delivered:

| Check | Threshold | Action if Failed |
|-------|-----------|-----------------|
| Gray pixel coverage | < 2% of non-line pixels should be gray | Re-colorize or flag |
| Character color accuracy | All character colors within delta-E 15 of registry | Apply consistency pass |
| Panel border integrity | No color bleeding across panel lines | Re-segment & recolor |
| Resolution | Output ≥ input resolution (minimum 300 DPI) | Upscale if needed |
| Line art preservation | SSIM of line art > 0.95 vs original | Re-run without line destruction |
| Skin tone realism | No green/blue/purple tones on human characters | Flag for manual fix |

---

## API INTEGRATION NOTES (for the Astro frontend)

The frontend sends requests to the FastAPI backend like this:

```typescript
// Upload job creation
POST /api/jobs
{
  "chapter_title": "Chapter 1120: Atlas",
  "bw_file_id": "...",
  "reference_file_ids": ["..."],  // optional
  "colorization_method": "reference_guided" | "registry_only",
  "quality": "standard" | "high",  // high = slower, better
  "options": {
    "enforce_character_consistency": true,
    "auto_fix_drift": true,
    "manual_review_threshold": 30,  // delta-E value above which to flag
    "export_dpi": 300,
    "include_comparison_strip": true  // adds B&W/colored slider strip
  }
}

// Progress polling
GET /api/jobs/{job_id}/progress
→ {
    "status": "extracting" | "segmenting" | "colorizing" | "consistency_pass" | "exporting" | "done" | "error",
    "pages_total": 24,
    "pages_done": 12,
    "current_page": 13,
    "estimated_seconds_remaining": 45,
    "preview_url": "/previews/{job_id}/page_12.jpg"  // latest finished page
  }

// Get results
GET /api/jobs/{job_id}/results
→ {
    "pages": [
      {
        "page_number": 1,
        "bw_url": "/outputs/{job_id}/bw/page_1.png",
        "colored_url": "/outputs/{job_id}/colored/page_1.png",
        "flags": [],  // ["color_drift", "missed_segment", etc.]
        "character_registry_updates": {}
      }
    ],
    "pdf_url": "/outputs/{job_id}/colored_chapter.pdf",
    "stats": {
      "pages_auto_fixed": 3,
      "pages_flagged_for_review": 1,
      "new_characters_detected": 0,
      "colorization_method": "reference_guided",
      "processing_time_seconds": 127
    }
  }
```

---

## EDGE CASES — HOW TO HANDLE THEM

| Situation | Handling |
|-----------|----------|
| **Panel is ALL screentones** (speed lines, impact effects) | Keep background near-white, only colorize characters |
| **Character in silhouette** (solid black shape) | Do NOT colorize — preserve silhouette as-is |
| **Devil Fruit transformation** (Luffy gear 5 = white) | Check arc context. Override registry for transformation panels |
| **Flashback panels** (sepia/desaturated in source) | Apply desaturated warm palette #C8A878 instead of full color |
| **Cover page** | Higher saturation, painterly treatment, treat as illustration not manga panel |
| **Double page spread** | Stitch both pages, colorize as single wide image, then split |
| **Text bubbles** | Never colorize the interior of speech bubbles — keep white |
| **Sound effects** (SFX kanji) | Colorize SFX based on context: explosions=orange/red, water=blue, punch=yellow |
| **Unknown character** | Generate neutral palette, highlight in UI for user to assign colors |

---

## PROMPT FORMAT FOR FLUX/STABLE DIFFUSION CALLS

When calling an image generation model for colorization, use this prompt structure:

```
SYSTEM: You are a professional manga colorist specializing in One Piece. 
Apply colors exactly as specified. Do not add or remove lineart. 
Do not change panel composition. Only add color.

IMAGE PROMPT:
Colorize this black and white manga panel from One Piece.
Character colors:
- Luffy: red vest #E8230A, blue shorts #004FA3, black hair #1A0A00, tan skin #F4C08A
- [other detected characters with their hex values]

Environment: [detected background type]
Style: cel-shaded, flat color fills, hard shadows on right side, 
      small white highlight dot on character eyes,
      manga coloring style, not painterly, not photorealistic

NEGATIVE PROMPT:
photorealistic, painterly, oil painting, watercolor, 3d render,
grayscale, monochrome, altered lineart, missing lines,
wrong colors, skin tone errors, color bleeding, artifacts
```

---

## DATABASE SCHEMA

```sql
-- Jobs table
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  bw_pdf_path TEXT,
  reference_paths TEXT,  -- JSON array
  output_pdf_path TEXT,
  total_pages INTEGER,
  completed_pages INTEGER DEFAULT 0,
  method TEXT,
  options TEXT  -- JSON
);

-- Pages table
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id),
  page_number INTEGER,
  bw_path TEXT,
  colored_path TEXT,
  status TEXT DEFAULT 'pending',
  flags TEXT,  -- JSON array of flags
  registry_updates TEXT,  -- JSON
  processing_time_ms INTEGER
);

-- Character Registry
CREATE TABLE character_registry (
  id TEXT PRIMARY KEY,
  character_name TEXT NOT NULL,
  manga_series TEXT DEFAULT 'one_piece',
  color_data TEXT NOT NULL,  -- JSON hex values
  is_canon BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source_reference TEXT  -- which reference image confirmed these colors
);

-- User corrections
CREATE TABLE color_corrections (
  id TEXT PRIMARY KEY,
  page_id TEXT REFERENCES pages(id),
  character_id TEXT,
  region TEXT,  -- 'hair', 'skin', 'outfit', etc.
  original_color TEXT,
  corrected_color TEXT,
  apply_to_future BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## WHAT TO DO WHEN UNCERTAIN

When the AI model is uncertain about a color decision, it should:

1. **Default to registry** — if a character is in the registry, their colors are ground truth
2. **Use context** — look at surrounding panels for environmental cues
3. **Choose saturation conservatively** — slightly muted colors are better than garish ones
4. **Ask, don't guess, for major decisions** — if an entire page's context is ambiguous, flag it and show options to the user
5. **Never gray** — any region that ends up gray-ish should be re-examined. Manga colorization requires full color commitment.

---

*This prompt is used by the ChromaManga backend AI pipeline. Keep it updated as the character registry grows.*

---------------------------------------------

# ChromaManga — Design System

## Project Identity
**ChromaManga** is an AI-powered manga colorization tool for personal use.
Target user: One Piece fan / manga reader who wants to colorize B&W chapters.
Single job: Upload PDF → Colorize → Download. 

## Brand Direction
The aesthetic should feel like a **premium creative tool** meets **manga culture** —
think "Figma for manga colorists". Dark, focused, cinematic. Not anime-garish.
The interface should feel like you're working inside a dark editing suite with
a single bright work surface in the center.

## Color Palette
```
--ink:          #0A0A0F   /* near-black, main bg */
--surface:      #12121A   /* card/panel bg */
--surface-2:    #1C1C28   /* elevated surface */
--surface-3:    #252535   /* hover state */
--border:       #2A2A3D   /* subtle borders */
--border-hover: #3D3D5A   /* hover borders */
--accent:       #E8230A   /* Luffy red — primary CTA */
--accent-dim:   #8B1506   /* dimmed red */
--gold:         #F4C020   /* straw hat gold — secondary accent */
--text-primary: #F0EEF8   /* near-white text */
--text-secondary: #8A8AA8 /* muted text */
--text-hint:    #4A4A6A   /* very muted */
--success:      #22C55E
--warning:      #F59E0B
--error:        #EF4444
--blue-ocean:   #1A4A7A   /* One Piece ocean blue */
```

## Typography
```
Display: "Bebas Neue" — used for chapter titles, hero numbers (manga energy)
Body:    "Inter" — clean, readable for UI labels and descriptions
Mono:    "JetBrains Mono" — for hex codes in the color editor
```
Load from Google Fonts:
- Bebas Neue: https://fonts.googleapis.com/css2?family=Bebas+Neue
- Inter: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600
- JetBrains Mono: https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500

## Layout Concept
Three-zone layout:
1. **Left sidebar** (260px): Job history, chapter list, settings
2. **Main canvas** (flexible): Current job workspace — upload, progress, preview
3. **Right panel** (300px, collapsible): Color registry editor, character colors

On mobile: sidebar becomes bottom sheet, right panel becomes modal.

## Signature Element
The **B&W ↔ Color slider** on the preview page. This is what makes the tool feel
alive — dragging to see pages transform from grey to full color. The divider
line should glow with Luffy's red (#E8230A) and animate when you first land on it.

## Component Style Rules
- Cards: 1px border `var(--border)`, `border-radius: 12px`, `background: var(--surface)`
- CTAs: Luffy red `#E8230A` background, white text, `border-radius: 8px`
- Secondary buttons: transparent bg, `1px solid var(--border)`, hover → `var(--surface-3)`
- Inputs: `background: var(--surface-2)`, `border: 1px solid var(--border)`, focus → `border-color: var(--accent)`
- Progress bars: thin `3px` height, accent-colored fill, animated shimmer when loading
- Page thumbnails: 3:4 aspect ratio (manga page proportions)
- Status badges: pill-shaped, color-coded by status

## Motion
- Page transitions: fade + slight upward translate (200ms ease-out)
- Upload drop zone: border pulses from `var(--border)` → `var(--accent)` on drag
- Progress bar: smooth width transition + shimmer sweep
- Slider reveal: the comparison slider should have a subtle spring physics feel
- Hover on thumbnails: slight scale(1.02) + border color change

## Sections (in order on the main page)
1. Hero: "Bring One Piece to Life" — with an animated split preview
2. Upload zone: drag-and-drop or click, accepts PDF
3. Reference zone: optional colored reference upload
4. Colorization options: method, quality, chapter title
5. Progress view: real-time per-page progress
6. Preview gallery: grid of colored pages with comparison slider
7. Export: download PDF button

## Tone of Copy
- Enthusiastic but not cringe
- Uses manga vocabulary: "chapters", "panels", "spreads", "SFX"
- Never says "AI-powered" in a corny way — just says what it does
- Error messages are direct: "This page needs manual review — Luffy's jacket color drifted"