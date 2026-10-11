import { IItem, ItemType } from 'skygame-data';
import { DYE_COLORS, DyeColor, IDye } from '@app/interfaces/dye.interface';
import { ISquareLayout, SQUARE_PLACEHOLDER_ALPHA, SQUARE_SLOTS, SQUARE_UNKNOWN_ALPHA, squareLayout } from './closet-renderer';

export interface ClosetSquareReaderOptions {
  items: Partial<Record<string, IItem[]>>;
  itemMap: Record<string, IItem>;
  imgSheets: Record<string, HTMLImageElement>;
  iconLookup: (icon: string) => { file: string; x: number; y: number } | undefined;
  imgNone: HTMLImageElement;
  imgUnknown: HTMLImageElement;
  svgDyes: Record<string, SVGElement>;
  /** CSS colours of the dye droplets, as the renderer reads them. */
  dyeColors: Record<string, string>;
}

export interface ISquareSlot {
  label: string;
  /** Undefined when the slot shows the question mark. */
  item?: IItem;
  dyes?: IDye[];
  /** False when another candidate came close or nothing fit well. */
  sure: boolean;
}

const SLOT_LABELS = [
  'Outfit', 'Shoes', 'Mask', 'Face accessory', 'Necklace',
  'Hair', 'Hair accessory', 'Head accessory', 'Cape', 'Prop'
];

/** Icons are compared at half the rendered size. */
const N = 32;
/** Atlas pitch at render size; the spare pixels keep the downscale from bleeding between icons. */
const CELL = 66;
/** Sub-pixel offsets (in N-grid pixels) tried for the closest candidates. */
const SHIFTS = [-1, -0.5, 0, 0.5, 1];
const SHORTLIST = 8;
/** Sub-pixel offsets (in render pixels) tried for each dye droplet. */
const DYE_SHIFTS = [-0.5, 0, 0.5];

/** RMS colour error (0–255) above which a slot is a guess. */
const FIT_MAX = 20;
/** A slot is a guess when the runner-up is this close. */
const MARGIN_MIN = 2.5;
/** Median slot error above which the image is not a one-fit render. */
const FAIL_MEDIAN = 24;
/** Accepted deviation of the aspect ratio from an unscaled, uncropped render. */
const ASPECT_TOLERANCE = 0.02;

interface IPlacement {
  x0: number;
  y0: number;
  sx: number;
  sy: number;
  dyeRows: number;
}

interface IRef {
  /** Alpha 0–1, N×N. */
  a: Float32Array;
  /** Unpremultiplied RGB 0–255, N×N×3. */
  c: Float32Array;
}

type Candidate =
  | { kind: 'item'; item: IItem; ref: IRef }
  | { kind: 'none'; item: IItem }
  | { kind: 'unknown' }
  | { kind: 'empty'; item?: IItem };

interface IPatch {
  /** Observed RGB, N×N×3. */
  o: Float32Array;
  /** Estimated panel background behind it, N×N×3. */
  b: Float32Array;
}

interface IPlane { r: number[]; g: number[]; b: number[] }

interface IDyeMasks { fill: Float32Array; stroke: Float32Array }

/**
 * Reads the "one fit" image of the outfit request pages back into items.
 *
 * The layout and the icons that can appear in each slot are fixed by
 * {@link ClosetRenderer.renderSquare}, so every slot is compared against
 * the renders of only its own candidates: the items of its types, the
 * "None" cross and the question mark, each composited over that slot's
 * panel background the way the renderer draws them.
 */
export class ClosetSquareReader {
  private _refs?: Promise<Map<string, IRef>>;
  private _dyeMasks?: Record<string, IDyeMasks>;
  private _dyeRgb?: Record<string, number[]>;

  constructor(private readonly _opts: ClosetSquareReaderOptions) {}

  /** Resolves to the ten slots, or undefined when the image is not a one-fit render. */
  async read(file: Blob): Promise<ISquareSlot[] | undefined> {
    const refs = await this._loadRefs();
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const direct = placeFromAspect(img.width, img.height);
    const slots = direct && this._readSlots(canvas, img, direct, refs);
    if (slots) { return slots; }
    for (const placement of locate(img)) {
      const found = this._readSlots(canvas, img, placement, refs);
      if (found) { return found; }
    }
    return undefined;
  }

  // #region Slots

  private _readSlots(canvas: HTMLCanvasElement, img: ImageData, at: IPlacement, refs: Map<string, IRef>): ISquareSlot[] | undefined {
    const layout = squareLayout(at.dyeRows);
    const sampler = new PatchSampler(canvas);
    const results = SQUARE_SLOTS.map((slot, i) => {
      const plane = fitPlane(img, at, layout, i);
      const candidates = this._candidates(slot.types, refs);
      const ghost = refs.get(this._opts.itemMap[slot.placeholder]?.icon ?? '');
      const icon = layout.icon(i);
      const patchAt = (dx: number, dy: number) => sampler.patch(at, icon.x, icon.y, layout.item, N, dx, dy, plane);

      const base = patchAt(0, 0);
      const scored = candidates
        .map(candidate => ({ candidate, error: score(base, candidate, ghost, refs), dx: 0, dy: 0 }))
        .sort((a, b) => a.error - b.error)
        .slice(0, SHORTLIST);

      const shifted = SHIFTS.flatMap(dy => SHIFTS.map(dx => ({ dx, dy, patch: (dx || dy) ? patchAt(dx, dy) : base })));
      for (const entry of scored) {
        for (const { dx, dy, patch } of shifted) {
          const error = score(patch, entry.candidate, ghost, refs);
          if (error < entry.error) { Object.assign(entry, { error, dx, dy }); }
        }
      }
      scored.sort((a, b) => a.error - b.error);
      const drawn = scored.find(entry => entry.candidate.kind !== 'empty');
      return { best: scored[0], runnerUp: scored[1], drawn: drawn?.error ?? Infinity };
    });

    // A blank card fits any flat area, so it can't vouch for the placement.
    const errors = results.map(r => r.drawn).sort((a, b) => a - b);
    if (errors[Math.floor(errors.length / 2)] > FAIL_MEDIAN) { return undefined; }

    return results.map(({ best, runnerUp }, i) => {
      const candidate = best.candidate;
      const item = candidate.kind === 'unknown' ? undefined : candidate.item;
      const sure = candidate.kind !== 'empty'
        && best.error <= FIT_MAX
        && (!runnerUp || runnerUp.error - best.error >= MARGIN_MIN);
      // The droplets sit in the same card, so they share the icon's offset.
      const offset = { x: best.dx * layout.item / N, y: best.dy * layout.item / N };
      const dyes = item ? this._readDyes(canvas, img, at, layout, i, item, offset) : undefined;
      return { label: SLOT_LABELS[i], item, dyes, sure };
    });
  }

  private _candidates(types: ItemType[], refs: Map<string, IRef>): Candidate[] {
    const candidates: Candidate[] = [{ kind: 'unknown' }];
    const seen = new Set<string>();
    let none: IItem | undefined;
    for (const type of types) {
      for (const item of this._opts.items[type as string] ?? []) {
        if (item.name === 'None' && item.icon === 'assets/icons/none.webp') {
          none ??= item;
          continue;
        }
        const ref = item.icon ? refs.get(item.icon) : undefined;
        // Items sharing an icon can't be told apart; the first in closet order wins.
        if (!ref || seen.has(item.icon!)) { continue; }
        seen.add(item.icon!);
        candidates.push({ kind: 'item', item, ref });
      }
    }
    if (none) { candidates.push({ kind: 'none', item: none }); }
    // The renderer leaves the card blank for "None" when its closet tile isn't on the page.
    candidates.push({ kind: 'empty', item: none });
    return candidates;
  }

  // #endregion

  // #region Dyes

  private _readDyes(
    canvas: HTMLCanvasElement, img: ImageData, at: IPlacement, layout: ISquareLayout,
    slot: number, item: IItem, offset: { x: number; y: number }
  ): IDye[] | undefined {
    if (!item.dye?.primary || !at.dyeRows) { return undefined; }
    const rows = item.dye.secondary ? Math.min(2, at.dyeRows) : 1;
    const masks = this._loadDyeMasks();
    const rgb = this._loadDyeRgb();
    const sampler = new PatchSampler(canvas);
    const plane = fitPlane(img, at, layout, slot);
    const icon = layout.icon(slot);

    // First no droplet at all, then the empty "no dye" droplet, then the colours.
    const options: Array<{ dye?: DyeColor; layers: DyeLayer[] }> = [
      { layers: [] },
      { layers: [[masks['none']?.fill, [255, 255, 255], 0.12], [masks['none']?.stroke, [255, 255, 255], 0.55]] }
    ];
    for (const dye of DYE_COLORS) {
      const m = masks[dye];
      if (!m || !rgb[dye]) { continue; }
      const layers: DyeLayer[] = [[m.fill, rgb[dye], 1]];
      if (dye === 'black') { layers.push([m.stroke, [255, 255, 255], 0.9]); }
      options.push({ dye, layers });
    }

    // Black barely differs from the panel apart from its thin outline, which needs exact alignment.
    const errorsAt = (x: number, y: number): number[] => {
      const patches = DYE_SHIFTS.flatMap(dy => DYE_SHIFTS.map(dx =>
        sampler.patch(at, x + offset.x, y + offset.y, layout.dye, layout.dye, dx, dy, plane)));
      return options.map(option => Math.min(...patches.map(patch => dyeError(patch, option.layers))));
    };
    const bestDrawn = (errors: number[]) => {
      let best = 1;
      for (let i = 2; i < errors.length; i++) { if (errors[i] < errors[best]) { best = i; } }
      return best;
    };

    const dyes: IDye[] = [];
    for (let row = 0; row < rows; row++) {
      const y = icon.y + layout.item + layout.dye * row;
      const left = errorsAt(icon.x + layout.dyeX[0], y);
      const right = errorsAt(icon.x + layout.dyeX[1], y);
      // A row's droplets are drawn together, so only both can be missing; then the item was shared without this dye slot.
      const l = bestDrawn(left), r = bestDrawn(right);
      if (left[0] + right[0] < left[l] + right[r]) { break; }
      dyes.push({ primary: options[l].dye, secondary: options[r].dye });
    }
    return dyes.some(d => d.primary || d.secondary) ? dyes : undefined;
  }

  private _loadDyeMasks(): Record<string, IDyeMasks> {
    if (this._dyeMasks) { return this._dyeMasks; }
    const size = squareLayout(0).dye;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const alphaOf = (draw: (path: Path2D) => void, path: Path2D) => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.scale(size / 300, size / 300);
      ctx.fillStyle = ctx.strokeStyle = '#fff';
      ctx.lineWidth = 10;
      draw(path);
      ctx.restore();
      const data = ctx.getImageData(0, 0, size, size).data;
      const alpha = new Float32Array(size * size);
      for (let i = 0; i < alpha.length; i++) { alpha[i] = data[i * 4 + 3] / 255; }
      return alpha;
    };

    const masks: Record<string, IDyeMasks> = {};
    for (const dye of ['none', ...DYE_COLORS]) {
      const d = this._opts.svgDyes[dye]?.querySelector('path')?.getAttribute('d');
      if (!d) { continue; }
      const path = new Path2D(d);
      masks[dye] = { fill: alphaOf(p => ctx.fill(p), path), stroke: alphaOf(p => ctx.stroke(p), path) };
    }
    // The dye icons load asynchronously; keep asking until all of them are in.
    if (Object.keys(masks).length > DYE_COLORS.length) { this._dyeMasks = masks; }
    return masks;
  }

  private _loadDyeRgb(): Record<string, number[]> {
    if (this._dyeRgb) { return this._dyeRgb; }
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    const rgb: Record<string, number[]> = {};
    for (const dye of DYE_COLORS) {
      const color = this._opts.dyeColors[dye];
      if (!color) { continue; }
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      rgb[dye] = [r, g, b];
    }
    return this._dyeRgb = rgb;
  }

  // #endregion

  // #region References

  /** Renders every candidate icon once, the way the renderer draws it, then halves it to N. */
  private _loadRefs(): Promise<Map<string, IRef>> {
    return this._refs ??= this._buildRefs().catch(e => {
      this._refs = undefined;
      throw e;
    });
  }

  private async _buildRefs(): Promise<Map<string, IRef>> {
    const { items, iconLookup, imgSheets, imgNone, imgUnknown } = this._opts;
    const sources = new Map<string, (ctx: CanvasRenderingContext2D, x: number, y: number) => void>();
    const size = squareLayout(0).item;

    for (const slot of SQUARE_SLOTS) {
      for (const type of slot.types) {
        for (const item of items[type as string] ?? []) {
          if (!item.icon || sources.has(item.icon)) { continue; }
          const icon = iconLookup(item.icon);
          const sheet = icon && imgSheets[icon.file];
          if (!icon || !sheet) { continue; }
          sources.set(item.icon, (ctx, x, y) => ctx.drawImage(sheet, icon.x, icon.y, 128, 128, x, y, size, size));
        }
      }
    }
    sources.set(NONE_KEY, (ctx, x, y) => ctx.drawImage(imgNone, x, y, size, size));
    sources.set(UNKNOWN_KEY, (ctx, x, y) => ctx.drawImage(imgUnknown, x, y, size, size));

    const usedSheets = new Set(
      [...sources.keys()].map(k => iconLookup(k)?.file).filter((f): f is string => !!f)
    );
    await Promise.all([imgNone, imgUnknown, ...[...usedSheets].map(f => imgSheets[f])].map(img => img.decode()));

    const keys = [...sources.keys()];
    const cols = 32;
    const rows = Math.ceil(keys.length / cols);
    const full = document.createElement('canvas');
    full.width = cols * CELL;
    full.height = rows * CELL;
    const fullCtx = full.getContext('2d')!;
    fullCtx.imageSmoothingQuality = 'high';
    keys.forEach((key, i) => sources.get(key)!(fullCtx, (i % cols) * CELL, Math.floor(i / cols) * CELL));

    const scale = N / size;
    const half = document.createElement('canvas');
    half.width = full.width * scale;
    half.height = full.height * scale;
    const halfCtx = half.getContext('2d', { willReadFrequently: true })!;
    halfCtx.imageSmoothingQuality = 'high';
    halfCtx.drawImage(full, 0, 0, half.width, half.height);
    const data = halfCtx.getImageData(0, 0, half.width, half.height).data;

    const refs = new Map<string, IRef>();
    const pitch = CELL * scale;
    keys.forEach((key, i) => {
      const ox = (i % cols) * pitch;
      const oy = Math.floor(i / cols) * pitch;
      const a = new Float32Array(N * N);
      const c = new Float32Array(N * N * 3);
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const s = ((oy + y) * half.width + ox + x) * 4;
          const p = y * N + x;
          a[p] = data[s + 3] / 255;
          c[p * 3] = data[s];
          c[p * 3 + 1] = data[s + 1];
          c[p * 3 + 2] = data[s + 2];
        }
      }
      refs.set(key, { a, c });
    });
    return refs;
  }

  // #endregion
}

const NONE_KEY = '#none';
const UNKNOWN_KEY = '#unknown';

// #region Scoring

/** RMS error between the patch and the candidate as the renderer would have drawn it there. */
function score(patch: IPatch, candidate: Candidate, ghost: IRef | undefined, refs: Map<string, IRef>): number {
  const { o, b } = patch;
  const layers: Array<[IRef, number]> = [];
  switch (candidate.kind) {
    case 'item': layers.push([candidate.ref, 1]); break;
    case 'none':
      if (ghost) { layers.push([ghost, SQUARE_PLACEHOLDER_ALPHA]); }
      layers.push([refs.get(NONE_KEY)!, 1]);
      break;
    case 'unknown':
      if (ghost) { layers.push([ghost, SQUARE_PLACEHOLDER_ALPHA]); }
      layers.push([refs.get(UNKNOWN_KEY)!, SQUARE_UNKNOWN_ALPHA]);
      break;
  }

  let sum = 0;
  for (let p = 0; p < N * N; p++) {
    for (let ch = 0; ch < 3; ch++) {
      let v = b[p * 3 + ch];
      for (const [ref, alpha] of layers) {
        const a = ref.a[p] * alpha;
        if (a) { v += a * (ref.c[p * 3 + ch] - v); }
      }
      const d = o[p * 3 + ch] - v;
      sum += d * d;
    }
  }
  return Math.sqrt(sum / (N * N * 3));
}

type DyeLayer = [Float32Array | undefined, number[], number];

/** Side of the blocks a droplet is averaged over before comparing. */
const DYE_BLOCK = 4;

/**
 * Compares block averages rather than pixels: a scaled-down droplet arrives
 * blurred, which would otherwise favour the faint "no dye" droplet over the
 * sharply outlined black one.
 */
function dyeError(patch: IPatch, layers: DyeLayer[]): number {
  const { o, b } = patch;
  const n = Math.sqrt(o.length / 3);
  const blocks = n / DYE_BLOCK;
  const diff = new Float32Array(blocks * blocks * 3);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const p = y * n + x;
      const block = (Math.floor(y / DYE_BLOCK) * blocks + Math.floor(x / DYE_BLOCK)) * 3;
      for (let ch = 0; ch < 3; ch++) {
        let v = b[p * 3 + ch];
        for (const [mask, rgb, alpha] of layers) {
          const a = (mask?.[p] ?? 0) * alpha;
          if (a) { v += a * (rgb[ch] - v); }
        }
        diff[block + ch] += o[p * 3 + ch] - v;
      }
    }
  }
  return diff.reduce((sum, d) => sum + d * d, 0);
}

// #endregion

// #region Sampling

/** Draws regions of the image at a fixed size, through the same resampling as the references. */
class PatchSampler {
  private readonly _canvas = document.createElement('canvas');
  private readonly _ctx = this._canvas.getContext('2d', { willReadFrequently: true })!;

  constructor(private readonly _source: HTMLCanvasElement) {
    this._ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Samples a square of `size` render pixels at (`x`, `y`) into `n`×`n`,
   * shifted by (`dx`, `dy`) output pixels.
   */
  patch(at: IPlacement, x: number, y: number, size: number, n: number, dx: number, dy: number, plane: IPlane): IPatch {
    if (this._canvas.width !== n) { this._canvas.width = this._canvas.height = n; this._ctx.imageSmoothingQuality = 'high'; }
    const step = size / n;
    const sx = at.x0 + (x + dx * step) * at.sx;
    const sy = at.y0 + (y + dy * step) * at.sy;
    this._ctx.clearRect(0, 0, n, n);
    this._ctx.drawImage(this._source, sx, sy, size * at.sx, size * at.sy, 0, 0, n, n);
    const data = this._ctx.getImageData(0, 0, n, n).data;

    const o = new Float32Array(n * n * 3);
    const b = new Float32Array(n * n * 3);
    for (let v = 0; v < n; v++) {
      const py = sy + (v + 0.5) * step * at.sy;
      for (let u = 0; u < n; u++) {
        const px = sx + (u + 0.5) * step * at.sx;
        const p = v * n + u;
        o[p * 3] = data[p * 4];
        o[p * 3 + 1] = data[p * 4 + 1];
        o[p * 3 + 2] = data[p * 4 + 2];
        b[p * 3] = evalPlane(plane.r, px, py);
        b[p * 3 + 1] = evalPlane(plane.g, px, py);
        b[p * 3 + 2] = evalPlane(plane.b, px, py);
      }
    }
    return { o, b };
  }
}

const evalPlane = (k: number[], x: number, y: number) => k[0] + k[1] * x + k[2] * y;

/**
 * Fits a colour plane to the strip between the card edge and its icon. The
 * blurred backdrop under the translucent panel and the panel's sheen are
 * both smooth enough for that.
 */
function fitPlane(img: ImageData, at: IPlacement, layout: ISquareLayout, slot: number): IPlane {
  const card = layout.card(slot);
  const inset = (layout.cardW - layout.item) / 2;
  const corner = 16;
  const samples: number[][] = [];
  const push = (rx: number, ry: number) => {
    const x = Math.round(at.x0 + rx * at.sx);
    const y = Math.round(at.y0 + ry * at.sy);
    if (x < 0 || y < 0 || x >= img.width || y >= img.height) { return; }
    const i = (y * img.width + x) * 4;
    samples.push([x, y, img.data[i], img.data[i + 1], img.data[i + 2]]);
  };

  // Clear of the 1px edge stroke on the outside and of the icon on the inside.
  const lo = 1.5, hi = inset - 1.5;
  const stepX = 1 / Math.max(1, at.sx), stepY = 1 / Math.max(1, at.sy);
  for (let t = lo; t <= hi; t += Math.min(stepX, stepY)) {
    for (let ry = card.y + corner; ry <= card.y + layout.cardH - corner; ry += stepY) {
      push(card.x + t, ry);
      push(card.x + layout.cardW - t, ry);
    }
    for (let rx = card.x + corner; rx <= card.x + layout.cardW - corner; rx += stepX) {
      push(rx, card.y + t);
      push(rx, card.y + layout.cardH - t);
    }
  }

  let fit = solvePlane(samples);
  // One pass of outlier rejection for compression artefacts and stray icon pixels.
  const residual = (s: number[]) => Math.abs(s[2] - evalPlane(fit.r, s[0], s[1]))
    + Math.abs(s[3] - evalPlane(fit.g, s[0], s[1]))
    + Math.abs(s[4] - evalPlane(fit.b, s[0], s[1]));
  const residuals = samples.map(residual).sort((a, b) => a - b);
  const limit = Math.max(6, 3 * (residuals[Math.floor(residuals.length / 2)] ?? 0));
  const kept = samples.filter(s => residual(s) <= limit);
  if (kept.length >= 3) { fit = solvePlane(kept); }
  return fit;
}

function solvePlane(samples: number[][]): IPlane {
  if (samples.length < 3) {
    const mean = (ch: number) => samples.length ? samples.reduce((s, v) => s + v[ch], 0) / samples.length : 0;
    return { r: [mean(2), 0, 0], g: [mean(3), 0, 0], b: [mean(4), 0, 0] };
  }

  // Centred coordinates keep the normal equations well conditioned.
  const n = samples.length;
  const mx = samples.reduce((s, v) => s + v[0], 0) / n;
  const my = samples.reduce((s, v) => s + v[1], 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of samples) {
    const dx = x - mx, dy = y - my;
    sxx += dx * dx; sxy += dx * dy; syy += dy * dy;
  }
  const det = sxx * syy - sxy * sxy;

  const solve = (ch: number) => {
    let mean = 0;
    for (const s of samples) { mean += s[ch]; }
    mean /= n;
    let sxv = 0, syv = 0;
    for (const s of samples) {
      const dv = s[ch] - mean;
      sxv += (s[0] - mx) * dv;
      syv += (s[1] - my) * dv;
    }
    const kx = det ? (sxv * syy - syv * sxy) / det : 0;
    const ky = det ? (syv * sxx - sxv * sxy) / det : 0;
    return [mean - kx * mx - ky * my, kx, ky];
  };
  return { r: solve(2), g: solve(3), b: solve(4) };
}

// #endregion

// #region Locating

/** The image as rendered, possibly scaled: recognised by its aspect ratio alone. */
function placeFromAspect(width: number, height: number): IPlacement | undefined {
  for (let dyeRows = 0; dyeRows <= 2; dyeRows++) {
    const layout = squareLayout(dyeRows);
    const expected = layout.width / layout.height;
    if (Math.abs(width / height - expected) / expected <= ASPECT_TOLERANCE) {
      return { x0: 0, y0: 0, sx: width / layout.width, sy: height / layout.height, dyeRows };
    }
  }
  return undefined;
}

/**
 * Finds the render inside a larger image, such as a screenshot of a chat.
 * Every card has a light border and differs in brightness from the backdrop
 * (darker or lighter, depending on the background), so edge strength peaks
 * at a fixed pitch. The column profile gives the scale and horizontal
 * offset, the rows then give the card height and with it the dye rows.
 */
function locate(img: ImageData): IPlacement[] {
  const { width: w, height: h, data } = img;
  if (w < 60 || h < 40) { return []; }

  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  const base = squareLayout(0);
  const pitchUnits = base.cardW + (base.card(1).x - base.card(0).x - base.cardW);
  const widthRatio = base.cardW / pitchUnits;
  const gridUnits = 4 + widthRatio;

  const vertical = straightEdges(lum, w, h, true);
  const horizontal = straightEdges(lum, w, h, false);

  const cols = smooth(profile(w, x => {
    let sum = 0;
    for (let y = 0; y < h; y++) { sum += vertical[y * w + x]; }
    return sum / h;
  }));

  // Each card counts only as much as its weaker edge, so a single strong edge
  // elsewhere (such as the border of the render itself) can't carry a guess.
  const colScore = (p: number, o: number) => {
    let s = 0;
    for (let k = 0; k < 5; k++) {
      s += Math.min(sample(cols, o + k * p + widthRatio * p), sample(cols, o + k * p));
    }
    return s;
  };

  let best = { p: 0, o: 0, s: -Infinity };
  const maxPitch = (w - 2) / gridUnits;
  for (let p = 16; p <= maxPitch; p += 0.25) {
    for (let o = 1; o + gridUnits * p < w - 1; o++) {
      const s = colScore(p, o);
      if (s > best.s) { best = { p, o, s }; }
    }
  }
  if (!best.p) { return []; }
  best = refine(best, (p, o) => colScore(p, o), 0.25, 1);

  const scale = best.p / pitchUnits;
  const corner = 14 * scale;
  const card = base.card(0);

  /** The best fit for each card height at the given left edge, best first. */
  const placementsAt = (left: number): IPlacement[] => {
    const rows = smooth(profile(h, y => {
      let sum = 0, count = 0;
      for (let k = 0; k < 5; k++) {
        const x0 = Math.ceil(left + k * best.p + corner);
        const x1 = Math.floor(left + k * best.p + base.cardW * scale - corner);
        for (let x = Math.max(0, x0); x <= Math.min(w - 1, x1); x++) {
          sum += horizontal[y * w + x];
          count++;
        }
      }
      return count ? sum / count : 0;
    }));

    const placements: Array<IPlacement & { score: number }> = [];
    for (let dyeRows = 0; dyeRows <= 2; dyeRows++) {
      const layout = squareLayout(dyeRows);
      const cardH = layout.cardH * scale;
      const pitch = (layout.card(5).y - layout.card(0).y) * scale;
      let top = 0, score = -Infinity;
      for (let o = 1; o + pitch + cardH < h - 1; o++) {
        const s = rowScore(rows, o, cardH, pitch);
        if (s > score) { top = o; score = s; }
      }
      if (score === -Infinity) { continue; }
      for (let o = top - 1; o <= top + 1; o += 0.1) {
        const s = rowScore(rows, o, cardH, pitch);
        if (s > score) { top = o; score = s; }
      }
      placements.push({ x0: left - card.x * scale, y0: top - card.y * scale, sx: scale, sy: scale, dyeRows, score });
    }
    return placements.sort((a, b) => b.score - a.score);
  };

  // Edges next to the render can stand in for its first or last card, so the
  // neighbouring offsets are tried as well; the slots decide between them.
  return [best.o, best.o - best.p, best.o + best.p]
    .filter(left => left >= 0 && left + gridUnits * best.p <= w)
    .flatMap(placementsAt);
}

const rowScore = (rows: Float32Array, o: number, cardH: number, pitch: number) =>
  Math.min(sample(rows, o + cardH), sample(rows, o)) + Math.min(sample(rows, o + pitch + cardH), sample(rows, o + pitch));

/** Brightness step that counts as an edge; the light card border alone clears it. */
const EDGE_MIN = 6;
/** Shortest straight run that counts. Card borders are far longer; icon strokes rarely are. */
const RUN_MIN = 8;

/**
 * Marks pixels on long, axis-aligned edges. The card borders are the only
 * long straight lines in the render, while the high-contrast icons would
 * otherwise dominate any plain edge measure.
 */
function straightEdges(lum: Float32Array, w: number, h: number, vertical: boolean): Uint8Array {
  const edge = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = Math.abs(lum[i + 1] - lum[i - 1]);
      const gy = Math.abs(lum[i + w] - lum[i - w]);
      edge[i] = vertical ? +(gx >= EDGE_MIN && gx >= 2 * gy) : +(gy >= EDGE_MIN && gy >= 2 * gx);
    }
  }

  const out = new Uint8Array(w * h);
  const lines = vertical ? w : h;
  const length = vertical ? h : w;
  const at = vertical ? (line: number, t: number) => t * w + line : (line: number, t: number) => line * w + t;
  for (let line = 0; line < lines; line++) {
    let start = -1, gap = 0;
    for (let t = 0; t <= length; t++) {
      const on = t < length && edge[at(line, t)];
      if (on) {
        if (start < 0) { start = t; }
        gap = 0;
      } else if (start >= 0 && (++gap > 1 || t === length)) {
        const end = t - gap;
        if (end - start + 1 >= RUN_MIN) {
          for (let u = start; u <= end; u++) { out[at(line, u)] = 1; }
        }
        start = -1; gap = 0;
      }
    }
  }
  return out;
}

/** Values at 1…n-2; the outermost entries stay zero. */
function profile(n: number, at: (i: number) => number): Float32Array {
  const out = new Float32Array(n);
  for (let i = 1; i < n - 1; i++) { out[i] = at(i); }
  return out;
}

function smooth(values: Float32Array): Float32Array {
  const out = new Float32Array(values.length);
  for (let i = 1; i < values.length - 1; i++) {
    out[i] = (values[i - 1] + 2 * values[i] + values[i + 1]) / 4;
  }
  return out;
}

function sample(values: Float32Array, at: number): number {
  const i = Math.floor(at);
  if (i < 0 || i >= values.length - 1) { return 0; }
  const f = at - i;
  return values[i] * (1 - f) + values[i + 1] * f;
}

function refine(start: { p: number; o: number; s: number }, fn: (p: number, o: number) => number, pRange: number, oRange: number) {
  let best = start;
  for (let p = start.p - pRange; p <= start.p + pRange; p += 0.05) {
    for (let o = start.o - oRange; o <= start.o + oRange; o += 0.1) {
      const s = fn(p, o);
      if (s > best.s) { best = { p, o, s }; }
    }
  }
  return best;
}

// #endregion
