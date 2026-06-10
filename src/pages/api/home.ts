import type { APIRoute } from 'astro';
import { getHomepage } from '../../lib/weebcentral';

export const GET: APIRoute = async () => {
  try {
    const data = await getHomepage();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Homepage error:', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch homepage' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
