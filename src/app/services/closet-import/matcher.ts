import { RgbaImage } from './image';
import { GridHint, locateGrid } from './grid';
import { IconFeatures, N, NN, extractIcon, iconFeatures } from './icon';
import {
  FIT_FLOOR, RELAX_MARGIN, RELAX_MAX, SURE, ScreenshotMatch, TileMatch, align, relaxedPicks, relaxedSure, windowGroups, windows
} from './batch';

/** Quick-pass matches below SURE, or closer than this to the runner-up, get a full re-score. */
const WEAK_MARGIN = 0.03;
/** Candidates kept per unknown tile: more than are shown, since the batch drops items settled elsewhere. */
const CANDIDATES = 10;
const HN = N / 2;

/** Reference features for one item type, sorted by item order. */
export interface ReferenceSet {
  count: number;
  ongoing: Uint8Array;
  aspect: Float64Array;
  lum: Float64Array;
  sat: Float64Array;
  /** Full-resolution features, 4 x N x N per item. */
  full: Float32Array;
  /** Centred sum of squares per item and channel. */
  fullSS: Float64Array;
  /** Features subsampled to N/2, 4 x N/2 x N/2 per item. */
  quick: Float32Array;
  quickSS: Float64Array;
}

// #region References

function subsample(f: Float32Array, out: Float32Array, offset: number): void {
  for (let c = 0; c < 4; c++) {
    for (let y = 0; y < HN; y++) {
      for (let x = 0; x < HN; x++) { out[offset + c * HN * HN + y * HN + x] = f[c * NN + 2 * y * N + 2 * x]; }
    }
  }
}

/** Centred sum of squares per channel. */
function channelSS(f: Float32Array, offset: number, n: number, out: Float64Array, outOffset: number): void {
  for (let c = 0; c < 4; c++) {
    let s = 0, ss = 0;
    for (let k = 0; k < n; k++) { const v = f[offset + c * n + k]; s += v; ss += v * v; }
    out[outOffset + c] = ss - s * s / n;
  }
}

export function buildReferenceSet(features: Array<IconFeatures>, ongoing: Array<boolean>): ReferenceSet {
  const count = features.length;
  const set: ReferenceSet = {
    count,
    ongoing: Uint8Array.from(ongoing, v => v ? 1 : 0),
    aspect: Float64Array.from(features, f => f.aspect),
    lum: Float64Array.from(features, f => f.lum),
    sat: Float64Array.from(features, f => f.sat),
    full: new Float32Array(count * 4 * NN),
    fullSS: new Float64Array(count * 4),
    quick: new Float32Array(count * 4 * HN * HN),
    quickSS: new Float64Array(count * 4)
  };
  features.forEach((f, r) => {
    set.full.set(f.f, r * 4 * NN);
    channelSS(set.full, r * 4 * NN, NN, set.fullSS, r * 4);
    subsample(f.f, set.quick, r * 4 * HN * HN);
    channelSS(set.quick, r * 4 * HN * HN, HN * HN, set.quickSS, r * 4);
  });
  return set;
}

// #endregion

// #region Scoring

/** Tile features with each channel's mean removed, and their sums of squares. */
function centre(f: Float32Array, n: number): { c: Float64Array, ss: Float64Array } {
  const c = new Float64Array(4 * n), ss = new Float64Array(4);
  for (let ch = 0; ch < 4; ch++) {
    let m = 0;
    for (let k = 0; k < n; k++) { m += f[ch * n + k]; }
    m /= n;
    for (let k = 0; k < n; k++) { const v = f[ch * n + k] - m; c[ch * n + k] = v; ss[ch] += v * v; }
  }
  return { c, ss };
}

/**
 * NCC of a centred tile against one reference: per channel for alpha and luminance, jointly over the two
 * chroma channels so a near-flat chroma doesn't blow up. Returns [colour, shape, chroma].
 */
function ncc(tile: Float64Array, tss: Float64Array, refs: Float32Array, rss: Float64Array, r: number, n: number): [number, number, number] {
  const o = r * 4 * n;
  const num = [0, 0, 0, 0];
  for (let ch = 0; ch < 4; ch++) {
    let s = 0;
    for (let k = 0; k < n; k++) { s += tile[ch * n + k] * refs[o + ch * n + k]; }
    num[ch] = s;
  }
  const a = num[0] / (Math.sqrt(tss[0] * rss[r * 4]) + 1e-9);
  const l = num[1] / (Math.sqrt(tss[1] * rss[r * 4 + 1]) + 1e-9);
  const c = (num[2] + num[3]) / (Math.sqrt((tss[2] + tss[3]) * (rss[r * 4 + 2] + rss[r * 4 + 3])) + 1e-9);
  return [0.35 * a + 0.3 * l + 0.35 * c, 0.5 * a + 0.5 * l, c];
}

const aspectPenalty = (refs: ReferenceSet, r: number, aspect: number) => 0.5 * Math.abs(Math.log(refs.aspect[r] / aspect));

/** Half resolution, no shift search. Ongoing items may also match on shape (previews are recoloured). */
function quickScores(tile: IconFeatures, refs: ReferenceSet): Float64Array {
  const sub = new Float32Array(4 * HN * HN);
  subsample(tile.f, sub, 0);
  const { c, ss } = centre(sub, HN * HN);
  const out = new Float64Array(refs.count);
  for (let r = 0; r < refs.count; r++) {
    const [colour, shape] = ncc(c, ss, refs.quick, refs.quickSS, r, HN * HN);
    out[r] = (refs.ongoing[r] ? Math.max(colour, shape - 0.03) : colour) - aspectPenalty(refs, r, tile.aspect);
  }
  return out;
}

/** Tile features shifted by (dx, dy) with wrap-around. */
function roll(f: Float32Array, dx: number, dy: number): Float32Array {
  const out = new Float32Array(4 * NN);
  for (let ch = 0; ch < 4; ch++) {
    for (let y = 0; y < N; y++) {
      const sy = (y - dy + N) % N;
      for (let x = 0; x < N; x++) { out[ch * NN + y * N + x] = f[ch * NN + sy * N + (x - dx + N) % N]; }
    }
  }
  return out;
}

/**
 * Full resolution, best over +-1 px shifts. Any icon may differ in colour from its reference (previews,
 * variant or outdated wiki colours), so every item can also compete on shape; the penalty keeps colour
 * decisive whenever colour agrees. Items marked in `done` are skipped; scored items are marked.
 */
function fullScores(tile: IconFeatures, refs: ReferenceSet, lo: number, hi: number, out: Float64Array, done: Uint8Array): void {
  while (lo < hi && done[lo]) { lo++; }
  if (lo >= hi) { return; }
  const shifted = [];
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) { shifted.push(centre(roll(tile.f, dx, dy), NN)); }
  }
  for (let r = lo; r < hi; r++) {
    if (done[r]) { continue; }
    done[r] = 1;
    let colour = -9, shape = -9;
    for (const { c, ss } of shifted) {
      const s = ncc(c, ss, refs.full, refs.fullSS, r, NN);
      colour = Math.max(colour, s[0]); shape = Math.max(shape, s[1]);
    }
    out[r] = Math.max(colour, shape - (refs.ongoing[r] ? 0.03 : 0.05)) - aspectPenalty(refs, r, tile.aspect);
  }
}

/** Pre-fill for the ongoing checklist: previews are dimmed and recoloured versions of the icon. */
function looksOwned(tile: IconFeatures, refs: ReferenceSet, r: number): boolean {
  const { c, ss } = centre(tile.f, NN);
  const chroma = ncc(c, ss, refs.full, refs.fullSS, r, NN)[2];
  const ratio = tile.lum / Math.max(refs.lum[r], 1);
  return !((tile.sat < 0.06 && refs.sat[r] > 0.15) || ratio < 0.6 || chroma < 0.2);
}

// #endregion

// #region Order

/** Full-resolution scores for tile `n` against items [lo, hi), in place of any quick scores left there. */
type Rescore = (n: number, lo: number, hi: number) => void;

const sureByScore = (t: TileMatch) => t.item !== null && !t.forced && !t.relaxed && t.score >= SURE;

/** Best items in [lo, hi) with their scores, best first. */
function ranked(scores: Float64Array, lo: number, hi: number): Array<[number, number]> {
  return Array.from({ length: hi - lo }, (_, k) => [lo + k, scores[lo + k]] as [number, number])
    .sort((a, b) => b[1] - a[1]).slice(0, CANDIDATES);
}

/**
 * Matches unknown tiles whose window holds at most RELAX_MAX items and lies between two matches sure by score,
 * at a threshold lowered for the window size. Relaxed tiles don't bound other windows.
 */
function relaxWindows(out: Array<TileMatch>, S: Array<Float64Array>, rescore: Rescore): void {
  const anchor = (r: number) => out.some(t => t.item === r && sureByScore(t));
  for (const ns of windowGroups(out)) {
    const [lo, hi] = out[ns[0]].window;
    const w = hi - lo;
    // an open edge proves nothing, and a weak bound may be wrong
    if (w < 1 || w > RELAX_MAX || !anchor(lo - 1) || !anchor(hi)) { continue; }
    ns.forEach(n => rescore(n, lo, hi));
    const rows = ns.map(n => S[n].subarray(lo, hi));
    relaxedPicks(rows, w).forEach((p, k) => {
      if (p === null) { return; }
      const t = out[ns[k]];
      t.item = lo + p;
      t.score = rows[k][p];
      t.relaxed = true;
      t.candidates = ranked(S[ns[k]], lo, hi);
    });
  }
}

/**
 * Sure: scored at least SURE, or between two such matches in a window that leaves few other items. When the window
 * holds exactly as many items as tiles, order decides and the score only has to reach FIT_FLOOR; otherwise, up to
 * RELAX_MAX items, the match must reach relaxedSure and beat the window's runner-up by RELAX_MARGIN. Promoted tiles
 * don't anchor other runs.
 */
function markSure(out: Array<TileMatch>, S: Array<Float64Array>, R: number, rescore: Rescore): void {
  const anchor = out.map(sureByScore);
  const wins = windows(out.map((t, n) => anchor[n] ? t.item : null), R);
  for (let n = 0; n < out.length;) {
    let e = n + 1;
    if (anchor[n]) { out[n].sure = true; n = e; continue; }
    while (e < out.length && !anchor[e]) { e++; }
    const [lo, hi] = wins[n], w = hi - lo;
    // lo > 0 and hi < R only with an anchor on both sides
    for (let k = n; k < e && lo > 0 && hi < R; k++) {
      const t = out[k];
      if (t.item === null) { continue; }
      if (w === e - n) {
        rescore(k, t.item, t.item + 1);
        t.score = S[k][t.item];
        t.sure = t.item === lo + k - n && t.score >= FIT_FLOOR;
      } else if (w <= RELAX_MAX && !t.forced) {
        rescore(k, lo, hi);
        t.score = S[k][t.item];
        let rival = -Infinity;
        for (let r = lo; r < hi; r++) { if (r !== t.item) { rival = Math.max(rival, S[k][r]); } }
        t.sure = t.score >= relaxedSure(w) && t.score - rival >= RELAX_MARGIN;
      }
    }
    n = e;
  }
}

// #endregion

/**
 * Grid -> quick scores -> order alignment -> full re-score of unknown or weak tiles within their order window
 * -> re-align -> assign runs of unknown tiles by order -> relax narrow windows -> confidence. Returns null when no
 * closet grid is found.
 * `hint`: the grid of another screenshot in the same batch.
 */
export function matchScreenshot(img: RgbaImage, refs: ReferenceSet, hint?: GridHint): ScreenshotMatch | null {
  let grid = locateGrid(img, hint);
  // different device or UI scale: fall back to a full search
  if (hint && (!grid || grid.cells.length < 4)) { grid = locateGrid(img); }
  if (!grid) { return null; }

  const tiles: Array<{ cell: [number, number], f: IconFeatures }> = [];
  for (const [i, j] of grid.cells) {
    const ex = extractIcon(img, grid, i, j);
    const f = iconFeatures(ex.icon);
    if (!f) { continue; }
    // a cut-off tile is expected to be whole in another screenshot
    if (ex.partial) { continue; }
    tiles.push({ cell: [i, j], f });
  }

  const R = refs.count;
  const S = tiles.map(t => quickScores(t.f, refs));
  const done = tiles.map(() => new Uint8Array(R));
  const rescore: Rescore = (n, lo, hi) => fullScores(tiles[n].f, refs, lo, hi, S[n], done[n]);
  let path = align(S, R);
  // full-quality re-score only where the quick pass is unsure, and only against the order window
  windows(path, R).forEach(([lo, hi], t) => {
    const p = path[t];
    const sorted = Float64Array.from(S[t]).sort();
    const margin = R > 1 ? sorted[R - 1] - sorted[R - 2] : Infinity;
    if (p !== null && margin >= WEAK_MARGIN && S[t][p] >= SURE) { return; }
    if (p !== null) { lo = Math.min(lo, p); hi = Math.max(hi, p + 1); }
    rescore(t, lo, hi);
  });
  path = align(S, R);
  const wins = windows(path, R);

  const out: Array<TileMatch> = tiles.map((t, n) => ({
    cell: t.cell,
    item: path[n],
    score: path[n] !== null ? S[n][path[n]!] : 0,
    sure: false,
    forced: false,
    relaxed: false,
    window: wins[n],
    candidates: []
  }));

  // consecutive unknown tiles sharing a window with exactly that many items can only be those items
  for (const ns of windowGroups(out)) {
    const [lo, hi] = out[ns[0]].window;
    // only between two matches: at a screenshot edge the window is open-ended and proves nothing
    const bounded = out.some(t => t.item === lo - 1) && out.some(t => t.item === hi);
    if (!bounded || hi - lo !== ns.length) { continue; }
    ns.forEach((n, k) => { out[n].item = lo + k; out[n].score = S[n][lo + k]; out[n].forced = true; });
  }
  relaxWindows(out, S, rescore);
  markSure(out, S, R, rescore);

  out.forEach((t, n) => {
    if (t.item === null) {
      // the second alignment can widen a window past what the first re-scored
      const [lo, hi] = t.window;
      rescore(n, lo, hi);
      t.candidates = ranked(S[n], lo, hi);
    } else if (refs.ongoing[t.item]) {
      t.looksOwned = looksOwned(tiles[n].f, refs, t.item);
    }
  });

  return { grid, tiles: out };
}
