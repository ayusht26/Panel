import type { APIRoute } from 'astro';
import { getSeriesDetail } from '../../../lib/weebcentral';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const detail = await getSeriesDetail(id);
    return new Response(JSON.stringify(detail), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Series detail error:', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch series' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
