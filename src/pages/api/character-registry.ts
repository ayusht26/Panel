import type { APIRoute } from 'astro';
import { db } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const registry = db.getCharacterRegistry();
    const formatted = registry.map(c => ({
      id: c.id,
      character_name: c.character_name,
      manga_series: c.manga_series,
      color_data: JSON.parse(c.color_data),
      is_canon: Boolean(c.is_canon),
      updated_at: c.updated_at
    }));

    return new Response(JSON.stringify(formatted), {
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
    const body = await request.json();
    const { id, colors } = body;

    if (!id || !colors) {
      return new Response(JSON.stringify({ error: "Missing character ID or color data" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    db.updateCharacterColor(id, colors);

    return new Response(JSON.stringify({ message: "Character registry updated successfully", id }), {
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
