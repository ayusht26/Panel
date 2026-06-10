import type { APIRoute } from 'astro';
import { getChapterPages } from '../../../lib/weebcentral';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const pages = await getChapterPages(id);
    return new Response(JSON.stringify(pages), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Chapter pages error:', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch chapter' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
