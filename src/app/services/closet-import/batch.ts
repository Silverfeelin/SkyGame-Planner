import type { Grid } from './grid';

/** Score an 'unknown' tile is worth; below this a match is not trusted. */
export const TAU = 0.7;
/** Quick-pass matches below this get a full re-score; only matches at least this good bound a 'not owned' range. */
export const SURE = 0.9;
/** Order windows of up to this many items lower both thresholds. */
export const RELAX_MAX = 12;
/** Match threshold for a window of 2 items. */
const TAU_LOW = 0.45;
/** A match accepted because of its window must beat the window's runner-up by this much. */
export const RELAX_MARGIN = 0.05;
/** An exact order fit scoring below this suggests a missing reference or a wrong anchor instead. */
export const FIT_FLOOR = 0.4;
/** Cost per item skipped between consecutive matches. */
const SKIP = 0.003;
/** Candidates offered per tile that needs the user. */
const SHOWN = 5;
/**
 * A screenshot with a smaller share of confident tiles likely shows another tab. On the fixtures the right tab
 * scores 0.9 or more and a wrong one at most 0.02, even outfits against outfits with shoes.
 */
export const OFF_TAB = 0.25;

/** From `low` at 2 items to `high` at RELAX_MAX, linear in log w: each item ruled out lowers the bar. */
function byWindow(w: number, low: number, high: number): number {
  const k = Math.min(1, Math.max(0, Math.log(w / 2) / Math.log(RELAX_MAX / 2)));
  return low + (high - low) * k;
}
/** Match threshold for a tile whose order window holds `w` items. */
export const relaxedTau = (w: number) => byWindow(w, TAU_LOW, TAU);
/** Confidence threshold for a match whose order window holds `w` items. */
export const relaxedSure = (w: number) => byWindow(w, TAU, SURE);

export interface TileMatch {
  cell: [number, number];
  /** Index into the reference set, or null when the tile needs the user. */
  item: number | null;
  score: number;
  /** Matched confidently: by score, or because its order window leaves little else. */
  sure: boolean;
  /** Assigned by item order rather than by the image. */
  forced: boolean;
  /** Matched below the usual threshold because its order window leaves few items. */
  relaxed: boolean;
  /** Item index range [lo, hi) allowed by the neighbouring matches. */
  window: [number, number];
  /** Best items in the window with their scores, best first, only for unknown and relaxed tiles. */
  candidates: Array<[number, number]>;
  /** For a matched ongoing item: whether the tile looks owned rather than a dimmed preview. */
  looksOwned?: boolean;
}

export interface ScreenshotMatch {
  grid: Grid;
  tiles: Array<TileMatch>;
  /** Tiles cut off by the image or viewport; they should be whole in another screenshot. */
  partial: number;
  timing: { grid: number, match: number };
}

export interface BatchResult {
  owned: Array<number>;
  /** Owned items that no screenshot matched confidently: forced by order, scored below SURE or accepted by a narrow window. */
  weak: Array<number>;
  checklist: Array<{ item: number, looksOwned: boolean }>;
  /** `window`: the items the tile can still be, in order; `candidates`: the best of those. */
  ask: Array<{ shot: number, cell: [number, number], window: Array<number>, candidates: Array<number> }>;
  gaps: Array<number>;
  /** Screenshots in which few tiles matched confidently. */
  offTab: Array<number>;
}

// #region Alignment

/**
 * Best strictly increasing assignment of tiles to items; a tile may be unknown (null) at score `tau`.
 * Each item skipped between two consecutive matches costs SKIP: a weak match far away should not beat
 * a plausible one nearby, while a strong match easily pays for a real gap.
 */
export function align(S: Array<ArrayLike<number>>, R: number, tau = TAU): Array<number | null> {
  const T = S.length;
  const NEG = -1e9;
  // state 0: nothing matched yet; state r+1: last match is item r
  let f = new Float64Array(R + 1).fill(NEG);
  f[0] = 0;
  const choice = Array.from({ length: T }, () => new Int32Array(R + 1));
  for (let t = 0; t < T; t++) {
    const g = f.map(v => v + tau);
    const ch = choice[t].fill(-1);
    let m = NEG, arg = 0;
    for (let r2 = 0; r2 < R; r2++) {
      // best previous match r < r2, paying for the items skipped in between
      const fromPrev = m - SKIP * r2;
      const [cand, src] = fromPrev >= f[0] ? [fromPrev, arg] : [f[0], 0];
      if (cand + S[t][r2] > g[r2 + 1]) { g[r2 + 1] = cand + S[t][r2]; ch[r2 + 1] = src; }
      const adj = f[r2 + 1] + SKIP * r2;
      if (adj > m) { m = adj; arg = r2 + 1; }
    }
    f = g;
  }
  let state = 0;
  for (let s = 1; s <= R; s++) { if (f[s] > f[state]) { state = s; } }
  const path: Array<number | null> = new Array(T).fill(null);
  for (let t = T - 1; t >= 0; t--) {
    const c = choice[t][state];
    if (c !== -1) { path[t] = state - 1; state = c; }
  }
  return path;
}

/** For each tile, the item index range [lo, hi) allowed by its aligned neighbours. */
export function windows(path: Array<number | null>, R: number): Array<[number, number]> {
  return path.map((_, t) => {
    let lo = 0, hi = R;
    for (let k = t - 1; k >= 0; k--) { if (path[k] !== null) { lo = path[k]! + 1; break; } }
    for (let k = t + 1; k < path.length; k++) { if (path[k] !== null) { hi = path[k]!; break; } }
    return [lo, hi];
  });
}

/** Indices of the unknown tiles, grouped by window; a group's tiles are consecutive. */
export function windowGroups(tiles: Array<TileMatch>): Array<Array<number>> {
  const groups = new Map<string, Array<number>>();
  tiles.forEach((t, n) => {
    if (t.item === null) {
      const k = t.window.join();
      groups.set(k, [...groups.get(k) ?? [], n]);
    }
  });
  return [...groups.values()];
}

/**
 * Aligns tiles to the `w` items their window leaves, at a threshold lowered for that count. A pick must also beat
 * the tile's best other item by RELAX_MARGIN: a low score is fine, a toss-up is not.
 * `rows[k][i]`: tile k against item i; `rivals[k]`: scores of items tile k may be that aren't candidates.
 */
export function relaxedPicks(rows: Array<ArrayLike<number>>, w: number, rivals: Array<Array<number>> = []): Array<number | null> {
  return align(rows, w, relaxedTau(w)).map((p, k) => {
    if (p === null) { return null; }
    let best = Math.max(-Infinity, ...(rivals[k] ?? []));
    for (let i = 0; i < w; i++) { if (i !== p) { best = Math.max(best, rows[k][i]); } }
    return rows[k][p] - best >= RELAX_MARGIN ? p : null;
  });
}

// #endregion

/**
 * Combines the screenshots of one closet tab, in any order: owned items, the ongoing checklist, tiles to ask about,
 * and items to offer as 'not owned' because they're missing inside a range that a screenshot covers confidently.
 * Screenshots don't need to overlap; every row only has to be whole in one of them.
 * `unlocked`: items owned before the import. They're never asked about or offered as 'not owned'.
 */
export function combineBatch(shots: Array<ScreenshotMatch | null>, ongoing: ArrayLike<boolean | number>, unlocked: ArrayLike<boolean | number> = []): BatchResult {
  const R = ongoing.length;
  // null: matched only after narrowing across screenshots
  const matched = new Map<number, TileMatch | null>();
  const sure = new Set<number>();
  const coverage: Array<[number, number]> = [];
  shots.forEach(shot => {
    if (!shot) { return; }
    // 'not owned' is only inferred between confident matches: a weak end match must not stretch the range
    const anchors = shot.tiles.filter(t => t.item !== null && t.sure).map(t => t.item!);
    anchors.forEach(r => sure.add(r));
    if (anchors.length) { coverage.push([Math.min(...anchors), Math.max(...anchors)]); }
    for (const t of shot.tiles) {
      if (t.item !== null && !matched.has(t.item)) { matched.set(t.item, t); }
    }
  });

  // an unknown tile can't be an item another screenshot shows confidently; a tile that can only be an item
  // unlocked before is that item and needs no answer, while one other candidate left is still worth asking
  const settled = (r: number) => sure.has(r) || !!unlocked[r];
  const ask: BatchResult['ask'] = [];
  shots.forEach((shot, s) => {
    if (!shot) { return; }
    for (const group of windowGroups(shot.tiles)) {
      const picks = narrowAcrossShots(shot, group, sure, R);
      group.forEach((n, k) => {
        const pick = picks[k];
        if (pick !== null) {
          if (!matched.has(pick)) { matched.set(pick, null); }
          return;
        }
        const tile = shot.tiles[n];
        const candidates = tile.candidates.map(c => c[0]).filter(r => !settled(r)).slice(0, SHOWN);
        if (!candidates.length) { return; }
        const [lo, hi] = tile.window;
        const window = Array.from({ length: hi - lo }, (_, i) => lo + i).filter(r => !settled(r));
        ask.push({ shot: s, cell: tile.cell, window, candidates });
      });
    }
  });

  const owned: Array<number> = [], weak: Array<number> = [], checklist: BatchResult['checklist'] = [];
  for (const [item, t] of [...matched].sort((a, b) => a[0] - b[0])) {
    if (ongoing[item]) {
      checklist.push({ item, looksOwned: !!t?.looksOwned });
    } else {
      owned.push(item);
      if (!sure.has(item)) { weak.push(item); }
    }
  }
  // ranges of different screenshots may overlap; merged, each item is still inside some screenshot's range
  const merged: Array<[number, number]> = [];
  for (const [lo, hi] of coverage.sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    const last = merged[merged.length - 1];
    if (last && lo <= last[1]) { last[1] = Math.max(last[1], hi); } else { merged.push([lo, hi]); }
  }
  const unsure = new Set(ask.flatMap(a => a.candidates));
  const gaps: Array<number> = [];
  for (const [lo, hi] of merged) {
    for (let r = lo; r <= hi; r++) { if (!matched.has(r) && !unsure.has(r) && !unlocked[r]) { gaps.push(r); } }
  }
  const offTab = shots.flatMap((shot, s) => shot?.tiles.length && shot.tiles.filter(t => t.sure).length < OFF_TAB * shot.tiles.length ? [s] : []);
  return { owned, weak, checklist, ask, gaps, offTab };
}

/**
 * Items for a group of unknown tiles once the items other screenshots show confidently leave only a few in their
 * window. Requires window edges in this screenshot that are confident matches or the ends of the list. Items left
 * out still count as rivals: in overlapping screenshots the tile may be one of them.
 */
function narrowAcrossShots(shot: ScreenshotMatch, group: Array<number>, sure: ReadonlySet<number>, R: number): Array<number | null> {
  const none = group.map(() => null);
  const [lo, hi] = shot.tiles[group[0]].window;
  const edge = (r: number) => r < 0 || r >= R || shot.tiles.some(t => t.item === r && t.sure);
  if (!edge(lo - 1) || !edge(hi)) { return none; }
  const left = Array.from({ length: hi - lo }, (_, i) => lo + i).filter(r => !sure.has(r));
  // with nothing ruled out, the matcher already tried this window
  if (!left.length || left.length === hi - lo || left.length > RELAX_MAX) { return none; }
  const scores = group.map(n => new Map(shot.tiles[n].candidates));
  // candidates are the best of the window, so an item not among them scores at most the last one
  const bound = (m: Map<number, number>) => m.size < hi - lo ? Math.min(...m.values()) : -Infinity;
  const rows = scores.map(m => left.map(r => m.get(r) ?? bound(m)));
  const rivals = scores.map(m => [...m].filter(([r]) => sure.has(r)).map(([, v]) => v));
  return relaxedPicks(rows, left.length, rivals).map((p, k) => p !== null && scores[k].has(left[p]) ? left[p] : null);
}
