/// <reference lib="webworker" />

import { RgbaImage } from './image';
import { IconFeatures, referenceFeatures } from './icon';
import { ReferenceSet, buildReferenceSet, matchScreenshot } from './matcher';
import { ClosetImportReference, ClosetImportRequest, ClosetImportResponse } from './messages';

let refs: ReferenceSet | undefined;

/** Pixel values as stored in the file: thresholds are absolute, so no colour management. */
async function decode(blob: Blob): Promise<RgbaImage> {
  const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function prepare(references: Array<ClosetImportReference>): Promise<number> {
  const sheets = new Map<string, Promise<RgbaImage>>();
  const load = (url: string) => {
    if (!sheets.has(url)) { sheets.set(url, fetch(url).then(r => r.blob()).then(decode)); }
    return sheets.get(url)!;
  };
  const features: Array<IconFeatures> = [];
  const ongoing: Array<boolean> = [];
  for (const ref of references) {
    const f = referenceFeatures(await load(ref.sheet), ref.x, ref.y);
    if (!f) { throw new Error(`Empty reference icon at ${ref.sheet} (${ref.x}, ${ref.y}).`); }
    features.push(f);
    ongoing.push(ref.ongoing);
  }
  refs = buildReferenceSet(features, ongoing);
  return refs.count;
}

addEventListener('message', async ({ data }: MessageEvent<ClosetImportRequest>) => {
  let response: ClosetImportResponse;
  try {
    if (data.kind === 'prepare') {
      response = { id: data.id, kind: 'prepared', count: await prepare(data.references) };
    } else {
      if (!refs) { throw new Error('Worker is not prepared.'); }
      response = { id: data.id, kind: 'processed', result: matchScreenshot(await decode(data.file), refs, data.hint) };
    }
  } catch (e) {
    response = { id: data.id, kind: 'error', message: e instanceof Error ? e.message : `${e}` };
  }
  postMessage(response);
});
