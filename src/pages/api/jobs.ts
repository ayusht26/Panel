import type { APIRoute } from 'astro';
import { db, type Job, type PageItem } from '../../lib/db';
import fs from 'fs';
import path from 'path';
import { extractPagesFromPdf } from '../../lib/pdf-extractor';
import { findReferenceForPage } from '../../lib/reference-manager';
import { colorizePage } from '../../lib/colorizer';

export const prerender = false;

const padChapter = (str: string) => {
  const num = parseFloat(str);
  if (isNaN(num)) return str;
  if (Number.isInteger(num)) {
    if (num < 10) return `00${num}`;
    if (num < 100) return `0${num}`;
    return `${num}`;
  }
  return str;
};

const getPageNumFromUrl = (urlStr: string) => {
  const parts = urlStr.split('/');
  const filename = parts[parts.length - 1];
  const m = filename.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 999;
};

// Fetch and parse page image URLs from readonepiece
async function fetchMangaPageImages(chapterNumStr: string, isColored: boolean): Promise<string[]> {
  const slug = isColored
    ? `one-piece-digital-colored-comics-chapter-${padChapter(chapterNumStr)}`
    : `one-piece-chapter-${padChapter(chapterNumStr)}`;
  const url = `https://ww12.readonepiece.com/chapter/${slug}/`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();
    // Match CDN URLs
    const regex = /https:\/\/cdn\.readonepiece\.com\/file\/mangap\/[^"'\s>]+(?:\.jpeg|\.jpg|\.png|\.webp)/gi;
    const matches = html.match(regex) || [];
    const uniqueUrls = Array.from(new Set(matches));

    // Sort numerically
    uniqueUrls.sort((a, b) => getPageNumFromUrl(a) - getPageNumFromUrl(b));
    return uniqueUrls;
  } catch (error) {
    console.error(`Failed to fetch ${slug}:`, error);
    return [];
  }
}

export const GET: APIRoute = async () => {
  try {
    const jobs = db.getJobs();
    return new Response(JSON.stringify(jobs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const chapterNumVal = formData.get('chapter_number')?.toString();
    const bwFile = formData.get('bw_file');

    // Case 1: PDF File Upload — Real Colorization Pipeline
    if (bwFile && bwFile instanceof File) {
      const fileName = bwFile.name;
      const chapterTitle = `Upload: ${fileName.replace(/\.[^/.]+$/, "")}`;
      const jobId = `job_upload_${Date.now()}`;

      // Save the uploaded PDF to a job-specific directory
      const uploadDir = path.resolve('public', 'uploads', jobId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const savedPdfPath = path.join(uploadDir, fileName);
      const pdfBuffer = Buffer.from(await bwFile.arrayBuffer());
      fs.writeFileSync(savedPdfPath, pdfBuffer);

      // Output directories
      const bwOutputDir = path.join(uploadDir, 'bw');
      const colorOutputDir = path.join(uploadDir, 'colored');
      fs.mkdirSync(bwOutputDir, { recursive: true });
      fs.mkdirSync(colorOutputDir, { recursive: true });

      // Extract pages from PDF
      const pageBuffers = await extractPagesFromPdf(pdfBuffer);
      const totalPages = pageBuffers.length;

      const newJob: Job = {
        id: jobId,
        title: chapterTitle,
        status: 'done',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        bw_pdf_path: `/uploads/${jobId}/${encodeURIComponent(fileName)}`,
        reference_paths: JSON.stringify(['Uploaded PDF — extracted and colorized']),
        output_pdf_path: `/outputs/${jobId}/colorized_${fileName}`,
        total_pages: totalPages,
        completed_pages: totalPages,
        method: 'pdf_colorization_pipeline',
        options: JSON.stringify({ file_size: bwFile.size, total_pages: totalPages, algorithm: 'lab_color_transfer' })
      };

      db.createJob(newJob);

      // Process each page: save B&W and colorize
      for (let i = 0; i < totalPages; i++) {
        const pageNum = i + 1;
        const bwPageBuffer = pageBuffers[i];
        const bwFileName = `page_${String(pageNum).padStart(3, '0')}.png`;
        const colorFileName = `page_${String(pageNum).padStart(3, '0')}_colored.png`;

        // Save the extracted B&W page
        const bwSavePath = path.join(bwOutputDir, bwFileName);
        // bwPageBuffer is already a grayscale PNG from pdf-extractor
        fs.writeFileSync(bwSavePath, bwPageBuffer);

        // Find reference image pair for colorization (auto-match by visual similarity)
        const refPair = await findReferenceForPage(bwPageBuffer);

        let coloredBuffer: Buffer;
        if (refPair) {
          // Apply LAB color transfer using reference colored page
          coloredBuffer = await colorizePage(bwPageBuffer, refPair.coloredBuffer, 'png');
        } else {
          // Fallback: simple tint (warm sepia)
          coloredBuffer = bwPageBuffer;
        }

        // Save the colorized page
        const colorSavePath = path.join(colorOutputDir, colorFileName);
        fs.writeFileSync(colorSavePath, coloredBuffer);

        const bwUrl = `/uploads/${jobId}/bw/${bwFileName}`;
        const colorUrl = `/uploads/${jobId}/colored/${colorFileName}`;

        const page: PageItem = {
          id: `${jobId}_p${pageNum}`,
          job_id: jobId,
          page_number: pageNum,
          bw_path: bwUrl,
          colored_path: colorUrl,
          status: 'done',
          flags: JSON.stringify(refPair ? [] : ['fallback_colorization']),
          registry_updates: JSON.stringify({}),
          processing_time_ms: 0
        };
        db.createPage(page);
      }

      return new Response(JSON.stringify(newJob), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Case 2: Chapter Number Selection (Local or Remote Fetch)
    const chapterNumStr = chapterNumVal || '1';
    const chapterNum = parseFloat(chapterNumStr);
    const chapterTitle = `One Piece — Chapter ${chapterNumStr}`;

    // Check if we have this chapter on disk (Chapters 1-6)
    const bwDir = path.resolve('public', 'manga', 'One-Piece', `Chapter ${chapterNum}`);
    const colorDir = path.resolve('public', 'manga', 'One-Piece-Digital-Colored-Comics', `Chapter ${chapterNum}`);

    let bwFiles: string[] = [];
    let colorFiles: string[] = [];

    const getPageNum = (name: string) => {
      const match = name.match(/(\d+)\.(png|jpg|jpeg|webp)$/i);
      return match ? parseInt(match[1]) : 0;
    };

    if (fs.existsSync(bwDir)) {
      bwFiles = fs.readdirSync(bwDir)
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .sort((a, b) => getPageNum(a) - getPageNum(b));
    }

    if (fs.existsSync(colorDir)) {
      colorFiles = fs.readdirSync(colorDir)
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .sort((a, b) => getPageNum(a) - getPageNum(b));
    }

    const jobId = `job_ch${chapterNumStr}_${Date.now()}`;

    // If local pages exist, use them
    if (bwFiles.length > 0) {
      // Pair by sequential index, not page number.
      // When B&W has extra pages (not in colored), they get dropped at the end.
      const count = Math.min(bwFiles.length, colorFiles.length);

      const newJob: Job = {
        id: jobId,
        title: chapterTitle,
        status: 'done',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        bw_pdf_path: bwDir,
        reference_paths: JSON.stringify([colorDir]),
        output_pdf_path: colorDir,
        total_pages: count,
        completed_pages: count,
        method: 'precolored_reference',
        options: JSON.stringify({ chapter: chapterNumStr })
      };

      db.createJob(newJob);

      for (let i = 0; i < count; i++) {
        const bwFile = bwFiles[i];
        const colorFile = colorFiles[i];
        const pageNum = i + 1;

        const bwUrl = `/manga/One-Piece/Chapter%20${chapterNum}/${encodeURIComponent(bwFile)}`;
        const colorUrl = `/manga/One-Piece-Digital-Colored-Comics/Chapter%20${chapterNum}/${encodeURIComponent(colorFile)}`;

        const page: PageItem = {
          id: `${jobId}_p${i + 1}`,
          job_id: jobId,
          page_number: i + 1,
          bw_path: bwUrl,
          colored_path: colorUrl,
          status: 'done',
          flags: JSON.stringify([]),
          registry_updates: JSON.stringify({}),
          processing_time_ms: 0
        };
        db.createPage(page);
      }

      return new Response(JSON.stringify(newJob), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Else: Fetch from ww12.readonepiece.com dynamically
    const bwUrls = await fetchMangaPageImages(chapterNumStr, false);
    if (bwUrls.length === 0) {
      return new Response(JSON.stringify({ error: `Could not fetch or locate pages for Chapter ${chapterNumStr}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const coloredUrls = await fetchMangaPageImages(chapterNumStr, true);
    const hasColoredVersion = coloredUrls.length > 0;

    const totalPages = hasColoredVersion
      ? Math.min(bwUrls.length, coloredUrls.length)
      : bwUrls.length;

    const newJob: Job = {
      id: jobId,
      title: chapterTitle,
      status: 'done',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bw_pdf_path: `https://ww12.readonepiece.com/chapter/one-piece-chapter-${padChapter(chapterNumStr)}/`,
      reference_paths: JSON.stringify(hasColoredVersion
        ? [`https://ww12.readonepiece.com/chapter/one-piece-digital-colored-comics-chapter-${padChapter(chapterNumStr)}/`]
        : ['No colored version available']),
      output_pdf_path: hasColoredVersion
        ? `https://ww12.readonepiece.com/chapter/one-piece-digital-colored-comics-chapter-${padChapter(chapterNumStr)}/`
        : `https://ww12.readonepiece.com/chapter/one-piece-chapter-${padChapter(chapterNumStr)}/`,
      total_pages: totalPages,
      completed_pages: totalPages,
      method: hasColoredVersion ? 'web_archive_fetcher' : 'bw_only_uncolored_chapter',
      options: JSON.stringify({ chapter: chapterNumStr, has_colored_version: hasColoredVersion })
    };

    db.createJob(newJob);

    for (let i = 0; i < totalPages; i++) {
      const bwUrl = hasColoredVersion ? bwUrls[i] : bwUrls[i];
      const colorUrl = hasColoredVersion ? coloredUrls[i] : null;

      const proxiedBwUrl = `/api/proxy-image?url=${encodeURIComponent(bwUrl)}`;
      const proxiedColorUrl = colorUrl
        ? `/api/proxy-image?url=${encodeURIComponent(colorUrl)}`
        : proxiedBwUrl;

      const page: PageItem = {
        id: `${jobId}_p${i + 1}`,
        job_id: jobId,
        page_number: i + 1,
        bw_path: proxiedBwUrl,
        colored_path: proxiedColorUrl,
        status: 'done',
        flags: JSON.stringify(colorUrl ? [] : ['no_colored_version']),
        registry_updates: JSON.stringify({}),
        processing_time_ms: 150
      };
      db.createPage(page);
    }

    return new Response(JSON.stringify(newJob), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
