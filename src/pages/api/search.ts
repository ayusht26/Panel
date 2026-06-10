import type { APIRoute } from 'astro';
import { searchSeries } from '../../lib/weebcentral';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  if (!q.trim()) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const results = await searchSeries(q);
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Search error:', e);
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
