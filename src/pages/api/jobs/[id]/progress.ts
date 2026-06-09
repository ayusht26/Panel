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

    // If job is already marked as done or error, return as-is
    if (job.status === 'done' || job.status === 'error') {
      return new Response(JSON.stringify({
        status: job.status,
        pages_total: job.total_pages,
        pages_done: job.completed_pages,
        current_page: job.completed_pages,
        estimated_seconds_remaining: 0,
        preview_url: ``
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Simulate progress based on time elapsed since job creation
    const createdTime = new Date(job.created_at).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - createdTime) / 1000);

    const SECONDS_PER_PAGE = 4;
    const totalPages = job.total_pages;
    let completedPages = Math.floor(elapsedSeconds / SECONDS_PER_PAGE);
    
    if (completedPages > totalPages) {
      completedPages = totalPages;
    }

    let status = 'processing';
    let subStatus = 'colorizing';

    if (completedPages === 0) {
      status = 'processing';
      subStatus = 'extracting';
    } else if (completedPages === 1) {
      status = 'processing';
      subStatus = 'segmenting';
    } else if (completedPages === 2) {
      status = 'processing';
      subStatus = 'colorizing';
    } else if (completedPages === 3) {
      status = 'processing';
      subStatus = 'consistency_pass';
    } else if (completedPages === 4) {
      status = 'processing';
      subStatus = 'exporting';
    } else {
      status = 'done';
      subStatus = 'done';
    }

    // Update job page status in DB
    const jobUpdates: any = {
      completed_pages: completedPages,
      status: status
    };
    db.updateJob(id, jobUpdates);

    // Update individual pages status in DB to match
    const pages = db.getPages(id);
    for (const page of pages) {
      if (page.page_number <= completedPages) {
        if (page.status !== 'done') {
          db.updatePage(page.id, { 
            status: 'done',
            processing_time_ms: Math.floor(Math.random() * 1000) + 1500
          });
        }
      } else if (page.page_number === completedPages + 1) {
        db.updatePage(page.id, { status: subStatus });
      } else {
        db.updatePage(page.id, { status: 'pending' });
      }
    }

    const remainingTime = Math.max((totalPages * SECONDS_PER_PAGE) - elapsedSeconds, 0);
    const activePage = Math.min(completedPages + 1, totalPages);
    
    // Choose latest completed page preview
    let previewUrl = '';
    if (completedPages >= 1) {
      previewUrl = '';
    }

    return new Response(JSON.stringify({
      status: subStatus,
      pages_total: totalPages,
      pages_done: completedPages,
      current_page: activePage,
      estimated_seconds_remaining: remainingTime,
      preview_url: previewUrl
    }), {
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
