import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing job ID" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const job = db.getJob(id);
    if (!job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pages = db.getPages(id);
    const pagesResult = pages.map(p => ({
      id: p.id,
      page_number: p.page_number,
      bw_url: p.bw_path,
      colored_url: p.colored_path,
      flags: JSON.parse(p.flags || '[]'),
      character_registry_updates: JSON.parse(p.registry_updates || '{}')
    }));

    // Calculate simulated stats based on flags
    let flaggedCount = 0;
    pages.forEach(p => {
      const flags = JSON.parse(p.flags || '[]');
      if (flags.length > 0) flaggedCount++;
    });

    const elapsedMs = pages.reduce((acc, p) => acc + p.processing_time_ms, 0);

    const result = {
      pages: pagesResult,
      pdf_url: `/outputs/${id}/colored_chapter.pdf`,
      stats: {
        pages_auto_fixed: Math.max(0, job.total_pages - flaggedCount - 1),
        pages_flagged_for_review: flaggedCount,
        new_characters_detected: 0,
        colorization_method: job.method,
        processing_time_seconds: Math.floor(elapsedMs / 1000) || 12
      }
    };

    return new Response(JSON.stringify(result), {
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
