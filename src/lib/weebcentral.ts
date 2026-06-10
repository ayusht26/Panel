import * as cheerio from 'cheerio';

const BASE = 'https://weebcentral.com';
const CDN = 'https://temp.compsci88.com/cover';

export interface SeriesResult {
  id: string;
  title: string;
  slug: string;
  image: string;
  type?: string;
  year?: string;
  status?: string;
}

export interface SeriesDetail extends SeriesResult {
  altTitles: string[];
  description: string;
  authors: string[];
  tags: string[];
  chapters: ChapterInfo[];
}

export interface ChapterInfo {
  id: string;
  chapter: string;
  title: string;
  date: string;
}

export interface ChapterPages {
  id: string;
  pages: string[];
  chapterTitle: string;
}

export interface HotUpdate {
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  chapterId: string;
  chapterTitle: string;
  cover: string;
  date: string;
}

export interface HotSeriesItem {
  id: string;
  title: string;
  slug: string;
}

export interface HomepageData {
  hotUpdates: HotUpdate[];
  latestUpdates: HotUpdate[];
  hotSeries: HotSeriesItem[];
  recentlyAdded: HotSeriesItem[];
  recommendations: SeriesResult[];
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

function extractSeriesId(href: string): string | null {
  const m = href.match(/\/series\/([^/]+)/);
  return m ? m[1] : null;
}

function extractChapterId(href: string): string | null {
  const m = href.match(/\/chapters\/([^/]+)/);
  return m ? m[1] : null;
}

export async function getHomepage(): Promise<HomepageData> {
  const html = await fetchHTML(BASE + '/');
  const $ = cheerio.load(html);

  const hotUpdates: HotUpdate[] = [];
  const latestUpdates: HotUpdate[] = [];
  const hotSeries: HotSeriesItem[] = [];
  const recentlyAdded: HotSeriesItem[] = [];
  const recommendations: SeriesResult[] = [];

  // Hot Updates — desktop grid items
  $('article').each((_, el) => {
    const $el = $(el);
    const bottomDiv = $el.find('div.absolute.bottom-0');
    if (bottomDiv.length === 0) return; // Skip mobile layout duplicates

    const chapterLink = $el.find('a[href*="/chapters/"]').first();
    const chapterHref = chapterLink.attr('href') || '';
    const chapterId = extractChapterId(chapterHref);
    if (!chapterId) return;

    const img = $el.find('img').first();
    const cover = img.attr('src') || img.attr('data-src') || '';
    
    // Extract seriesId from cover image URL filename (e.g. 01J76XYERPHPGCM3C3HEME1YAK)
    const seriesId = cover.split('/').pop()?.split('.')[0] || '';
    if (!seriesId) return;

    const divs = bottomDiv.find('div');
    const seriesTitle = divs.eq(0).text().trim();
    const chapterTitle = divs.eq(1).text().trim();
    const date = $el.find('time').attr('datetime') || '';
    
    const seriesSlug = seriesTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    hotUpdates.push({
      seriesId, seriesSlug, seriesTitle,
      chapterId, chapterTitle, cover, date,
    });
  });

  // Latest Updates — flex row items with timestamp
  $('article:has(a[href*="/chapters/"])').each((_, el) => {
    const $el = $(el);
    const seriesLink = $el.find('a[href*="/series/"]').first();
    const seriesHref = seriesLink.attr('href') || '';
    const seriesId = extractSeriesId(seriesHref);
    if (!seriesId) return;

    const chapterLink = $el.find('a[href*="/chapters/"]').first();
    const chapterHref = chapterLink.attr('href') || '';
    const chapterId = extractChapterId(chapterHref);
    if (!chapterId) return;

    const seriesTitle = chapterLink.find('div').first().text().trim() || seriesLink.text().trim();
    const chapterTitle = chapterLink.find('span').first().text().trim() || 'Chapter';
    const date = $el.find('time').attr('datetime') || '';
    const img = $el.find('img').first();
    const cover = img.attr('src') || img.attr('data-src') || '';
    const seriesSlug = seriesHref.split('/').pop() || '';

    // Deduplicate against hotUpdates
    if (!latestUpdates.some(u => u.chapterId === chapterId)) {
      latestUpdates.push({
        seriesId, seriesSlug, seriesTitle,
        chapterId, chapterTitle, cover, date,
      });
    }
  });

  // Hot Series
  try {
    const hotHtml = await fetchHTML(BASE + '/hot-series?sort=monthly_views');
    const $hot = cheerio.load(hotHtml);
    $hot('a[href*="/series/"]').each((_, el) => {
      const href = $hot(el).attr('href') || '';
      const id = extractSeriesId(href);
      if (!id) return;
      const title = $hot(el).text().trim();
      if (title) hotSeries.push({ id, title, slug: href.split('/').pop() || '' });
    });
  } catch (err) {
    console.error('Error fetching hot series:', err);
  }

  // Recently Added
  $('a[href*="/series/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const id = extractSeriesId(href);
    if (!id) return;
    const parent = $(el).parent();
    const sectionTitle = parent.closest('section').find('h2, h3').text().trim();
    if (sectionTitle.toLowerCase().includes('recently') || $(el).closest('section').text().toLowerCase().includes('recently')) {
      const title = $(el).text().trim();
      if (title && !recentlyAdded.some(r => r.id === id)) {
        recentlyAdded.push({ id, title, slug: href.split('/').pop() || '' });
      }
    }
  });

  // Recommendations — carousel items
  $('.glide__slide a[href*="/series/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const id = extractSeriesId(href);
    if (!id) return;
    const img = $(el).find('img[src*="temp.compsci88.com"]').first();
    const cover = img.attr('src') || img.attr('data-src') || '';
    const rawTitle = $(el).find('img').attr('alt') || $(el).text().trim() || '';
    const title = cleanMangaTitle(rawTitle);
    if (title && !recommendations.some(r => r.id === id)) {
      recommendations.push({
        id, title, slug: href.split('/').pop() || '',
        image: cover,
      });
    }
  });

  // If recommendations empty, fallback: grab featured series links with covers
  if (recommendations.length === 0) {
    $('a[href*="/series/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const id = extractSeriesId(href);
      if (!id || recommendations.some(r => r.id === id)) return;
      const img = $(el).find('img[src*="temp.compsci88.com"]').first();
      const cover = img.attr('src') || img.attr('data-src') || '';
      const rawTitle = $(el).find('img').attr('alt') || '';
      const title = cleanMangaTitle(rawTitle);
      if (title) {
        recommendations.push({
          id, title, slug: href.split('/').pop() || '',
          image: cover,
        });
      }
    });
  }

  return { hotUpdates, latestUpdates, hotSeries, recentlyAdded, recommendations };
}

export async function searchSeries(query: string): Promise<SeriesResult[]> {
  const url = `${BASE}/search/simple?location=main`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: new URLSearchParams({ text: query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} searching`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results: SeriesResult[] = [];

  $('a[href*="/series/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/\/series\/([^/]+)\/([^/]+)/);
    if (!match) return;
    const id = match[1];
    if (results.some(r => r.id === id)) return;
    const img = $(el).find('img').first();
    const src = img.attr('src') || img.attr('data-src') || '';
    results.push({
      id,
      title: cleanMangaTitle(img.attr('alt') || match[2].replace(/-/g, ' ')),
      slug: match[2],
      image: src || getCoverUrl(id),
    });
  });

  return results;
}

export async function getSeriesDetail(id: string): Promise<SeriesDetail> {
  const url = `${BASE}/series/${id}`;
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim();
  const description = $('p').first().text().trim();
  const coverImg = $('img[src*="temp.compsci88.com"]').first().attr('src')
    || $('img[src*="cover"]').first().attr('src')
    || getCoverUrl(id);

  const altTitles: string[] = [];
  const authors: string[] = [];
  const tags: string[] = [];

  for (const el of $('li').toArray()) {
    const strong = $(el).find('strong').text().trim();
    if (strong.includes('Associated Name')) {
      for (const li of $(el).find('ul li').toArray()) {
        altTitles.push($(li).text().trim());
      }
    }
  }

  for (const el of $('a[href*="author"]').toArray()) {
    authors.push($(el).text().trim());
  }

  for (const el of $('a[href*="included_tag"]').toArray()) {
    tags.push($(el).text().trim());
  }

  const type = $('a[href*="included_type"]').first().text().trim() || undefined;
  const status = $('a[href*="included_status"]').first().text().trim() || undefined;

  let year: string | undefined;
  const releasedText = $('li:contains("Released")').text().trim();
  const yearMatch = releasedText.match(/(\d{4})/);
  if (yearMatch) year = yearMatch[1];

  const chapters: ChapterInfo[] = [];
  try {
    const chaptersHtml = await fetchHTML(`${BASE}/series/${id}/full-chapter-list`);
    const $ch = cheerio.load(chaptersHtml);
    const chapterLinks = $ch('a[href*="/chapters/"]');
    chapterLinks.each((_, el) => {
      const href = $ch(el).attr('href') || '';
      const match = href.match(/\/chapters\/([^/]+)/);
      if (!match) return;

      const growSpan = $ch(el).find('span.grow').first();
      let text = '';
      if (growSpan.length) {
        text = growSpan.children('span').first().text().trim();
      }
      if (!text) {
        text = $ch(el).text().trim().split('Last Read')[0].trim();
      }
      const date = $ch(el).find('time').attr('datetime') || '';
      chapters.push({
        id: match[1],
        chapter: text.replace(/^Chapter\s+/i, '').trim(),
        title: text,
        date,
      });
    });
  } catch (err) {
    console.error('Error fetching full chapter list:', err);
  }

  return {
    id,
    title,
    slug: url.split('/').pop() || id,
    image: coverImg,
    altTitles, description, authors, tags,
    type, year, status, chapters,
  };
}

export async function getChapterPages(chapterId: string): Promise<ChapterPages> {
  const url = `${BASE}/chapters/${chapterId}`;
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  const images: string[] = [];

  // 1. Try to find the first page preload image URL
  const firstPageUrl = $('link[rel="preload"][as="image"]').first().attr('href');
  
  // 2. Try to find the max page count from modal selection buttons
  const pageNums: number[] = [];
  $('button').each((_, el) => {
    const txt = $(el).text().trim();
    if (/^\d+$/.test(txt)) {
      pageNums.push(parseInt(txt, 10));
    }
  });
  const maxPage = Math.max(...pageNums, 0);

  if (firstPageUrl && maxPage > 0) {
    // Generate all page URLs from firstPageUrl and maxPage
    const match = firstPageUrl.match(/^(.*?)(\d+)(\.[a-zA-Z0-9]+)$/);
    if (match) {
      const prefix = match[1];
      const firstPageNumStr = match[2];
      const ext = match[3];
      const paddingLength = firstPageNumStr.length;

      for (let i = 1; i <= maxPage; i++) {
        const pageStr = String(i).padStart(paddingLength, '0');
        images.push(`${prefix}${pageStr}${ext}`);
      }
    }
  }

  // Fallback: If generation failed, use original selectors/regex
  if (images.length === 0) {
    $('link[rel="preload"][as="image"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && (href.includes('planeptune') || href.includes('lastation') || href.includes('us'))) images.push(href);
    });

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && (src.includes('planeptune') || src.includes('lastation') || src.includes('us')) && !src.includes('brand.png')) {
        if (!images.includes(src)) images.push(src);
      }
    });

    const imgRegex = /['"]((?:https?:)?\/\/[^'"]*?(?:planeptune|lastation)[^'"]*(?:webp|jpg|jpeg|png))['"]/g;
    let m;
    while ((m = imgRegex.exec(html)) !== null) {
      const url = m[1].startsWith('//') ? 'https:' + m[1] : m[1];
      if (!images.includes(url)) images.push(url);
    }
  }

  let chapterTitle = `Chapter ${chapterId}`;
  const docTitle = $('title').first().text().trim();
  if (docTitle && docTitle.includes('|')) {
    const parts = docTitle.split('|');
    const chName = parts[0].trim();
    const seriesName = parts[1]?.trim();
    if (chName && seriesName) {
      chapterTitle = `${seriesName} - ${chName}`;
    } else if (chName) {
      chapterTitle = chName;
    }
  }
  return { id: chapterId, pages: images, chapterTitle };
}

export function getCoverUrl(id: string): string {
  return `${CDN}/fallback/${id}.jpg`;
}

export function cleanMangaTitle(title: string): string {
  return title.replace(/\s+cover$/i, '').trim();
}
