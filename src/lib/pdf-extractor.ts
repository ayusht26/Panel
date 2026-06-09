import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import sharp from 'sharp';

export async function extractPagesFromPdf(pdfBuffer: Buffer): Promise<Buffer[]> {
  const data = new Uint8Array(pdfBuffer);
  const doc = await getDocument({ data }).promise;

  const pages: Buffer[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    const pngBuffer = canvas.toBuffer('image/png');
    // Convert to grayscale (ensure it's B&W)
    const grayBuffer = await sharp(pngBuffer)
      .grayscale()
      .png()
      .toBuffer();

    pages.push(grayBuffer);
  }

  return pages;
}
