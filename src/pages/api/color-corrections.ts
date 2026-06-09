import type { APIRoute } from 'astro';
import { db, type ColorCorrection } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { page_id, character_id, region, original_color, corrected_color, apply_to_future } = body;

    if (!page_id || !character_id || !region || !corrected_color) {
      return new Response(JSON.stringify({ error: "Missing required correction fields" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const correctionId = 'corr_' + Math.random().toString(36).substring(2, 11);

    const newCorrection: ColorCorrection = {
      id: correctionId,
      page_id,
      character_id,
      region,
      original_color: original_color || '',
      corrected_color,
      apply_to_future: apply_to_future !== false,
      created_at: new Date().toISOString()
    };

    db.createColorCorrection(newCorrection);

    // If apply_to_future is selected, update the character registry as well!
    if (newCorrection.apply_to_future) {
      const registry = db.getCharacterRegistry();
      const character = registry.find(c => c.id === character_id);
      if (character) {
        const colorData = JSON.parse(character.color_data);
        // Map region name if it differs, e.g. vest -> vest_red or hair -> hair
        let keyToUpdate = region;
        
        // Find close key match
        const matchingKey = Object.keys(colorData).find(
          k => k === region || k.startsWith(region + '_') || k.endsWith('_' + region)
        );
        if (matchingKey) {
          keyToUpdate = matchingKey;
        }

        colorData[keyToUpdate] = corrected_color;
        db.updateCharacterColor(character_id, colorData);
      }
    }

    return new Response(JSON.stringify({ 
      message: "Color correction submitted successfully", 
      id: correctionId,
      applied_to_registry: newCorrection.apply_to_future
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
