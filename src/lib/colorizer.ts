import sharp from 'sharp';

/**
 * LAB Color Transfer from reference colored image to B&W input image.
 *
 * Algorithm:
 * 1. Both images are analyzed in LAB space
 * 2. Reference colored image provides A* (green-red) and B* (blue-yellow) statistics
 * 3. Input B&W image's luminance (L*) is preserved
 * 4. For each luminance level in the input, A/B values are mapped from reference
 * 5. Pure black line art (< threshold) is preserved as black
 * 6. Pure white paper (> threshold) is preserved as lightly tinted
 */

interface LAB {
  L: number;
  A: number;
  B: number;
}

function rgbToLab(r: number, g: number, b: number): LAB {
  // Convert sRGB to linear RGB
  let rr = r / 255;
  let gg = g / 255;
  let bb = b / 255;

  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

  // Linear RGB to XYZ (D65)
  const x = 0.4124564 * rr + 0.3575761 * gg + 0.1804375 * bb;
  const y = 0.2126729 * rr + 0.7151522 * gg + 0.0721750 * bb;
  const z = 0.0193339 * rr + 0.1191920 * gg + 0.9503041 * bb;

  // XYZ to Lab (D65 reference: Xn=0.95047, Yn=1.0, Zn=1.08883)
  const fx = x / 0.95047;
  const fy = y / 1.0;
  const fz = z / 1.08883;

  const fx2 = fx > 0.008856 ? Math.cbrt(fx) : (7.787 * fx + 16 / 116);
  const fy2 = fy > 0.008856 ? Math.cbrt(fy) : (7.787 * fy + 16 / 116);
  const fz2 = fz > 0.008856 ? Math.cbrt(fz) : (7.787 * fz + 16 / 116);

  return {
    L: (116 * fy2) - 16,
    A: 500 * (fx2 - fy2),
    B: 200 * (fy2 - fz2),
  };
}

function labToRgb(lab: LAB): [number, number, number] {
  const fy = (lab.L + 16) / 116;
  const fx = lab.A / 500 + fy;
  const fz = fy - lab.B / 200;

  const x = 0.95047 * (fx > 0.206897 ? fx * fx * fx : (fx - 16 / 116) / 7.787);
  const y = 1.0 * (fy > 0.206897 ? fy * fy * fy : (fy - 16 / 116) / 7.787);
  const z = 1.08883 * (fz > 0.206897 ? fz * fz * fz : (fz - 16 / 116) / 7.787);

  // XYZ to linear RGB
  let rr = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  let gg = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  let bb = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  // Linear RGB to sRGB
  rr = rr > 0.0031308 ? 1.055 * Math.pow(rr, 1 / 2.4) - 0.055 : 12.92 * rr;
  gg = gg > 0.0031308 ? 1.055 * Math.pow(gg, 1 / 2.4) - 0.055 : 12.92 * gg;
  bb = bb > 0.0031308 ? 1.055 * Math.pow(bb, 1 / 2.4) - 0.055 : 12.92 * bb;

  return [
    Math.max(0, Math.min(255, Math.round(rr * 255))),
    Math.max(0, Math.min(255, Math.round(gg * 255))),
    Math.max(0, Math.min(255, Math.round(bb * 255))),
  ];
}

/**
 * Build a luminance-to-AB lookup table from the reference colored image.
 * For each L* value (0-255), we compute the median A* and B* from the reference.
 */
function buildLutFromReference(refRgb: Buffer, width: number, height: number): { lutA: Float64Array; lutB: Float64Array; count: Float64Array } {
  const lutA = new Float64Array(256);
  const lutB = new Float64Array(256);
  const count = new Float64Array(256);

  // Accumulate
  for (let i = 0; i < width * height; i++) {
    const idx = i * 3;
    const r = refRgb[idx];
    const g = refRgb[idx + 1];
    const b = refRgb[idx + 2];

    // Skip pure black (line art) and pure white
    if (r < 15 && g < 15 && b < 15) continue;
    if (r > 240 && g > 240 && b > 240) continue;

    const lab = rgbToLab(r, g, b);
    const lIdx = Math.max(0, Math.min(255, Math.round(lab.L)));
    lutA[lIdx] += lab.A;
    lutB[lIdx] += lab.B;
    count[lIdx]++;
  }

  // Average
  for (let i = 0; i < 256; i++) {
    if (count[i] > 0) {
      lutA[i] /= count[i];
      lutB[i] /= count[i];
    }
  }

  // Fill gaps by interpolation
  for (let i = 1; i < 255; i++) {
    if (count[i] === 0) {
      let left = i - 1;
      let right = i + 1;
      while (left >= 0 && count[left] === 0) left--;
      while (right < 256 && count[right] === 0) right++;
      if (left >= 0 && right < 256) {
        const t = (i - left) / (right - left);
        lutA[i] = lutA[left] + t * (lutA[right] - lutA[left]);
        lutB[i] = lutB[left] + t * (lutB[right] - lutB[left]);
      } else if (left >= 0) {
        lutA[i] = lutA[left];
        lutB[i] = lutB[left];
      } else if (right < 256) {
        lutA[i] = lutA[right];
        lutB[i] = lutB[right];
      }
    }
  }

  return { lutA, lutB, count };
}

/**
 * Apply LAB color transfer from reference colored image to B&W input image.
 */
export async function colorizePage(
  bwInputBuffer: Buffer,
  refColoredBuffer: Buffer,
  outputFormat: 'png' | 'jpeg' = 'png'
): Promise<Buffer> {
  // Get reference pixel data
  const refRgb = await sharp(refColoredBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer();
  const refMeta = await sharp(refColoredBuffer).metadata();
  const refW = refMeta.width!;
  const refH = refMeta.height!;

  // Get BW input data
  const bwRgb = await sharp(bwInputBuffer)
    .resize(refW, refH, { fit: 'fill', kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer();
  const bwMeta = await sharp(bwInputBuffer).metadata();

  // Build LUT from reference
  const { lutA, lutB } = buildLutFromReference(refRgb, refW, refH);

  // Create output pixel buffer
  const outputPixels = Buffer.alloc(refW * refH * 3);

  for (let i = 0; i < refW * refH; i++) {
    const idx = i * 3;
    const g = bwRgb[idx]; // grayscale value (since input is B&W)

    // Preserve line art (very dark pixels stay black)
    if (g < 20) {
      outputPixels[idx] = g;
      outputPixels[idx + 1] = g;
      outputPixels[idx + 2] = g;
      continue;
    }

    // Preserve near-white (paper stays white/lightly tinted)
    if (g > 240) {
      const tint = 0.85; // subtle tint for paper
      const lab = rgbToLab(245, 245, 245); // warm off-white reference
      const [cr, cg, cb] = labToRgb(lab);
      outputPixels[idx] = Math.round(255 - (255 - cr) * (1 - tint));
      outputPixels[idx + 1] = Math.round(255 - (255 - cg) * (1 - tint));
      outputPixels[idx + 2] = Math.round(255 - (255 - cb) * (1 - tint));
      continue;
    }

    // For grayscale input, L* ≈ gray value
    const lIdx = Math.max(0, Math.min(255, Math.round(g * 100 / 255)));

    const aVal = lutA[lIdx];
    const bVal = lutB[lIdx];

    // Convert to LAB using the input's luminance and reference's AB
    const [r, gb, bb] = labToRgb({ L: g * 100 / 255, A: aVal, B: bVal });

    outputPixels[idx] = r;
    outputPixels[idx + 1] = gb;
    outputPixels[idx + 2] = bb;
  }

  // Write output image
  const outputBuffer = await sharp(outputPixels, {
    raw: { width: refW, height: refH, channels: 3 }
  })
    .toFormat(outputFormat === 'png' ? 'png' : 'jpeg', {
      quality: 95,
    })
    .toBuffer();

  return outputBuffer;
}
