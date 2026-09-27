import type { Grid } from './grid';

/** Quick-pass matches below this get a full re-score; only matches at least this good bound a 'not owned' range. */
export const SURE = 0.9;

export interface TileMatch {
  cell: [number, number];
  /** Index into the reference set, or null when the tile needs the user. */
  item: number | null;
  score: number;
  /** Assigned by item order rather than by the image. */
  forced: boolean;
  /** Item index range [lo, hi) allowed by the neighbouring matches. */
  window: [number, number];
  /** Best items in the window with their scores, only for unknown tiles. */
  candidates: Array<[number, number]>;
  /** For a matched ongoing item: whether the tile looks owned rather than a dimmed preview. */
  looksOwned?: boolean;
}

export interface ScreenshotMatch {
  grid: Grid;
  tiles: Array<TileMatch>;
  /** Tiles cut off by the image or viewport; they should appear in an overlapping screenshot. */
  partial: number;
  timing: { grid: number, match: number };
}

export interface BatchResult {
  owned: Array<number>;
  checklist: Array<{ item: number, looksOwned: boolean }>;
  ask: Array<{ shot: number, cell: [number, number], window: [number, number], candidates: Array<number> }>;
  gaps: Array<number>;
}

/**
 * Combines the screenshots of one batch: owned items, the ongoing checklist, tiles to ask about,
 * and items to offer as 'not owned' because they're missing inside a range the screenshots cover.
 */
export function combineBatch(shots: Array<ScreenshotMatch | null>, ongoing: ArrayLike<boolean | number>): BatchResult {
  const matched = new Map<number, TileMatch>();
  const ask: BatchResult['ask'] = [];
  const coverage: Array<[number, number]> = [];
  shots.forEach((shot, s) => {
    if (!shot) { return; }
    // 'not owned' is only inferred between confident matches: a weak end match must not stretch the range
    const anchors = shot.tiles.filter(t => t.item !== null && !t.forced && t.score >= SURE).map(t => t.item!);
    if (anchors.length) { coverage.push([Math.min(...anchors), Math.max(...anchors)]); }
    for (const t of shot.tiles) {
      if (t.item === null) {
        ask.push({ shot: s, cell: t.cell, window: t.window, candidates: t.candidates.map(c => c[0]) });
      } else if (!matched.has(t.item)) {
        matched.set(t.item, t);
      }
    }
  });

  const owned: Array<number> = [], checklist: BatchResult['checklist'] = [];
  for (const [item, t] of [...matched].sort((a, b) => a[0] - b[0])) {
    if (ongoing[item]) { checklist.push({ item, looksOwned: !!t.looksOwned }); } else { owned.push(item); }
  }
  // overlapping screenshots merge into one covered range
  const merged: Array<[number, number]> = [];
  for (const [lo, hi] of coverage.sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    const last = merged[merged.length - 1];
    if (last && lo <= last[1]) { last[1] = Math.max(last[1], hi); } else { merged.push([lo, hi]); }
  }
  const unsure = new Set(ask.flatMap(a => a.candidates));
  const gaps: Array<number> = [];
  for (const [lo, hi] of merged) {
    for (let r = lo; r <= hi; r++) { if (!matched.has(r) && !unsure.has(r)) { gaps.push(r); } }
  }
  return { owned, checklist, ask, gaps };
}
