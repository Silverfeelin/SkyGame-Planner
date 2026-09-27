import { LANCZOS, RgbaImage, clamp, median, resample, rint } from './image';
import { Grid, INSIDE, cellCentre } from './grid';

/** Comparison resolution. */
export const N = 64;
export const NN = N * N;
/** Tile half-size as a fraction of the pitch. */
const TILE = 0.41;
/** Shared backdrop for references and extracted icons. */
const BG = [4, 9, 22];
const CHROMA_BLUR = 3;

/** Icon pixels composited onto BG, with soft alpha. Row-major, `width` x `height`. */
interface IconPixels {
  width: number;
  height: number;
  rgb: Float64Array;
  alpha: Float64Array;
}

export interface IconFeatures {
  /** alpha, luminance and two chroma channels, each N x N. */
  f: Float32Array;
  /** Aspect ratio (w/h) of the icon's bounding box. */
  aspect: number;
  /** Mean luminance (0-255) and saturation under alpha. */
  lum: number;
  sat: number;
}

/** 4-neighbour connected components in raster order of their first pixel. Returns labels (0 = background) and count. */
function label(mask: Uint8Array, w: number, h: number): [Int32Array, number] {
  const lab = new Int32Array(w * h);
  const stack: number[] = [];
  let n = 0;
  for (let s = 0; s < w * h; s++) {
    if (!mask[s] || lab[s]) { continue; }
    lab[s] = ++n;
    stack.push(s);
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % w;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
        if (q >= 0 && q < w * h && mask[q] && !lab[q]) { lab[q] = n; stack.push(q); }
      }
    }
  }
  return [lab, n];
}

/** Mean colour of 5x5 patches at the INSIDE sample points, skipping points too close to the edge. */
function insideSamples(img: RgbaImage, vx: number, vy: number, w: number, h: number, cx: number, cy: number, px: number, py: number): number[][] {
  const out: number[][] = [];
  for (const [fx, fy] of INSIDE) {
    const x = rint(cx + fx * px), y = rint(cy + fy * py);
    if (x < 2 || x >= w - 2 || y < 2 || y >= h - 2) { continue; }
    const m = [0, 0, 0];
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const p = ((vy + y + dy) * img.width + vx + x + dx) * 4;
        m[0] += img.data[p]; m[1] += img.data[p + 1]; m[2] += img.data[p + 2];
      }
    }
    out.push(m.map(v => v / 25));
  }
  return out;
}

/**
 * Icon pixels relative to this tile's own background colour, minus corner badges and the selection ring.
 * `partial`: the icon is cut off by the image or the grid's viewport.
 */
export function extractIcon(img: RgbaImage, grid: Grid, i: number, j: number): { icon: IconPixels, partial: boolean } {
  const { px, py, view } = grid;
  const vx = rint(view[0]), vy = rint(view[1]);
  const w = rint(view[2]) - vx, h = rint(view[3]) - vy;
  const [gx, gy] = cellCentre(grid, i, j);
  const cx = gx - vx, cy = gy - vy;
  const x0 = rint(cx - px / 2), y0 = rint(cy - py / 2);
  const x1 = x0 + rint(px), y1 = y0 + rint(py);
  const cx0 = Math.max(0, x0), cy0 = Math.max(0, y0);
  const cw = Math.max(0, Math.min(w, x1) - cx0), ch = Math.max(0, Math.min(h, y1) - cy0);
  const n = cw * ch;

  const ins = insideSamples(img, vx, vy, w, h, cx, cy, px, py);
  const bg = ins.length ? [0, 1, 2].map(c => median(ins.map(s => s[c]))) : BG;

  const rgb = new Float64Array(n * 3);
  const dist = new Float64Array(n), mx = new Float64Array(n), sat = new Float64Array(n);
  const inside = new Uint8Array(n), m = new Uint8Array(n);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const k = y * cw + x;
      const p = ((vy + cy0 + y) * img.width + vx + cx0 + x) * 4;
      const r = img.data[p], g = img.data[p + 1], b = img.data[p + 2];
      rgb[k * 3] = r; rgb[k * 3 + 1] = g; rgb[k * 3 + 2] = b;
      dist[k] = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2);
      mx[k] = Math.max(r, g, b);
      sat[k] = (mx[k] - Math.min(r, g, b)) / Math.max(mx[k], 1);
      // icons stay inside their tile; the gap around it can be bright backdrop
      inside[k] = Math.abs(x + cx0 - cx) < TILE * px && Math.abs(y + cy0 - cy) < TILE * py ? 1 : 0;
      // tiles are translucent, so the backdrop shows through dimly; icons are saturated or clearly bright
      m[k] = inside[k] && ((sat[k] > 0.35 && mx[k] > 70 && dist[k] > 30) || (mx[k] > 100 && dist[k] > 45)) ? 1 : 0;
    }
  }

  const [lab, count] = label(m, cw, ch);
  const size = new Int32Array(count + 1), satSum = new Float64Array(count + 1);
  const bx0 = new Int32Array(count + 1).fill(cw), bx1 = new Int32Array(count + 1).fill(-1);
  const by0 = new Int32Array(count + 1).fill(ch), by1 = new Int32Array(count + 1).fill(-1);
  for (let k = 0; k < n; k++) {
    const l = lab[k];
    if (!l) { continue; }
    const x = k % cw, y = (k - x) / cw;
    size[l]++; satSum[l] += sat[k];
    bx0[l] = Math.min(bx0[l], x); bx1[l] = Math.max(bx1[l], x);
    by0[l] = Math.min(by0[l], y); by1[l] = Math.max(by1[l], y);
  }
  const ccx = cx - cx0, ccy = cy - cy0;
  const comps: number[] = [];
  for (let l = 1; l <= count; l++) {
    if (size[l] < 12) { continue; }
    const bw = bx1[l] - bx0[l], bh = by1[l] - by0[l];
    // the selection ring: wide and hollow
    if (bw > 0.75 * px && size[l] < 0.25 * bw * bh) { continue; }
    // corner badges: dye droplet (top-right), season/event markers (top-left)
    if ((bx0[l] > ccx + 0.1 * px || bx1[l] < ccx - 0.1 * px) && by1[l] < ccy && size[l] < 0.02 * px * py) { continue; }
    if (bx1[l] < ccx - 0.25 * px || bx0[l] > ccx + 0.25 * px || by1[l] < ccy - 0.3 * py || by0[l] > ccy + 0.3 * py) { continue; }
    comps.push(l);
  }
  const keepLabel = new Uint8Array(count + 1);
  if (comps.length) {
    const tuple = (l: number) => [size[l], bx0[l], bx1[l], by0[l], by1[l], satSum[l] / size[l], l];
    const big = comps.reduce((a, b) => {
      const ta = tuple(a), tb = tuple(b);
      for (let t = 0; t < ta.length; t++) { if (ta[t] !== tb[t]) { return tb[t] > ta[t] ? b : a; } }
      return a;
    });
    const mx0 = bx0[big] - 0.05 * px, mx1 = bx1[big] + 0.05 * px, my0 = by0[big] - 0.05 * py, my1 = by1[big] + 0.05 * py;
    for (const l of comps) {
      const outside = bx1[l] < mx0 || bx0[l] > mx1 || by1[l] < my0 || by0[l] > my1;
      // backdrop edges seen through the translucent tile: small, grey, detached from the icon
      if (outside && satSum[l] / size[l] < 0.12 && size[l] < 0.15 * size[big]) { continue; }
      keepLabel[l] = 1;
    }
  }
  const keep = new Uint8Array(n);
  for (let k = 0; k < n; k++) { keep[k] = keepLabel[lab[k]]; }

  // dilate by 2 px; wraps around at the crop edge like the spike's np.roll
  let dil = keep;
  for (let it = 0; it < 2; it++) {
    const next = new Uint8Array(n);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const k = y * cw + x;
        next[k] = dil[k] | dil[((y + 1) % ch) * cw + x] | dil[((y - 1 + ch) % ch) * cw + x]
          | dil[y * cw + (x + 1) % cw] | dil[y * cw + (x - 1 + cw) % cw];
      }
    }
    dil = next;
  }

  const alpha = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    if (!dil[k] || !inside[k]) { continue; }
    alpha[k] = clamp((dist[k] - 20) / 50, 0, 1) * clamp(Math.max(mx[k] - 55, sat[k] * 255 - 60) / 40, 0, 1);
  }
  const edge = (from: number, step: number, count: number) => {
    for (let t = 0; t < count; t++) { if (keep[from + t * step]) { return true; } }
    return false;
  };
  const partial = n > 0 && ((y0 < 0 && edge(0, 1, cw)) || (y1 > h && edge((ch - 1) * cw, 1, cw))
    || (x0 < 0 && edge(0, cw, ch)) || (x1 > w && edge(cw - 1, cw, ch)));

  for (let k = 0; k < n; k++) {
    for (let c = 0; c < 3; c++) { rgb[k * 3 + c] = rgb[k * 3 + c] * alpha[k] + BG[c] * (1 - alpha[k]); }
  }
  return { icon: { width: cw, height: ch, rgb, alpha }, partial };
}

/** Pillow-style `RGBA` -> `RGBa`. */
const premultiply = (v: number, a: number) => { const t = v * a + 128; return ((t >> 8) + t) >> 8; };

/**
 * Crops to the icon (alpha > 0.3), fits it into (N-4)^2 keeping the aspect ratio and centres it on an N x N BG canvas.
 * Returns null for an empty icon.
 */
function fitIcon(icon: IconPixels): { rgb: Float64Array, alpha: Float64Array, aspect: number } | null {
  const { width: w, rgb, alpha } = icon;
  let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
  for (let k = 0; k < alpha.length; k++) {
    if (alpha[k] > 0.3) {
      const x = k % w, y = (k - x) / w;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  if (x1 < 0) { return null; }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  const src = new Uint8ClampedArray(bw * bh * 4);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const k = (y0 + y) * w + x0 + x, o = (y * bw + x) * 4;
      const a = Math.trunc(clamp(alpha[k] * 255, 0, 255));
      for (let c = 0; c < 3; c++) { src[o + c] = premultiply(Math.trunc(clamp(rgb[k * 3 + c], 0, 255)), a); }
      src[o + 3] = a;
    }
  }
  const scale = (N - 4) / Math.max(bw, bh);
  const tw = Math.max(1, rint(bw * scale)), th = Math.max(1, rint(bh * scale));
  const res = resample(src, bw, bh, 4, tw, th, LANCZOS);
  const offX = Math.floor((N - tw) / 2), offY = Math.floor((N - th) / 2);
  const outRgb = new Float64Array(NN * 3), outA = new Float64Array(NN);
  for (let k = 0; k < NN; k++) { outRgb.set(BG, k * 3); }
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const o = (y * tw + x) * 4, k = (offY + y) * N + offX + x;
      const a = res[o + 3];
      outA[k] = a / 255;
      for (let c = 0; c < 3; c++) {
        const v = a ? Math.min(255, Math.trunc(255 * res[o + c] / a)) : 0;
        outRgb[k * 3 + c] = rint((v * a + BG[c] * (255 - a)) / 255);
      }
    }
  }
  return { rgb: outRgb, alpha: outA, aspect: bw / bh };
}

/** 3x3 box blur with wrap-around. */
function blur(x: Float32Array, passes: number): void {
  const t = new Float32Array(NN);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < N; y++) {
      for (let c = 0; c < N; c++) { t[y * N + c] = (x[y * N + c] + x[y * N + (c + N - 1) % N] + x[y * N + (c + 1) % N]) / 3; }
    }
    for (let y = 0; y < N; y++) {
      for (let c = 0; c < N; c++) { x[y * N + c] = (t[y * N + c] + t[((y + N - 1) % N) * N + c] + t[((y + 1) % N) * N + c]) / 3; }
    }
  }
}

/** Comparison features of an icon, or null when it has no visible pixels. */
export function iconFeatures(icon: IconPixels): IconFeatures | null {
  const fitted = fitIcon(icon);
  if (!fitted) { return null; }
  const { rgb, alpha, aspect } = fitted;
  const f = new Float32Array(4 * NN);
  let wsum = 1e-9, lum = 0, sat = 0;
  for (let k = 0; k < NN; k++) {
    const r = rgb[k * 3], g = rgb[k * 3 + 1], b = rgb[k * 3 + 2], a = alpha[k];
    f[k] = a;
    f[NN + k] = (r + g + b) / 765;
    // opponent colour pair; JPEG stores colour at half resolution, so it gets extra smoothing
    f[2 * NN + k] = (r - g) / 128 * a;
    f[3 * NN + k] = ((r + g) / 2 - b) / 128 * a;
    const mx = Math.max(r, g, b);
    wsum += a;
    lum += (r + g + b) / 3 * a;
    sat += (mx - Math.min(r, g, b)) / Math.max(mx, 1) * a;
  }
  blur(f.subarray(2 * NN, 3 * NN), CHROMA_BLUR);
  blur(f.subarray(3 * NN, 4 * NN), CHROMA_BLUR);
  return { f, aspect, lum: lum / wsum, sat: sat / wsum };
}

/** Features of a reference icon: a 128x128 RGBA cell cropped from a sprite sheet. */
export function referenceFeatures(sheet: RgbaImage, x: number, y: number, size = 128): IconFeatures | null {
  const rgb = new Float64Array(size * size * 3), alpha = new Float64Array(size * size);
  for (let yy = 0; yy < size; yy++) {
    for (let xx = 0; xx < size; xx++) {
      const p = ((y + yy) * sheet.width + x + xx) * 4, k = yy * size + xx;
      rgb[k * 3] = sheet.data[p]; rgb[k * 3 + 1] = sheet.data[p + 1]; rgb[k * 3 + 2] = sheet.data[p + 2];
      alpha[k] = sheet.data[p + 3] / 255;
    }
  }
  return iconFeatures({ width: size, height: size, rgb, alpha });
}
