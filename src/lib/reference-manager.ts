import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface RefPair {
  bwBuffer: Buffer;
  coloredBuffer: Buffer;
  pageNum: number;
}

const MANGA_BASE = path.resolve('public', 'manga');
const BW_DIR_PREFIX = 'One-Piece';
const COLOR_DIR_PREFIX = 'One-Piece-Digital-Colored-Comics';

const padChapter = (str: string | number) => {
  const num = typeof str === 'string' ? parseFloat(str) : str;
  if (isNaN(num)) return String(str);
  if (Number.isInteger(num)) {
    if (num < 10) return `00${num}`;
    if (num < 100) return `0${num}`;
    return `${num}`;
  }
  return String(str);
};

const getPageNum = (name: string) => {
  const match = name.match(/(\d+)\.(png|jpg|jpeg|webp)$/i);
  return match ? parseInt(match[1]) : 0;
};

function scanChapter(chapterNum: number): RefPair[] {
  const bwDir = path.resolve(MANGA_BASE, BW_DIR_PREFIX, `Chapter ${chapterNum}`);
  const colorDir = path.resolve(MANGA_BASE, COLOR_DIR_PREFIX, `Chapter ${chapterNum}`);

  if (!fs.existsSync(bwDir) || !fs.existsSync(colorDir)) return [];

  const bwFiles = fs.readdirSync(bwDir)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort((a, b) => getPageNum(a) - getPageNum(b));

  const results: RefPair[] = [];
  for (const bwFile of bwFiles) {
    const pn = getPageNum(bwFile);
    if (pn === 0) continue;

    const colorFile = fs.readdirSync(colorDir)
      .find(f => getPageNum(f) === pn && /\.(png|jpg|jpeg|webp)$/i.test(f));
    if (!colorFile) continue;

    try {
      results.push({
        bwBuffer: fs.readFileSync(path.join(bwDir, bwFile)),
        coloredBuffer: fs.readFileSync(path.join(colorDir, colorFile)),
        pageNum: pn,
      });
    } catch { }
  }

  return results;
}

async function fetchWebArchivePair(chapterNum: number, pageNum: number): Promise<RefPair | null> {
  const slug = `one-piece-chapter-${padChapter(chapterNum)}`;
  const colorSlug = `one-piece-digital-colored-comics-chapter-${padChapter(chapterNum)}`;
  const baseUrl = `https://ww12.readonepiece.com/chapter/`;

  try {
    const [bwHtml, colorHtml] = await Promise.all([
      fetch(`${baseUrl}${slug}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }),
      fetch(`${baseUrl}${colorSlug}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }),
    ]);

    if (!bwHtml.ok || !colorHtml.ok) return null;

    const [bwText, colorText] = await Promise.all([bwHtml.text(), colorHtml.text()]);
    const imgRegex = /https:\/\/cdn\.readonepiece\.com\/file\/mangap\/[^"'\s>]+(?:\.jpeg|\.jpg|\.png|\.webp)/gi;

    const bwUrls = Array.from(new Set(bwText.match(imgRegex) || []));
    const colorUrls = Array.from(new Set(colorText.match(imgRegex) || []));

    const getPageNumFromUrl = (url: string) => {
      const m = url.split('/').pop()?.match(/^(\d+)/);
      return m ? parseInt(m[1]) : 999;
    };

    const bwUrl = bwUrls.find(u => getPageNumFromUrl(u) === pageNum);
    const colorUrl = colorUrls.find(u => getPageNumFromUrl(u) === pageNum);
    if (!bwUrl || !colorUrl) return null;

    const [bwRes, colorRes] = await Promise.all([
      fetch(bwUrl, { headers: { 'Referer': 'https://ww12.readonepiece.com/', 'User-Agent': 'Mozilla/5.0' } }),
      fetch(colorUrl, { headers: { 'Referer': 'https://ww12.readonepiece.com/', 'User-Agent': 'Mozilla/5.0' } }),
    ]);

    if (!bwRes.ok || !colorRes.ok) return null;

    return {
      bwBuffer: Buffer.from(await bwRes.arrayBuffer()),
      coloredBuffer: Buffer.from(await colorRes.arrayBuffer()),
      pageNum,
    };
  } catch {
    return null;
  }
}

export async function findReferenceForPage(
  bwPageBuffer: Buffer,
  altChapter?: number,
  altPageNum?: number
): Promise<{ bwBuffer: Buffer; coloredBuffer: Buffer } | null> {
  const bwMeta = await sharp(bwPageBuffer).metadata();
  const bwPixels = await sharp(bwPageBuffer)
    .resize(64, 64, { fit: 'fill' })
    .raw()
    .toBuffer();

  // Compute average luminance of input page for rough matching
  let avgL = 0;
  for (let i = 0; i < bwPixels.length; i++) avgL += bwPixels[i];
  avgL /= bwPixels.length;

  let bestMatch: RefPair | null = null;
  let bestScore = Infinity;

  // Try local chapters first (1-6)
  for (let ch = 1; ch <= 6; ch++) {
    const pairs = scanChapter(ch);
    for (const pair of pairs) {
      try {
        const refPixels = await sharp(pair.bwBuffer)
          .resize(64, 64, { fit: 'fill' })
          .raw()
          .toBuffer();

        // Simple MSE on downscaled images
        let mse = 0;
        for (let i = 0; i < refPixels.length; i++) {
          const diff = bwPixels[i] - refPixels[i];
          mse += diff * diff;
        }
        mse /= refPixels.length;

        if (mse < bestScore) {
          bestScore = mse;
          bestMatch = pair;
        }
      } catch { }
    }
  }

  // If we have a specific chapter/page hint, try fetching from web
  if (altChapter && altChapter > 6 && altPageNum) {
    const webPair = await fetchWebArchivePair(altChapter, altPageNum);
    if (webPair) {
      return { bwBuffer: webPair.bwBuffer, coloredBuffer: webPair.coloredBuffer };
    }
  }

  if (bestMatch) {
    return { bwBuffer: bestMatch.bwBuffer, coloredBuffer: bestMatch.coloredBuffer };
  }

  // Absolute fallback: use any colored page we can find
  for (let ch = 1; ch <= 6; ch++) {
    const pairs = scanChapter(ch);
    if (pairs.length > 0) {
      return { bwBuffer: pairs[0].bwBuffer, coloredBuffer: pairs[0].coloredBuffer };
    }
  }

  return null;
}

export function getAllAvailableChapters(): number[] {
  const chapters: number[] = [];
  for (let ch = 1; ch <= 6; ch++) {
    const bwDir = path.resolve(MANGA_BASE, BW_DIR_PREFIX, `Chapter ${ch}`);
    if (fs.existsSync(bwDir)) chapters.push(ch);
  }
  return chapters;
}
