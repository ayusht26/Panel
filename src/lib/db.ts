import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';


// Define the DB interface
export interface Job {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  bw_pdf_path?: string;
  reference_paths?: string; // JSON array string
  output_pdf_path?: string;
  total_pages: number;
  completed_pages: number;
  method: string;
  options: string; // JSON string
}

export interface PageItem {
  id: string;
  job_id: string;
  page_number: number;
  bw_path: string;
  colored_path: string;
  status: string;
  flags: string; // JSON array string
  registry_updates: string; // JSON string
  processing_time_ms: number;
}

export interface CharacterRegistry {
  id: string;
  character_name: string;
  manga_series: string;
  color_data: string; // JSON string
  is_canon: boolean;
  created_at: string;
  updated_at: string;
  source_reference?: string;
}

export interface ColorCorrection {
  id: string;
  page_id: string;
  character_id: string;
  region: string;
  original_color: string;
  corrected_color: string;
  apply_to_future: boolean;
  created_at: string;
}

const DB_FILE = path.resolve('db.sqlite');
const FALLBACK_FILE = path.resolve('db_fallback.json');

// Default color registry based on system requirements
const DEFAULT_REGISTRY = {
  "monkey_d_luffy": {
    "character_name": "Monkey D. Luffy",
    "color_data": {
      "hair": "#1A0A00",
      "skin": "#F4C08A",
      "vest_red": "#E8230A",
      "shorts_blue": "#004FA3",
      "sandals": "#8B6914",
      "scar_under_eye": "#CC3333",
      "hat_straw": "#D4AC0D",
      "hat_band_red": "#CC0000",
      "eyes": "#2B2B2B"
    }
  },
  "roronoa_zoro": {
    "character_name": "Roronoa Zoro",
    "color_data": {
      "hair": "#2D7A2D",
      "skin": "#D4A870",
      "shirt_white": "#F0EEE8",
      "pants": "#2B2B2B",
      "bandana": "#009944",
      "earrings": "#FFD700",
      "eyes": "#1A6B1A",
      "haramaki": "#2C4A2C"
    }
  },
  "nami": {
    "character_name": "Nami",
    "color_data": {
      "hair": "#FF8C00",
      "skin": "#FDBF82",
      "eyes": "#774400",
      "tattoo_blue": "#0066CC",
      "tattoo_orange": "#FF6600"
    }
  },
  "usopp": {
    "character_name": "Usopp",
    "color_data": {
      "hair": "#2B1A00",
      "skin": "#B8834A",
      "overalls": "#4A3D2A",
      "hat": "#8B6914",
      "goggles": "#2B7ABF",
      "eyes": "#1A0A00"
    }
  },
  "sanji": {
    "character_name": "Sanji",
    "color_data": {
      "hair": "#F0DC00",
      "skin": "#FDDBA0",
      "suit": "#2B2B2B",
      "tie": "#2B2B2B",
      "eyes": "#2B2B2B",
      "cigarette": "#F0F0F0"
    }
  },
  "tony_tony_chopper": {
    "character_name": "Tony Tony Chopper",
    "color_data": {
      "fur_body": "#C8453C",
      "fur_face": "#F0D0C8",
      "hat": "#E83030",
      "hat_cross": "#F0F0F0",
      "antlers": "#8B6914",
      "eyes": "#2B1A0A",
      "shorts": "#0044AA"
    }
  },
  "nico_robin": {
    "character_name": "Nico Robin",
    "color_data": {
      "hair": "#1A0A0A",
      "skin": "#C89060",
      "eyes": "#2B1A3D"
    }
  },
  "franky": {
    "character_name": "Franky",
    "color_data": {
      "hair": "#0000CC",
      "skin": "#AADDFF",
      "speedo": "#CC0000",
      "metal_parts": "#AAAAAA",
      "eyes": "#4444FF"
    }
  },
  "brook": {
    "character_name": "Brook",
    "color_data": {
      "suit": "#2B2B2B",
      "bones": "#F0EEE8",
      "hair_afro": "#2B2B2B",
      "hat": "#2B2B2B",
      "hat_band": "#FFFFFF",
      "cane": "#C8A020"
    }
  },
  "jinbe": {
    "character_name": "Jinbe",
    "color_data": {
      "skin": "#6699CC",
      "spots": "#334466",
      "dobok": "#FFFFFF",
      "belt": "#CC6600",
      "eyes": "#CC4400"
    }
  },
  "shanks": {
    "character_name": "Shanks",
    "color_data": {
      "hair": "#CC0000",
      "skin": "#D4A060",
      "cloak": "#2B2B2B",
      "eyes": "#2B2B2B"
    }
  },
  "whitebeard": {
    "character_name": "Whitebeard",
    "color_data": {
      "skin": "#D4A878",
      "mustache": "#FFFFFF",
      "jacket": "#FFFFFF",
      "bandana": "#2B2B2B"
    }
  },
  "marine_uniform": {
    "character_name": "Marine Uniform",
    "color_data": {
      "coat": "#FFFFFF",
      "coat_collar": "#FFFFFF",
      "shirt": "#004FA3",
      "pants": "#FFFFFF",
      "hat": "#FFFFFF",
      "hat_band": "#004FA3"
    }
  },
  "ENVIRONMENT": {
    "character_name": "ENVIRONMENT",
    "color_data": {
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
};

let sqliteDb: any = null;
let useFallback = false;

// Interface for Fallback Database file contents
interface FallbackDbSchema {
  jobs: Job[];
  pages: PageItem[];
  character_registry: CharacterRegistry[];
  color_corrections: ColorCorrection[];
}

function loadFallbackData(): FallbackDbSchema {
  if (!fs.existsSync(FALLBACK_FILE)) {
    const registryList: CharacterRegistry[] = Object.entries(DEFAULT_REGISTRY).map(([id, info]) => ({
      id,
      character_name: info.character_name,
      manga_series: 'one_piece',
      color_data: JSON.stringify(info.color_data),
      is_canon: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const initialData: FallbackDbSchema = {
      jobs: [],
      pages: [],
      character_registry: registryList,
      color_corrections: []
    };
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf-8'));
}

function saveFallbackData(data: FallbackDbSchema) {
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function initDb() {
  try {
    // Create require for ESM compatibility
    const require = createRequire(import.meta.url);
    
    // Attempt to dynamically load better-sqlite3
    const Database = require('better-sqlite3');
    sqliteDb = new Database(DB_FILE);
    
    // Create Tables
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        bw_pdf_path TEXT,
        reference_paths TEXT,
        output_pdf_path TEXT,
        total_pages INTEGER,
        completed_pages INTEGER DEFAULT 0,
        method TEXT,
        options TEXT
      );

      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        job_id TEXT REFERENCES jobs(id),
        page_number INTEGER,
        bw_path TEXT,
        colored_path TEXT,
        status TEXT DEFAULT 'pending',
        flags TEXT,
        registry_updates TEXT,
        processing_time_ms INTEGER
      );

      CREATE TABLE IF NOT EXISTS character_registry (
        id TEXT PRIMARY KEY,
        character_name TEXT NOT NULL,
        manga_series TEXT DEFAULT 'one_piece',
        color_data TEXT NOT NULL,
        is_canon BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        source_reference TEXT
      );

      CREATE TABLE IF NOT EXISTS color_corrections (
        id TEXT PRIMARY KEY,
        page_id TEXT REFERENCES pages(id),
        character_id TEXT,
        region TEXT,
        original_color TEXT,
        corrected_color TEXT,
        apply_to_future BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed Character Registry if empty
    const registryCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM character_registry").get().count;
    if (registryCount === 0) {
      const insertStmt = sqliteDb.prepare(`
        INSERT INTO character_registry (id, character_name, color_data, is_canon, created_at, updated_at)
        VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
      `);

      sqliteDb.transaction(() => {
        for (const [id, info] of Object.entries(DEFAULT_REGISTRY)) {
          insertStmt.run(id, info.character_name, JSON.stringify(info.color_data));
        }
      })();
    }
    console.log("SQLite successfully initialized at " + DB_FILE);
  } catch (e) {
    console.warn("Failed to load native better-sqlite3 module. Falling back to JSON file storage. Error: ", e);
    useFallback = true;
    loadFallbackData();
  }
}

// Ensure database initialized
initDb();

export const db = {
  // Jobs CRUD
  getJobs(): Job[] {
    if (useFallback) {
      return loadFallbackData().jobs;
    }
    return sqliteDb.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();
  },

  getJob(id: string): Job | undefined {
    if (useFallback) {
      return loadFallbackData().jobs.find(j => j.id === id);
    }
    return sqliteDb.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
  },

  createJob(job: Job): void {
    if (useFallback) {
      const data = loadFallbackData();
      data.jobs.push(job);
      saveFallbackData(data);
      return;
    }
    sqliteDb.prepare(`
      INSERT INTO jobs (id, title, status, created_at, updated_at, bw_pdf_path, reference_paths, output_pdf_path, total_pages, completed_pages, method, options)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      job.id, job.title, job.status, job.created_at, job.updated_at,
      job.bw_pdf_path, job.reference_paths, job.output_pdf_path,
      job.total_pages, job.completed_pages, job.method, job.options
    );
  },

  updateJob(id: string, updates: Partial<Job>): void {
    const now = new Date().toISOString();
    if (useFallback) {
      const data = loadFallbackData();
      const jobIdx = data.jobs.findIndex(j => j.id === id);
      if (jobIdx !== -1) {
        data.jobs[jobIdx] = { ...data.jobs[jobIdx], ...updates, updated_at: now } as Job;
        saveFallbackData(data);
      }
      return;
    }

    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => (updates as any)[k]);
    params.push(now, id);

    sqliteDb.prepare(`
      UPDATE jobs SET ${setClause}, updated_at = ? WHERE id = ?
    `).run(...params);
  },

  // Pages CRUD
  getPages(jobId: string): PageItem[] {
    if (useFallback) {
      return loadFallbackData().pages.filter(p => p.job_id === jobId);
    }
    return sqliteDb.prepare("SELECT * FROM pages WHERE job_id = ? ORDER BY page_number ASC").all(jobId);
  },

  createPage(page: PageItem): void {
    if (useFallback) {
      const data = loadFallbackData();
      data.pages.push(page);
      saveFallbackData(data);
      return;
    }
    sqliteDb.prepare(`
      INSERT INTO pages (id, job_id, page_number, bw_path, colored_path, status, flags, registry_updates, processing_time_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      page.id, page.job_id, page.page_number, page.bw_path, page.colored_path,
      page.status, page.flags, page.registry_updates, page.processing_time_ms
    );
  },

  updatePage(id: string, updates: Partial<PageItem>): void {
    if (useFallback) {
      const data = loadFallbackData();
      const pageIdx = data.pages.findIndex(p => p.id === id);
      if (pageIdx !== -1) {
        data.pages[pageIdx] = { ...data.pages[pageIdx], ...updates } as PageItem;
        saveFallbackData(data);
      }
      return;
    }

    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => (updates as any)[k]);
    params.push(id);

    sqliteDb.prepare(`
      UPDATE pages SET ${setClause} WHERE id = ?
    `).run(...params);
  },

  // Character Registry
  getCharacterRegistry(): CharacterRegistry[] {
    if (useFallback) {
      return loadFallbackData().character_registry;
    }
    return sqliteDb.prepare("SELECT * FROM character_registry ORDER BY id ASC").all();
  },

  updateCharacterColor(id: string, colors: Record<string, string>): void {
    const now = new Date().toISOString();
    const colorStr = JSON.stringify(colors);
    
    if (useFallback) {
      const data = loadFallbackData();
      const charIdx = data.character_registry.findIndex(c => c.id === id);
      if (charIdx !== -1) {
        data.character_registry[charIdx].color_data = colorStr;
        data.character_registry[charIdx].updated_at = now;
        saveFallbackData(data);
      }
      return;
    }

    sqliteDb.prepare(`
      UPDATE character_registry SET color_data = ?, updated_at = ? WHERE id = ?
    `).run(colorStr, now, id);
  },

  // Color Corrections
  createColorCorrection(corr: ColorCorrection): void {
    if (useFallback) {
      const data = loadFallbackData();
      data.color_corrections.push(corr);
      saveFallbackData(data);
      return;
    }
    sqliteDb.prepare(`
      INSERT INTO color_corrections (id, page_id, character_id, region, original_color, corrected_color, apply_to_future, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      corr.id, corr.page_id, corr.character_id, corr.region,
      corr.original_color, corr.corrected_color, corr.apply_to_future ? 1 : 0, corr.created_at
    );
  },

  getColorCorrections(pageId: string): ColorCorrection[] {
    if (useFallback) {
      return loadFallbackData().color_corrections.filter(c => c.page_id === pageId);
    }
    return sqliteDb.prepare("SELECT * FROM color_corrections WHERE page_id = ? ORDER BY created_at DESC").all(pageId);
  }
};
