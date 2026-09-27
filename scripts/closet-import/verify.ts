/**
 * Runs the closet screenshot import engine on the spike fixtures and compares the batch results with the expected ones.
 *
 * npm run closet-verify -- [--fixtures <spike dir>] [--grid]
 * --grid only prints grid detection per screenshot. Bundled with esbuild because skygame-data is ESM-only.
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { DateTime } from 'luxon';
import { IItem, SkyDataResolver } from 'skygame-data';
import { ItemHelper } from '../../src/app/helpers/item-helper';
import { RgbaImage } from '../../src/app/services/closet-import/image';
import { locateGrid, GridHint } from '../../src/app/services/closet-import/grid';
import { referenceFeatures } from '../../src/app/services/closet-import/icon';
import { buildReferenceSet, matchScreenshot } from '../../src/app/services/closet-import/matcher';
import { combineBatch, ScreenshotMatch } from '../../src/app/services/closet-import/batch';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const fixtures = args.includes('--fixtures') ? args[args.indexOf('--fixtures') + 1] : path.resolve(ROOT, '../SkyGame-Private/closet-import/spike');
// the expected results were generated for this date; the ongoing set depends on it
const DATE = DateTime.fromISO('2026-09-26T12:00:00', { zone: 'America/Los_Angeles' });

const CASES: Array<{ expected: string, type: string, shots: Array<string>, label?: string }> = [
  { expected: 'outfitshoes_pc', type: 'OutfitShoes', shots: ['shot_pc.png'] },
  { expected: 'outfit_mobile', type: 'Outfit', shots: ['shot_mobile.jpg'] },
  { expected: 'masks', type: 'Mask', shots: ['shot_masks.png'] },
  { expected: 'capes', type: 'Cape', shots: ['shot_capes.png'] },
  { expected: 'masks_stitched', type: 'Mask', shots: ['stitch_masks_a.png', 'stitch_masks_b.png'] },
  { expected: 'masks_stitched', type: 'Mask', shots: ['stitch_masks_b.png', 'stitch_masks_a.png'], label: 'masks_stitched_reversed' },
  { expected: 'masks_window', type: 'Mask', shots: ['shot_pc_window.jpg'] },
  // Wonderland Primrose Pinafore Dress sits alone between two sure matches and must not be weak
  { expected: 'outfit_primrose', type: 'Outfit', shots: ['shot_outfit_primrose.png'] }
];

async function decode(file: string): Promise<RgbaImage> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8Array(data.buffer, data.byteOffset, data.length) };
}

function loadData() {
  const text = fs.readFileSync(path.join(ROOT, 'node_modules/skygame-data/assets/everything.json'), 'utf8');
  return SkyDataResolver.resolve(SkyDataResolver.parse(text as any));
}

function describeGrid(label: string, img: RgbaImage, ms: number, grid: ReturnType<typeof locateGrid>): string {
  if (!grid) { return `${label.padEnd(24)} no grid (${ms.toFixed(0)} ms)`; }
  const I = [...new Set(grid.cells.map(c => c[0]))].sort((a, b) => a - b);
  const J = [...new Set(grid.cells.map(c => c[1]))].sort((a, b) => a - b);
  const view = grid.view.map((v, k) => v === [0, 0, img.width, img.height][k] ? '-' : v.toFixed(0)).join(' ');
  const shifted = Object.entries(grid.rowOffset).map(([j, dx]) => ` row ${j} shifted ${dx.toFixed(1)}`).join('');
  return `${label.padEnd(24)} pitch ${grid.px.toFixed(1)}x${grid.py.toFixed(1)} first ${(grid.ox + I[0] * grid.px).toFixed(0)},${(grid.oy + J[0] * grid.py).toFixed(0)} ` +
    `cells ${grid.cells.length} (${I.length}x${J.length}) view [${view}]${shifted} (${ms.toFixed(0)} ms)`;
}

async function gridOnly(): Promise<void> {
  const shots = [...new Set(CASES.flatMap(c => c.shots))];
  for (const shot of shots) {
    const img = await decode(path.join(fixtures, 'screenshots', shot));
    const t = performance.now();
    const grid = locateGrid(img);
    console.log(describeGrid(shot, img, performance.now() - t, grid));
  }
}

function diff(label: string, actual: Array<string>, expected: Array<string>): boolean {
  const a = new Set(actual), e = new Set(expected);
  const missing = expected.filter(x => !a.has(x)), extra = actual.filter(x => !e.has(x));
  if (!missing.length && !extra.length) { return true; }
  console.log(`    ${label}: missing ${JSON.stringify(missing)} extra ${JSON.stringify(extra)}`);
  return false;
}

async function main(): Promise<void> {
  if (args.includes('--grid')) { return gridOnly(); }

  const data = loadData();
  const icons = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/game/icons.json'), 'utf8')) as { files: Array<{ file: string, coordinates: Record<string, { x: number, y: number }> }> };
  const coords = new Map<string, { file: string, x: number, y: number }>();
  icons.files.forEach(f => Object.entries(f.coordinates).forEach(([k, c]) => coords.set(k, { file: f.file, ...c })));
  const sheets = new Map<string, RgbaImage>();
  const ongoing = ItemHelper.getOngoingItems({
    spiritConfig: data.spirits, seasonConfig: data.seasons, eventConfig: data.events,
    travelingSpiritConfig: data.travelingSpirits, returningSpiritsConfig: data.specialVisits
  } as any, DATE);

  let failed = 0, skipped = 0;
  for (const c of CASES) {
    const missing = c.shots.filter(s => !fs.existsSync(path.join(fixtures, 'screenshots', s)));
    if (missing.length) { console.log(`${c.label ?? c.expected}: skipped, missing ${missing.join(', ')}`); skipped++; continue; }
    const items = (data.items.items as Array<IItem>).filter(i => i.type === c.type && coords.has(i.icon!)).sort(ItemHelper.sorter);
    const t0 = performance.now();
    const feats = [];
    for (const item of items) {
      const co = coords.get(item.icon!)!;
      if (!sheets.has(co.file)) { sheets.set(co.file, await decode(path.join(ROOT, 'src/assets/game', co.file))); }
      feats.push(referenceFeatures(sheets.get(co.file)!, co.x, co.y)!);
    }
    const refs = buildReferenceSet(feats, items.map(i => !!ongoing[i.guid]));
    console.log(`${c.label ?? c.expected} (${c.type}, ${items.length} items): references ${(performance.now() - t0).toFixed(0)} ms`);

    const results: Array<ScreenshotMatch | null> = [];
    let hint: GridHint | undefined;
    for (const shot of c.shots) {
      const img = await decode(path.join(fixtures, 'screenshots', shot));
      const res = matchScreenshot(img, refs, hint);
      results.push(res);
      if (!res) { console.log(`  ${shot}: no grid`); continue; }
      hint = { px: res.grid.px, py: res.grid.py, ox: res.grid.ox };
      const matched = res.tiles.filter(t => t.item !== null).length;
      const forced = res.tiles.filter(t => t.forced).length;
      const relaxed = res.tiles.filter(t => t.relaxed);
      console.log(`  ${describeGrid(shot, img, res.timing.grid, res.grid)}`);
      console.log(`    ${res.tiles.length} tiles, ${matched} matched (${forced} forced, ${relaxed.length} relaxed), ${res.partial} partial, match ${res.timing.match.toFixed(0)} ms`);
      for (const t of relaxed) {
        const [r2, s2] = t.candidates.find(([r]) => r !== t.item) ?? [null, NaN];
        console.log(`    relaxed ${t.cell}: ${items[t.item!].name} ${t.score.toFixed(3)}, window ${t.window[1] - t.window[0]}, `
          + `runner-up ${r2 === null ? '-' : `${items[r2].name} ${s2.toFixed(3)}`}`);
      }
    }

    const batch = combineBatch(results, refs.ongoing);
    const name = (r: number) => items[r].name;
    const expected = JSON.parse(fs.readFileSync(path.join(fixtures, 'expected', `${c.expected}.json`), 'utf8'));
    const ok = [
      diff('owned', batch.owned.map(name), expected.owned),
      diff('checklist', batch.checklist.map(x => `${name(x.item)}=${x.looksOwned}`), expected.checklist.map(([n, g]: [string, boolean]) => `${n}=${g}`)),
      diff('ask', batch.ask.map(a => `${a.cell}`), expected.ask.map((a: any) => `${a.cell}`)),
      diff('gaps', batch.gaps.map(name), expected.gaps),
      diff('weak', batch.weak.map(name), expected.weak ?? [])
    ].every(Boolean);
    batch.ask.forEach(a => console.log(`    ask ${a.cell}: window ${a.window.length} -> ${a.candidates.map(name).join(', ')}`));
    console.log(`  ${ok ? 'OK' : 'MISMATCH'}`);
    if (!ok) { failed++; }
  }
  const ran = CASES.length - skipped;
  console.log((failed ? `${failed} of ${ran} cases differ` : `All ${ran} cases match`) + (skipped ? `, ${skipped} skipped` : ''));
  process.exitCode = failed ? 1 : 0;
}

main();
