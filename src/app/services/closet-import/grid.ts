import { BILINEAR, Plane, RgbaImage, box5, clamp, crop, luminance, median, polyfit, quantile, resample, rint } from './image';

/**
 * Full-resolution lattice: cell (i, j) is centred at (ox + i*px + rowOffset[j], oy + j*py), see `cellCentre`.
 * `view` is the visible closet area (x0, y0, x1, y1); tiles reaching past it are cut off like at an image edge.
 */
export interface Grid {
  px: number;
  py: number;
  ox: number;
  oy: number;
  /** Horizontal shift in pixels of rows that sit off the lattice: a centred short last row. Absent rows are 0. */
  rowOffset: Record<number, number>;
  cells: Array<[number, number]>;
  view: [number, number, number, number];
}

export function cellCentre(grid: Grid, i: number, j: number): [number, number] {
  return [grid.ox + i * grid.px + (grid.rowOffset[j] ?? 0), grid.oy + j * grid.py];
}

/** One pitch square around a cell in original screenshot pixels, clipped to the view. */
export function cellRect(grid: Grid, i: number, j: number): { x: number, y: number, width: number, height: number } {
  const [cx, cy] = cellCentre(grid, i, j);
  const [vx0, vy0, vx1, vy1] = grid.view;
  const x0 = Math.max(vx0, cx - grid.px / 2), y0 = Math.max(vy0, cy - grid.py / 2);
  const x1 = Math.min(vx1, cx + grid.px / 2), y1 = Math.min(vy1, cy + grid.py / 2);
  return { x: x0, y: y0, width: Math.max(0, x1 - x0), height: Math.max(0, y1 - y0) };
}

/** Spacing and horizontal offset of another screenshot in the same batch (same device and UI scale). */
export interface GridHint {
  px: number;
  py: number;
  ox: number;
}

type Pts = ReadonlyArray<readonly [number, number]>;
export const INSIDE: Pts = [[-0.38, -0.1], [-0.38, 0.15], [0.38, 0.15], [-0.3, 0.37], [0, 0.4], [0.3, 0.37], [-0.3, -0.36], [0, -0.4]];
const GAP_H: Pts = [[-0.5, -0.2], [-0.5, 0], [-0.5, 0.2], [0.5, -0.2], [0.5, 0], [0.5, 0.2]];
const GAP_V: Pts = [[-0.2, 0.5], [0, 0.5], [0.2, 0.5], [-0.2, -0.5], [0, -0.5], [0.2, -0.5]];
/** Offset steps per pitch; a 5x5 local search then covers one coarse step. */
const COARSE = 12;
const MAX_SIDE = 900;

type Lattice = [ox: number, oy: number, px: number, py: number];
type Score = [agreement: number, cells: number];

// #region Cell sets

const key = (i: number, j: number) => (i + 2048) * 4096 + (j + 2048);
const unkey = (k: number): [number, number] => [Math.floor(k / 4096) - 2048, (k % 4096) - 2048];

function largestGroup(cells: Set<number>): Set<number> {
  const seen = new Set<number>();
  let best = new Set<number>();
  for (const c of cells) {
    if (seen.has(c)) { continue; }
    const grp = new Set([c]);
    const stack = [c];
    seen.add(c);
    while (stack.length) {
      const [i, j] = unkey(stack.pop()!);
      for (const n of [key(i + 1, j), key(i - 1, j), key(i, j + 1), key(i, j - 1)]) {
        if (cells.has(n) && !seen.has(n)) { seen.add(n); grp.add(n); stack.push(n); }
      }
    }
    if (grp.size > best.size) { best = grp; }
  }
  return best;
}

// #endregion

// #region Pitch

function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) { j ^= bit; }
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}

/**
 * Autocorrelation along lines of `n` values at zero lag across lines: the sum of per-line autocorrelations.
 * Summing power spectra first needs only one inverse transform.
 */
function autocorrProfile(lines: number, n: number, get: (line: number, k: number) => number): Float64Array {
  let mean = 0;
  for (let l = 0; l < lines; l++) { for (let k = 0; k < n; k++) { mean += get(l, k); } }
  mean /= lines * n;
  let size = 1;
  while (size < 2 * n) { size <<= 1; }
  const power = new Float64Array(size);
  const re = new Float64Array(size), im = new Float64Array(size);
  // two real lines per complex transform: |X1|^2 + |X2|^2 = (|Z[k]|^2 + |Z[-k]|^2) / 2
  for (let l = 0; l < lines; l += 2) {
    re.fill(0); im.fill(0);
    for (let k = 0; k < n; k++) {
      re[k] = get(l, k) - mean;
      if (l + 1 < lines) { im[k] = get(l + 1, k) - mean; }
    }
    fft(re, im);
    for (let k = 0; k < size; k++) {
      const m = (size - k) % size;
      power[k] += (re[k] ** 2 + im[k] ** 2 + re[m] ** 2 + im[m] ** 2) / 2;
    }
  }
  im.fill(0);
  re.set(power);
  fft(re, im); // the power spectrum is real and symmetric, so the forward transform equals the inverse up to scale
  const out = new Float64Array(Math.floor(n / 2));
  for (let k = 0; k < out.length; k++) { out[k] = re[k] / re[0]; }
  return out;
}

/** Strongest local maxima beyond the central lobe, sub-pixel refined. */
function peaks(profile: Float64Array, n: number): Array<number> {
  // the lobe ends at the first dip; a busy backdrop keeps the profile high well past the pitch
  let lobe = 1;
  for (let k = 1; k < profile.length - 1; k++) {
    if (profile[k] <= profile[k + 1]) { lobe = k; break; }
  }
  const out: Array<[number, number]> = [];
  for (let k = lobe; k < profile.length - 1; k++) {
    const a = profile[k - 1], b = profile[k], c = profile[k + 1];
    if (b > 0.05 && b >= a && b >= c) {
      const den = a - 2 * b + c;
      out.push([b, k + (den !== 0 ? 0.5 * (a - c) / den : 0)]);
    }
  }
  out.sort((p, q) => q[0] - p[0] || q[1] - p[1]);
  return out.slice(0, n).map(p => p[1]);
}

/** (px, py) pairs from the periodicity of tile edges: column edges for px, row edges for py. */
function pitchCandidates(L: Plane, n = 3): Array<[number, number]> {
  // tile edges are on every screenshot; icon colours and the backdrop vary too much to rely on
  const { width: w, height: h, data } = L;
  const dx = autocorrProfile(h, w - 1, (y, x) => Math.abs(data[y * w + x + 1] - data[y * w + x]));
  const dy = autocorrProfile(w, h - 1, (x, y) => Math.abs(data[(y + 1) * w + x] - data[y * w + x]));
  const xs = peaks(dx, n).filter(p => p > 12);
  const ys = peaks(dy, n).filter(p => p > 12);
  const out: Array<[number, number]> = [];
  for (const px of xs.length ? xs : ys) {
    // tiles are close to square; edge fitting settles the exact py
    const near = ys.filter(py => py / px > 0.9 && py / px < 1.15);
    const py = near.length ? near.reduce((a, b) => Math.abs(b / px - 1.03) < Math.abs(a / px - 1.03) ? b : a) : px;
    if (!out.some(q => Math.abs(px / q[0] - 1) < 0.02)) { out.push([px, py]); }
  }
  return out;
}

// #endregion

// #region Tile test

interface Contrast {
  i0: number;
  j0: number;
  ni: number;
  nj: number;
  ok: Uint8Array;
  c: Float64Array;
}

function sampleMedian(L: Plane, cx: number, cy: number, px: number, py: number, pts: Pts, buf: Float64Array): number {
  const { width: w, height: h, data } = L;
  let n = 0;
  for (const [fx, fy] of pts) {
    const x = rint(cx + fx * px), y = rint(cy + fy * py);
    if (x >= 0 && x < w && y >= 0 && y < h) { buf[n++] = data[y * w + x]; }
  }
  // a cell hanging off the image must not pass on a single lucky sample
  return n >= 2 ? median(buf.subarray(0, n)) : NaN;
}

/** Tile contrast (gap minus inside luminance) of one cell, or 0 when it doesn't look like a tile. */
function tileContrast(L: Plane, cx: number, cy: number, px: number, py: number, buf: Float64Array): number {
  const li = sampleMedian(L, cx, cy, px, py, INSIDE, buf);
  // both the column gaps and the row gaps must be lighter; a lattice shifted along one axis fails the other
  const lg = Math.min(sampleMedian(L, cx, cy, px, py, GAP_H, buf), sampleMedian(L, cx, cy, px, py, GAP_V, buf));
  return lg - li > 6 && li < 0.85 * lg ? Math.min(lg - li, 40) : 0;
}

/** Per-cell tile contrast for every lattice cell in the image. */
function contrastAt(L: Plane, ox: number, oy: number, px: number, py: number): Contrast {
  const { width: w, height: h } = L;
  const i0 = Math.floor(-ox / px), i1 = Math.ceil((w - ox) / px);
  const j0 = Math.floor(-oy / py), j1 = Math.ceil((h - oy) / py);
  const ni = i1 - i0 + 1, nj = j1 - j0 + 1;
  const ok = new Uint8Array(ni * nj);
  const c = new Float64Array(ni * nj);
  const buf = new Float64Array(8);
  for (let b = 0; b < nj; b++) {
    const cy = oy + (j0 + b) * py;
    for (let a = 0; a < ni; a++) {
      const v = tileContrast(L, ox + (i0 + a) * px, cy, px, py, buf);
      if (v > 0) { ok[b * ni + a] = 1; c[b * ni + a] = v; }
    }
  }
  return { i0, j0, ni, nj, ok, c };
}

function passingCells(ct: Contrast): Set<number> {
  const out = new Set<number>();
  for (let b = 0; b < ct.nj; b++) {
    for (let a = 0; a < ct.ni; a++) {
      if (ct.ok[b * ct.ni + a]) { out.add(key(ct.i0 + a, ct.j0 + b)); }
    }
  }
  return out;
}

function gridCells(L: Plane, ox: number, oy: number, px: number, py: number): Set<number> {
  return largestGroup(passingCells(contrastAt(L, ox, oy, px, py)));
}

// #endregion

// #region Offsets

/** Summed-area table of a mask, (w+1) x (h+1). */
function integral(mask: Uint8Array, w: number, h: number): Plane {
  const out = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += mask[y * w + x];
      out[(y + 1) * (w + 1) + x + 1] = out[y * (w + 1) + x + 1] + row;
    }
  }
  return { width: w + 1, height: h + 1, data: out };
}

function boxSum(S: Plane, x0: number, y0: number, x1: number, y1: number): number {
  const w = S.width - 1, h = S.height - 1, s = S.width;
  x0 = clamp(rint(x0), 0, w); x1 = clamp(rint(x1), 0, w);
  y0 = clamp(rint(y0), 0, h); y1 = clamp(rint(y1), 0, h);
  return S.data[y1 * s + x1] - S.data[y0 * s + x1] - S.data[y1 * s + x0] + S.data[y0 * s + x0];
}

/** Icons sit in the middle of tiles: content in the central box minus content on the tile boundary band. */
function centredScore(S: Plane, cells: Set<number>, ox: number, oy: number, px: number, py: number): number {
  let tot = 0;
  for (const k of cells) {
    const [i, j] = unkey(k);
    const cx = ox + i * px, cy = oy + j * py;
    const box = (f: number) => boxSum(S, cx - f * px, cy - f * py, cx + f * px, cy + f * py);
    tot += box(0.25) - 3 * (box(0.5) - box(0.42));
  }
  return tot;
}

/** Tile/gap contrast can be ambiguous under a half-pitch shift; icon placement is not. */
function halfShift(L: Plane, S: Plane, ox: number, oy: number, px: number, py: number, shiftX: boolean): [number, number] {
  const opts: Array<[Set<number>, [number, number]]> = [];
  for (const sx of shiftX ? [0, 0.5] : [0]) {
    for (const sy of [0, 0.5]) {
      const o: [number, number] = [ox + sx * px, oy + sy * py];
      opts.push([gridCells(L, o[0], o[1], px, py), o]);
    }
  }
  const most = Math.max(...opts.map(([c]) => c.size));
  // only shifts that pass about as many tiles are ambiguous; a warm backdrop in the gaps counts as
  // icon content, so a few stray cells could otherwise outscore the real grid
  let best: [number, [number, number]] | undefined;
  for (const [c, o] of opts) {
    if (!c.size || c.size < 0.6 * most) { continue; }
    const s = centredScore(S, c, o[0], o[1], px, py) / c.size;
    if (!best || s > best[0]) { best = [s, o]; }
  }
  return best ? best[1] : [ox, oy];
}

/**
 * Up to `keep` distinct lattice offsets for a given pitch, best first; edge agreement picks between them later.
 * `oxFixed` skips the horizontal search (closets only scroll vertically).
 */
function fitOffsets(L: Plane, S: Plane, px: number, py: number, oxFixed?: number, keep = 3): Array<[number, number]> {
  const objective = (ox: number, oy: number): number => {
    const ct = contrastAt(L, ox, oy, px, py);
    // the closet is one contiguous block; scattered hits in the game scene must not add up
    const grp = largestGroup(passingCells(ct));
    let sum = 0;
    for (const k of grp) {
      const [i, j] = unkey(k);
      sum += ct.c[(j - ct.j0) * ct.ni + (i - ct.i0)];
    }
    return grp.size + sum / 1000;
  };
  const apart = (a: readonly number[], b: readonly number[]) => {
    const dx = (a[0] - b[0]) / px, dy = (a[1] - b[1]) / py;
    return Math.max(Math.abs(dx - Math.round(dx)), Math.abs(dy - Math.round(dy))) >= 0.15;
  };
  const cmp = (a: number[], b: number[]) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2];

  const xs = oxFixed !== undefined ? [oxFixed] : Array.from({ length: COARSE }, (_, k) => k * px / COARSE);
  const coarse: Array<[number, number, number]> = [];
  for (const ox of xs) {
    for (let k = 0; k < COARSE; k++) {
      const oy = k * py / COARSE;
      coarse.push([objective(ox, oy), ox, oy]);
    }
  }
  coarse.sort(cmp);
  // large bright icons can let a lattice a third of a tile off pass the tile test about as often as the real one
  const seeds: Array<[number, number, number]> = [];
  for (const s of coarse) {
    if (s[0] < 0.7 * coarse[0][0] || seeds.length === keep) { break; }
    if (seeds.every(t => apart(s.slice(1), t.slice(1)))) { seeds.push(s); }
  }
  const steps = [-0.5, -0.25, 0, 0.25, 0.5];
  const dxs = oxFixed !== undefined ? [0] : steps.map(s => s * px / COARSE);
  const dys = steps.map(s => s * py / COARSE);
  const out: Array<[number, number]> = [];
  for (const seed of seeds) {
    // the tile test only passes within about 5% of the pitch, finer than a coarse step
    const cands: Array<[number, number, number]> = [seed];
    for (const dx of dxs) {
      for (const dy of dys) { cands.push([objective(seed[1] + dx, seed[2] + dy), seed[1] + dx, seed[2] + dy]); }
    }
    const best = cands.sort(cmp)[0];
    const o = halfShift(L, S, best[1], best[2], px, py, oxFixed === undefined);
    if (out.every(p => apart(o, p))) { out.push(o); }
  }
  return out;
}

// #endregion

// #region Edge refinement

type Edges = [ex: number | null, ey: number | null, sx: number, sy: number];

/**
 * Measured tile centre from its left/right and top/bottom edges (gap is lighter than tile).
 * `clamp`: for a whole tile near the image border, search only the part of the gap band that is in the image.
 */
function tileEdges(L: Plane, cx: number, cy: number, px: number, py: number, clampBands = false): Edges | null {
  const { width: w, height: h, data } = L;
  const centre1d = (prof: Float64Array, c: number, p: number, lo: number): [number | null, number] => {
    const n = prof.length - 1;
    let a0 = Math.trunc(c - 0.62 * p) - lo, b1 = Math.trunc(c + 0.62 * p) - lo;
    const a1 = Math.trunc(c - 0.25 * p) - lo, b0 = Math.trunc(c + 0.25 * p) - lo;
    if (clampBands) { a0 = Math.max(a0, 0); b1 = Math.min(b1, n); }
    if (a0 < 0 || b1 > n || a1 - a0 < 0.15 * p || b1 - b0 < 0.15 * p) { return [null, 0]; }
    const g = (k: number) => prof[k + 1] - prof[k];
    let l = a0, r = b0;
    for (let k = a0; k < Math.min(a1, n); k++) { if (g(k) < g(l)) { l = k; } }
    for (let k = b0; k < b1; k++) { if (g(k) > g(r)) { r = k; } }
    return [lo + (l + r + 1) / 2, Math.min(-g(l), g(r))];
  };
  const lox = Math.max(0, Math.trunc(cx - 0.7 * px)), hix = Math.min(w, Math.trunc(cx + 0.7 * px));
  const loy = Math.max(0, Math.trunc(cy - 0.7 * py)), hiy = Math.min(h, Math.trunc(cy + 0.7 * py));
  // measure in the tile's outer bands, where icons rarely reach (median copes with those that do)
  const band = (c: number, p: number, size: number) => {
    const out: number[] = [];
    for (const [a, b] of [[c - 0.36 * p, c - 0.26 * p], [c + 0.26 * p, c + 0.36 * p]]) {
      for (let v = Math.trunc(a); v < Math.trunc(b); v++) { if (v >= 0 && v < size) { out.push(v); } }
    }
    return out;
  };
  const rows = band(cy, py, h), cols = band(cx, px, w);
  if (rows.length < 4 || cols.length < 4) { return null; }
  const buf = new Float64Array(Math.max(rows.length, cols.length));
  const profX = new Float64Array(Math.max(hix - lox, 0));
  for (let x = lox; x < hix; x++) {
    rows.forEach((y, k) => buf[k] = data[y * w + x]);
    profX[x - lox] = median(buf.subarray(0, rows.length));
  }
  const profY = new Float64Array(Math.max(hiy - loy, 0));
  for (let y = loy; y < hiy; y++) {
    cols.forEach((x, k) => buf[k] = data[y * w + x]);
    profY[y - loy] = median(buf.subarray(0, cols.length));
  }
  const [ex, sx] = centre1d(profX, cx, px, lox);
  const [ey, sy] = centre1d(profY, cy, py, loy);
  return [ex, ey, sx, sy];
}

/** Line fit with residual-based outlier rejection; returns [pitch, offset]. */
function robustFit(pts: Array<[number, number]>, o: number, p: number): [number, number] {
  const r = pts.map(([k, e]) => Math.abs(e - (o + k * p)));
  const lim = Math.max(3, 3 * median(r));
  const kept = pts.filter((_, n) => r[n] < lim);
  if (new Set(kept.map(q => q[0])).size < 2) { return [p, o]; }
  return polyfit(kept.map(q => q[0]), kept.map(q => q[1]));
}

function edgeFit(L: Plane, cells: Set<number>, [ox, oy, px, py]: Lattice): Lattice {
  const rows: Array<[number, number, Edges]> = [];
  for (const k of cells) {
    const [i, j] = unkey(k);
    const e = tileEdges(L, ox + i * px, oy + j * py, px, py);
    if (e) { rows.push([i, j, e]); }
  }
  for (let it = 0; it < 3; it++) {
    const X = rows.filter(([, , e]) => e[0] !== null && e[2] > 2).map(([i, , e]) => [i, e[0]!] as [number, number]);
    const Y = rows.filter(([, , e]) => e[1] !== null && e[3] > 2).map(([, j, e]) => [j, e[1]!] as [number, number]);
    if (new Set(X.map(q => q[0])).size > 1) { [px, ox] = robustFit(X, ox, px); }
    if (new Set(Y.map(q => q[0])).size > 1) { [py, oy] = robustFit(Y, oy, py); }
  }
  return [ox, oy, px, py];
}

/** Cells whose measured tile edges sit where the lattice predicts: a wrong lattice scores poorly. */
function agreement(L: Plane, cells: Set<number>, [ox, oy, px, py]: Lattice): number {
  let n = 0;
  for (const k of cells) {
    const [i, j] = unkey(k);
    const e = tileEdges(L, ox + i * px, oy + j * py, px, py);
    if (!e || e[0] === null || e[1] === null) { continue; }
    if (Math.abs(e[0] - (ox + i * px)) < 0.06 * px && Math.abs(e[1] - (oy + j * py)) < 0.06 * py && Math.min(e[2], e[3]) > 2) { n++; }
  }
  return n;
}

const better = (a: Score, b: Score) => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);

/** Edge-fit refinement, kept only while it doesn't lower (agreement, cells). */
function settle(L: Plane, lat: Lattice): { score: Score, lat: Lattice, cells: Set<number> } {
  let cells = gridCells(L, ...lat);
  let best = { score: [agreement(L, cells, lat), cells.size] as Score, lat, cells };
  for (let it = 0; it < 3; it++) {
    // tiles cut off at the image or viewport border can pull the fit away from a good lattice
    const next = edgeFit(L, best.cells, best.lat);
    if (!(next[2] / next[3] > 0.8 && next[2] / next[3] < 1.25)) { break; }
    cells = gridCells(L, ...next);
    const cand = { score: [agreement(L, cells, next), cells.size] as Score, lat: next, cells };
    if (better(best.score, cand.score)) { break; }
    best = cand;
  }
  return best;
}

/**
 * Sub-pixel lattice from full-resolution tile edges of whole tiles: median per column and per row, then a line fit.
 * Icon matching is sensitive to a pixel or two of misplacement, more than the downscaled search resolves.
 */
function refineFull(Lfull: Plane, cells: Array<[number, number]>, [ox, oy, px, py]: Lattice, view: Grid['view']): Lattice {
  // a separator line at the viewport edge is a stronger edge than a dim tile's own, and several pixels thick;
  // a whole tile's edge is at least 0.09 pitch inside the viewport
  const mx = Math.max(2, Math.trunc(0.06 * px)), my = Math.max(2, Math.trunc(0.06 * py));
  const x0 = Math.trunc(view[0]) + mx, y0 = Math.trunc(view[1]) + my;
  const L = crop(Lfull, x0, y0, Math.trunc(view[2]) - mx, Math.trunc(view[3]) - my);
  const ex = new Map<number, number[]>(), ey = new Map<number, number[]>();
  for (const [i, j] of cells) {
    const e = tileEdges(L, ox + i * px - x0, oy + j * py - y0, px, py, true);
    if (!e) { continue; }
    if (e[0] !== null && e[2] > 2) { ex.set(i, [...ex.get(i) ?? [], e[0] + x0]); }
    if (e[1] !== null && e[3] > 2) { ey.set(j, [...ey.get(j) ?? [], e[1] + y0]); }
  }
  const fit = (meas: Map<number, number[]>, o: number, p: number): [number, number] => {
    if (meas.size < 2) { return [o, p]; }
    let K = [...meas.keys()].sort((a, b) => a - b);
    let M = K.map(k => median(meas.get(k)!));
    // a column or row of mostly cut-off tiles can still be off; drop the worst outlier when there are enough
    if (K.length >= 4) {
      const [q, c] = polyfit(K, M);
      const r = K.map((k, n) => Math.abs(M[n] - (c + k * q)));
      const lim = Math.max(1.5, 3 * median(r));
      const keep = r.map(v => v < lim);
      K = K.filter((_, n) => keep[n]); M = M.filter((_, n) => keep[n]);
    }
    if (K.length < 2) { return [o, p]; }
    const [q, c] = polyfit(K, M);
    const km = K.reduce((a, b) => a + b, 0) / K.length;
    // a sanity bound: this refines a found lattice, it doesn't move it to another one
    return Math.abs(q / p - 1) < 0.03 && Math.abs(c + km * q - (o + km * p)) < 0.08 * p ? [c, q] : [o, p];
  };
  [ox, px] = fit(ex, ox, px);
  [oy, py] = fit(ey, oy, py);
  return [ox, oy, px, py];
}

// #endregion

// #region Viewport and tidy

/** Position of the strongest edge in G[lo:hi], or null when there is no clear one. */
function clipEdge(G: Float64Array, lo: number, hi: number): number | null {
  lo = Math.max(lo, 1); hi = Math.min(hi, G.length - 1);
  if (hi <= lo) { return null; }
  let k = lo;
  for (let v = lo; v < hi; v++) { if (G[v] > G[k]) { k = v; } }
  return G[k] > 12 ? k : null;
}

/**
 * The scroll area's edges: straight lines that cross the gaps between tiles along the whole grid.
 * Tile edges stop at the gaps; a clipping edge or separator line runs through them.
 * `centredRow`: a last row half a pitch off the lattice, whose tiles do sit on the column gap lines.
 */
function viewport(Lraw: Plane, cells: Set<number>, [ox, oy, px, py]: Lattice, centredRow?: number): Grid['view'] {
  const { width: w, height: h, data } = Lraw;
  const all = [...cells].map(unkey);
  const I = all.map(c => c[0]), J = all.map(c => c[1]);
  const iMin = Math.min(...I), iMax = Math.max(...I), jMin = Math.min(...J), jMax = Math.max(...J);
  const bounds: Grid['view'] = [0, 0, w, h];
  for (const axis of [0, 1]) {
    const [first, last, p, o, lo, hi, size, len] = axis === 0
      ? [jMin, jMax, py, oy, iMin, iMax, w, h] : [iMin, iMax, px, ox, jMin, jMax, h, w];
    const lp = axis === 0 ? px : py, lo0 = axis === 0 ? ox : oy;
    const lines: number[] = [];
    for (let k = lo - 1; k < hi + 1; k++) {
      const v = rint(lo0 + (k + 0.5) * lp);
      if (v >= 0 && v < size) { lines.push(v); }
    }
    if (lines.length < 3) { continue; }
    // the edge must show in (nearly) every gap line, not just where a backdrop feature crosses a few
    const G = new Float64Array(len);
    const buf = new Float64Array(lines.length);
    for (let t = 1; t < len - 1; t++) {
      lines.forEach((v, n) => buf[n] = axis === 0
        ? Math.abs(data[(t + 1) * w + v] - data[(t - 1) * w + v])
        : Math.abs(data[v * w + t + 1] - data[v * w + t - 1]));
      G[t] = quantile(buf, 0.25);
    }
    const a = clipEdge(G, Math.trunc(o + (first - 1) * p), Math.trunc(o + (first + 0.45) * p));
    const below = axis === 0 && last === centredRow ? 0.5 : -0.45;
    const b = clipEdge(G, Math.trunc(o + (last + below) * p), Math.trunc(o + (last + 1) * p) + 1);
    if (a !== null) { bounds[1 - axis] = a; }
    if (b !== null) { bounds[3 - axis] = b; }
  }
  return bounds;
}

/** The closet is a solid block: drop sparse stray columns/rows, fill enclosed holes (selected tile, dark icons). */
function tidy(input: Set<number>): Set<number> {
  let cells = new Set(input);
  for (const axis of [0, 1]) {
    const counts = new Map<number, number>();
    for (const c of cells) { const v = unkey(c)[axis]; counts.set(v, (counts.get(v) ?? 0) + 1); }
    if (!counts.size) { return new Set(); }
    const med = median([...counts.values()]);
    cells = new Set([...cells].filter(c => counts.get(unkey(c)[axis])! >= 0.4 * med));
  }
  if (!cells.size) { return cells; }
  let changed = true;
  while (changed) {
    changed = false;
    const all = [...cells].map(unkey);
    const I = all.map(c => c[0]), J = all.map(c => c[1]);
    for (let i = Math.min(...I); i <= Math.max(...I); i++) {
      for (let j = Math.min(...J); j <= Math.max(...J); j++) {
        if (cells.has(key(i, j))) { continue; }
        if ((cells.has(key(i - 1, j)) && cells.has(key(i + 1, j))) || (cells.has(key(i, j - 1)) && cells.has(key(i, j + 1)))) {
          cells.add(key(i, j)); changed = true;
        }
      }
    }
  }
  return largestGroup(cells);
}

/**
 * A tab centres its short last row, so when the number of free columns is odd that row sits half a pitch off
 * the lattice. Returns the row with its cells (centred at i + 0.5) when a centred run of whole tiles passes the
 * tile test there and has its icons better centred than the cells passing on the lattice.
 */
function centredLastRow(L: Plane, S: Plane, cells: Array<[number, number]>, [ox, oy, px, py]: Lattice, bounds: Grid['view']): { j: number, cells: Array<[number, number]> } | null {
  const I = cells.map(c => c[0]), J = cells.map(c => c[1]);
  const iMin = Math.min(...I), iMax = Math.max(...I), jMax = Math.max(...J);
  const cols = iMax - iMin + 1;
  if (cols < 2 || new Set(J).size < 2) { return null; }
  const whole = (cx: number, cy: number) =>
    bounds[0] <= cx - 0.42 * px && cx + 0.42 * px <= bounds[2] && bounds[1] <= cy - 0.42 * py && cy + 0.42 * py <= bounds[3];
  const buf = new Float64Array(8);
  for (const j of [jMax, jMax + 1]) {
    const onLattice = cells.filter(c => c[1] === j).map(([i]) => key(i, j));
    if (onLattice.length === cols) { continue; }
    const cy = oy + j * py;
    const shifted: Array<number> = [];
    for (let i = iMin; i < iMax; i++) {
      const cx = ox + (i + 0.5) * px;
      if (whole(cx, cy) && tileContrast(L, cx, cy, px, py, buf) > 0) { shifted.push(i); }
    }
    if (!shifted.length || shifted.length < onLattice.length) { continue; }
    const lo = shifted[0], hi = shifted[shifted.length - 1];
    if (hi - lo + 1 !== shifted.length || lo - iMin !== iMax - 1 - hi) { continue; }
    // bright icons on the gap sample points can pass cells between the shifted tiles too; icon placement can't
    const placement = centredScore(S, new Set(shifted.map(i => key(i, j))), ox + px / 2, oy, px, py) / shifted.length;
    const latticePlacement = onLattice.length ? centredScore(S, new Set(onLattice), ox, oy, px, py) / onLattice.length : 0;
    if (placement <= latticePlacement) { continue; }
    return { j, cells: shifted.map(i => [i, j]) };
  }
  return null;
}

// #endregion

function iconMask(small: Uint8ClampedArray, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = small[i * 4], g = small[i * 4 + 1], b = small[i * 4 + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = (mx - mn) / Math.max(mx, 1);
    const warm = r >= g - 8 && r >= b - 8;
    out[i] = mx > 95 && (warm || sat > 0.4) ? 1 : 0;
  }
  return out;
}

/**
 * Closet grid in full-resolution pixels, or null when no grid is found.
 * `hint` from another screenshot of the same batch narrows the search to the vertical offset.
 */
export function locateGrid(img: RgbaImage, hint?: GridHint): Grid | null {
  const { width: w, height: h } = img;
  const f = Math.min(1, MAX_SIDE / Math.max(w, h));
  const sw = Math.trunc(w * f), sh = Math.trunc(h * f);
  const small = resample(img.data, w, h, 4, sw, sh, BILINEAR);
  const Lraw = luminance({ width: sw, height: sh, data: small });
  const L = box5(Lraw);
  const S = integral(iconMask(small, sw, sh), sw, sh);

  let best: ReturnType<typeof settle> | undefined;
  const candidates = hint ? [[hint.px * f, hint.py * f]] : pitchCandidates(L);
  for (const [cpx, cpy] of candidates) {
    const oxFixed = hint ? (((hint.ox * f) % cpx) + cpx) % cpx : undefined;
    for (const [ox, oy] of fitOffsets(L, S, cpx, cpy, oxFixed)) {
      const s = settle(L, [ox, oy, cpx, cpy]);
      if (s.cells.size && (!best || better(s.score, best.score))) { best = s; }
    }
  }
  if (!best) { return null; }
  let [ox, oy, px, py] = best.lat;
  const tidied = tidy(best.cells);
  if (!tidied.size) { return null; }
  const centred = centredLastRow(L, S, [...tidied].map(unkey), best.lat, [0, 0, sw, sh]);
  const shiftOf = (j: number) => j === centred?.j ? 0.5 : 0;
  const found = new Set(tidied);
  if (centred) {
    tidied.forEach(k => { if (unkey(k)[1] === centred.j) { found.delete(k); } });
    centred.cells.forEach(([i, j]) => found.add(key(i, j)));
  }
  const [vx0, vy0, vx1, vy1] = viewport(Lraw, found, best.lat, centred?.j);
  // rows or columns centred outside the viewport are slivers at best
  const cells = [...found].map(unkey).filter(([i, j]) => {
    const cx = ox + (i + shiftOf(j)) * px, cy = oy + j * py;
    return vx0 <= cx && cx < vx1 && vy0 <= cy && cy < vy1;
  });
  if (!cells.length) { return null; }
  const view: Grid['view'] = [vx0 / f, vy0 / f, vx1 >= sw ? w : vx1 / f, vy1 >= sh ? h : vy1 / f];
  [ox, oy, px, py] = [ox / f, oy / f, px / f, py / f];
  // a cut-off tile's missing edge gets measured at the clip line instead
  const whole = cells.filter(([i, j]) => !shiftOf(j) &&
    view[0] <= ox + (i - 0.5) * px && ox + (i + 0.5) * px <= view[2] &&
    view[1] <= oy + (j - 0.5) * py && oy + (j + 0.5) * py <= view[3]);
  [ox, oy, px, py] = refineFull(box5(luminance(img)), whole, [ox, oy, px, py], view);
  const rowOffset: Grid['rowOffset'] = {};
  if (centred && cells.some(c => c[1] === centred.j)) { rowOffset[centred.j] = px / 2; }
  cells.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return { px, py, ox, oy, rowOffset, cells, view };
}
